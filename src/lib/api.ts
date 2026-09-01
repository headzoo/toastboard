import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  type DocumentData,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { compressGuestPhoto } from "./compress.ts";
import { makeEventSlug, randomToken, sanitizeText, sha256Hex } from "./crypto.ts";
import { db, functions, storage } from "./firebase.ts";
import {
  getEventCopy,
  normalizeEventType,
  type EventType,
} from "./eventTypes.ts";
import { DEFAULT_SIGN_THEME, getSignTheme, type SignThemeId } from "./signThemes.ts";
import type { EventRecord, MessageRecord, VideoStatus } from "./types.ts";

export const DEMO_SLUG = "maya-james-k8n2w4p9qx";

const MAX_NAME = 80;
const MAX_TEXT = 1000;
const MAX_WELCOME = 500;
export const MAX_PHOTOS = 10;
export const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

const SUPPORTED_VIDEO_FORMATS = [
  { extension: "mp4", contentType: "video/mp4" },
  { extension: "mov", contentType: "video/quicktime" },
  { extension: "webm", contentType: "video/webm" },
  { extension: "m4v", contentType: "video/x-m4v" },
  { extension: "3gp", contentType: "video/3gpp" },
] as const;

export type SupportedVideoFormat = (typeof SUPPORTED_VIDEO_FORMATS)[number];

type CreatedEvent = {
  slug: string;
  hostToken: string;
  signTheme: SignThemeId;
};

export async function createEvent(input: {
  eventType: EventType;
  coupleNames: string;
  eventDate: string;
  welcomeMessage: string;
  themeColor: string;
}): Promise<CreatedEvent> {
  const eventType = normalizeEventType(input.eventType);
  const copy = getEventCopy(eventType);
  const coupleNames = sanitizeText(input.coupleNames, 120);
  if (!coupleNames) throw new Error(copy.displayNameRequiredError);

  const hostToken = randomToken(32);
  const hostTokenHash = await sha256Hex(hostToken);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const slug = makeEventSlug(coupleNames);
    const eventRef = doc(db, "events", slug);
    const payload: DocumentData = {
      coupleNames,
      eventType,
      createdAt: serverTimestamp(),
      signTheme: DEFAULT_SIGN_THEME,
    };
    if (input.eventDate) {
      payload.eventDate = Timestamp.fromDate(new Date(`${input.eventDate}T12:00:00`));
    }
    const welcome = sanitizeText(input.welcomeMessage, MAX_WELCOME);
    if (welcome) payload.welcomeMessage = welcome;
    if (/^#[0-9A-Fa-f]{6}$/.test(input.themeColor)) {
      payload.themeColor = input.themeColor;
    }

    const batch = writeBatch(db);
    batch.set(eventRef, payload);
    batch.set(doc(db, "events", slug, "secrets", "host"), { hostTokenHash });

    try {
      await batch.commit();
      return { slug, hostToken, signTheme: DEFAULT_SIGN_THEME };
    } catch (error) {
      if (attempt === 5) throw toFriendlyError(error, "Couldn’t create the guestbook. Please try again.");
    }
  }

  throw new Error("Couldn’t create the guestbook. Please try again.");
}

export async function getEvent(slug: string): Promise<EventRecord | null> {
  const snap = await getDoc(doc(db, "events", slug));
  if (!snap.exists()) return null;
  return mapEvent(snap.data());
}

export function listenMessages(
  slug: string,
  onChange: (messages: MessageRecord[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  const messagesQuery = query(
    collection(db, "events", slug, "messages"),
    where("isHidden", "==", false),
  );

  return onSnapshot(
    messagesQuery,
    (snap) => {
      const messages = snap.docs
        .map((item) => mapMessage(item.id, item.data()))
        .sort((a, b) => {
          const aTime = a.createdAt?.getTime() ?? Date.now();
          const bTime = b.createdAt?.getTime() ?? Date.now();
          return bTime - aTime;
        });
      onChange(messages);
    },
    (error: FirestoreError) => {
      onError(error.message || "Couldn’t load the guestbook.");
    },
  );
}

export async function submitMessage(input: {
  slug: string;
  guestName: string;
  text: string;
  photos: File[];
  video: File | null;
}): Promise<void> {
  const guestName = sanitizeText(input.guestName, MAX_NAME);
  const text = sanitizeText(input.text, MAX_TEXT);
  if (input.photos.length > MAX_PHOTOS) {
    throw new Error(`You can add up to ${MAX_PHOTOS} photos.`);
  }
  const photos = input.photos;
  if (photos.length > 0 && input.video) {
    throw new Error("Choose photos or one video, not both.");
  }
  const videoFormat = input.video ? validateGuestVideo(input.video) : null;
  if (!text && photos.length === 0 && !input.video) {
    throw new Error("Add a note, photo, or video.");
  }

  const messageId = crypto.randomUUID();
  const payload: DocumentData = {
    createdAt: serverTimestamp(),
    isHidden: false,
  };
  if (guestName) payload.guestName = guestName;
  if (text) payload.text = text;

  if (photos.length > 0) {
    payload.photoUrls = await storeGuestPhotos(input.slug, messageId, photos);
  }
  if (input.video && videoFormat) {
    await storeGuestVideo(input.slug, messageId, input.video, videoFormat);
    payload.videoStatus = "processing";
  }

  try {
    await writeBatch(db)
      .set(doc(db, "events", input.slug, "messages", messageId), payload)
      .commit();
  } catch (error) {
    throw toFriendlyError(error, "Couldn’t send that message. Please try again.");
  }
}

export async function hideMessage(slug: string, messageId: string, hostToken: string): Promise<void> {
  try {
    const deleteMessage = httpsCallable<
      { slug: string; messageId: string; hostToken: string },
      { ok: true }
    >(functions, "deleteMessage");
    await deleteMessage({ slug, messageId, hostToken });
  } catch (error) {
    throw toFriendlyError(error, "That host link isn’t valid for this guestbook.");
  }
}

export async function updateEventSignTheme(
  slug: string,
  signTheme: SignThemeId,
  hostToken: string,
): Promise<SignThemeId> {
  try {
    const updateSignTheme = httpsCallable<
      { slug: string; signTheme: SignThemeId; hostToken: string },
      { ok: true; signTheme: SignThemeId }
    >(functions, "updateSignTheme");
    const result = await updateSignTheme({ slug, signTheme, hostToken });
    return getSignTheme(result.data.signTheme).id;
  } catch (error) {
    throw toFriendlyError(error, "Couldn’t save that design. Please try again.");
  }
}

function mapEvent(data: DocumentData): EventRecord {
  const eventType = normalizeEventType(data.eventType);
  const copy = getEventCopy(eventType);
  return {
    eventType,
    coupleNames: String(data.coupleNames ?? copy.displayNameFallback),
    eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate() : null,
    welcomeMessage: typeof data.welcomeMessage === "string" ? data.welcomeMessage : null,
    themeColor: typeof data.themeColor === "string" ? data.themeColor : null,
    signTheme: getSignTheme(data.signTheme).id,
  };
}

function mapMessage(id: string, data: DocumentData): MessageRecord {
  return {
    id,
    guestName: typeof data.guestName === "string" ? data.guestName : null,
    text: typeof data.text === "string" ? data.text : null,
    photoUrls: normalizePhotoUrls(data),
    videoUrl: typeof data.videoUrl === "string" ? data.videoUrl : null,
    videoStatus: normalizeVideoStatus(data.videoStatus),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  };
}

function normalizePhotoUrls(data: DocumentData): string[] {
  if (Array.isArray(data.photoUrls)) {
    return data.photoUrls.filter((url): url is string => typeof url === "string");
  }
  if (typeof data.photoUrl === "string") return [data.photoUrl];
  return [];
}

export function validateGuestVideo(video: File): SupportedVideoFormat {
  if (video.size === 0) {
    throw new Error("Choose a video file with content.");
  }
  if (video.size >= MAX_VIDEO_BYTES) {
    throw new Error("Videos must be smaller than 10 MiB.");
  }

  const extension = video.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = video.type.toLowerCase();
  const format = SUPPORTED_VIDEO_FORMATS.find(
    (candidate) => candidate.extension === extension && candidate.contentType === contentType,
  );
  if (!format) {
    throw new Error("Use an MP4, MOV, WebM, M4V, or 3GP video file.");
  }
  return format;
}

function normalizeVideoStatus(value: unknown): VideoStatus | null {
  return value === "processing" || value === "ready" || value === "failed" ? value : null;
}

async function storeGuestPhotos(slug: string, messageId: string, photos: File[]): Promise<string[]> {
  const allowDataUrlFallback = photos.length === 1;
  const urls: string[] = [];
  for (let index = 0; index < photos.length; index += 1) {
    urls.push(await storeGuestPhoto(slug, messageId, photos[index]!, index, allowDataUrlFallback));
  }
  return urls;
}

async function storeGuestPhoto(
  slug: string,
  messageId: string,
  photo: File,
  index: number,
  allowDataUrlFallback: boolean,
): Promise<string> {
  const compressed = await compressGuestPhoto(photo);
  try {
    const photoRef = ref(storage, `events/${slug}/messages/${messageId}-${index}.jpg`);
    await uploadBytes(photoRef, compressed, { contentType: "image/jpeg" });
    return await getDownloadURL(photoRef);
  } catch (error) {
    if (!allowDataUrlFallback) {
      throw toFriendlyError(error, "Photo upload isn’t available yet. Try one photo, or send a note for now.");
    }
    const dataUrl = await fileToDataUrl(compressed);
    if (dataUrl.length >= 900000) {
      throw new Error("That photo is still a bit large after shrinking. Try a shorter note, or a smaller picture.");
    }
    return dataUrl;
  }
}

async function storeGuestVideo(
  slug: string,
  messageId: string,
  video: File,
  format: SupportedVideoFormat,
): Promise<void> {
  try {
    const videoRef = ref(storage, `events/${slug}/messages/${messageId}-raw.${format.extension}`);
    await uploadBytes(videoRef, video, { contentType: format.contentType });
  } catch (error) {
    throw toFriendlyError(error, "Video upload isn’t available yet. Try again shortly.");
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn’t read that photo."));
    reader.readAsDataURL(file);
  });
}

function toFriendlyError(error: unknown, fallback: string): Error {
  const message = error instanceof Error ? error.message : "";
  const code =
    error && typeof error === "object" && "code" in error && typeof error.code === "string"
      ? error.code
      : "";

  if (/functions\/(permission-denied|invalid-argument)|Host link is not valid/i.test(message)) {
    return new Error("That host link isn’t valid for this guestbook.");
  }
  if (/functions\/(not-found|unavailable|internal|deadline-exceeded)/i.test(`${code} ${message}`)) {
    return new Error(fallback);
  }
  if (error instanceof Error && /storage\/unauthorized|storage\/retry-limit/i.test(error.message)) {
    return new Error("Media upload isn’t available yet. Send a note for now, or try again shortly.");
  }
  return new Error(fallback);
}
