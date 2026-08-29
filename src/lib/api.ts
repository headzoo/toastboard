import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { compressGuestPhoto } from "./compress.ts";
import { makeEventSlug, randomToken, sanitizeText, sha256Hex } from "./crypto.ts";
import { db, storage } from "./firebase.ts";
import type { EventRecord, MessageRecord } from "./types.ts";

export const DEMO_SLUG = "maya-james-k8n2w4p9qx";

const MAX_NAME = 80;
const MAX_TEXT = 1000;
const MAX_WELCOME = 500;
const MAX_TABLE = 16;

type CreatedEvent = {
  slug: string;
  hostToken: string;
};

export async function createEvent(input: {
  coupleNames: string;
  eventDate: string;
  welcomeMessage: string;
  themeColor: string;
}): Promise<CreatedEvent> {
  const coupleNames = sanitizeText(input.coupleNames, 120);
  if (!coupleNames) throw new Error("Please add the couple’s names.");

  const hostToken = randomToken(32);
  const hostTokenHash = await sha256Hex(hostToken);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const slug = makeEventSlug(coupleNames);
    const eventRef = doc(db, "events", slug);
    const payload: DocumentData = {
      coupleNames,
      createdAt: serverTimestamp(),
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
      return { slug, hostToken };
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
      onError(error.message || "Couldn’t load the guestbook wall.");
    },
  );
}

export async function submitMessage(input: {
  slug: string;
  guestName: string;
  text: string;
  tableNumber: string;
  photo: File | null;
}): Promise<void> {
  const guestName = sanitizeText(input.guestName, MAX_NAME);
  const text = sanitizeText(input.text, MAX_TEXT);
  const tableNumber = sanitizeText(input.tableNumber, MAX_TABLE);
  if (!text && !input.photo) {
    throw new Error("Add a note, a photo, or both.");
  }

  const messageId = crypto.randomUUID();
  const payload: DocumentData = {
    createdAt: serverTimestamp(),
    isHidden: false,
  };
  if (guestName) payload.guestName = guestName;
  if (text) payload.text = text;
  if (tableNumber) payload.tableNumber = tableNumber;

  if (input.photo) {
    payload.photoUrl = await storeGuestPhoto(input.slug, messageId, input.photo);
  }

  try {
    await writeBatch(db)
      .set(doc(db, "events", input.slug, "messages", messageId), payload)
      .commit();
  } catch (error) {
    throw toFriendlyError(error, "Couldn’t send that toast. Please try again.");
  }
}

export async function hideMessage(slug: string, messageId: string, hostToken: string): Promise<void> {
  const hostTokenHash = await sha256Hex(hostToken);
  try {
    await updateDoc(doc(db, "events", slug, "messages", messageId), {
      isHidden: true,
      hostTokenHash,
    });
  } catch (error) {
    throw toFriendlyError(error, "That host link isn’t valid for this guestbook.");
  }
}

function mapEvent(data: DocumentData): EventRecord {
  return {
    coupleNames: String(data.coupleNames ?? "This wedding"),
    eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate() : null,
    welcomeMessage: typeof data.welcomeMessage === "string" ? data.welcomeMessage : null,
    themeColor: typeof data.themeColor === "string" ? data.themeColor : null,
  };
}

function mapMessage(id: string, data: DocumentData): MessageRecord {
  return {
    id,
    guestName: typeof data.guestName === "string" ? data.guestName : null,
    text: typeof data.text === "string" ? data.text : null,
    photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : null,
    tableNumber: typeof data.tableNumber === "string" ? data.tableNumber : null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  };
}

async function storeGuestPhoto(slug: string, messageId: string, photo: File): Promise<string> {
  const compressed = await compressGuestPhoto(photo);
  try {
    const photoRef = ref(storage, `events/${slug}/messages/${messageId}.jpg`);
    await uploadBytes(photoRef, compressed, { contentType: "image/jpeg" });
    return await getDownloadURL(photoRef);
  } catch {
    const dataUrl = await fileToDataUrl(compressed);
    if (dataUrl.length >= 900000) {
      throw new Error("That photo is still a bit large after shrinking. Try a shorter note, or a smaller picture.");
    }
    return dataUrl;
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
  if (error instanceof Error && /storage\/unauthorized|storage\/retry-limit/i.test(error.message)) {
    return new Error("Photo upload isn’t available yet. Send a note for now, or try again shortly.");
  }
  return new Error(fallback);
}
