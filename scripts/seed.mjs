import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import {
  Timestamp,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const DEMO_SLUG = "maya-james-k8n2w4p9qx";
const DEMO_TOKEN = "toastboard-demo-host-k8n2w4p9qx-not-a-real-wedding";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRANDING = join(ROOT, "public", "branding");

const app = initializeApp({
  projectId: "toastboard",
  appId: "1:695090103004:web:71de06a692807c4afaea19",
  storageBucket: "toastboard.firebasestorage.app",
  apiKey: "AIzaSyAQSSPFYToH69ZcM8i73awb4MTQS8CXpQc",
  authDomain: "toastboard.firebaseapp.com",
  messagingSenderId: "695090103004",
  projectNumber: "695090103004",
  version: "2",
});

const db = getFirestore(app);
const storage = getStorage(app);

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function messageIdFor(guestName) {
  return `seed-${guestName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
}

function legacyMessageIdFor(guestName) {
  return `demo-${guestName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
}

async function uploadDemoPhoto(messageId, index, filename) {
  const bytes = readFileSync(join(BRANDING, filename));
  const photoRef = ref(storage, `events/${DEMO_SLUG}/messages/${messageId}-${index}.jpg`);
  try {
    await uploadBytes(photoRef, bytes, { contentType: "image/jpeg" });
  } catch {
    // storage.rules forbid update/delete — re-seed reuses the existing object.
  }
  return getDownloadURL(photoRef);
}

async function hideIfVisible(messageId, hostTokenHash) {
  const messageRef = doc(db, "events", DEMO_SLUG, "messages", messageId);
  try {
    const snap = await getDoc(messageRef);
    if (!snap.exists()) return;
    await updateDoc(messageRef, { isHidden: true, hostTokenHash });
    console.log(`Hidden previous toast ${messageId}`);
  } catch {
    // Already hidden or missing — client rules block reads of hidden docs.
  }
}

const toasts = [
  {
    guestName: "Aunt June",
    text: "May your arguments be short, your Sunday mornings long, and your house always smell like someone just baked something.",
    photos: ["guestbook-aunt-june.jpg"],
  },
  {
    guestName: "Priya",
    text: "Still can’t believe you two met over the last samosa. Please never stop telling that story.",
    photos: ["guestbook-priya-1.jpg", "guestbook-priya-2.jpg"],
  },
  {
    guestName: "Best man, theoretically",
    text: "I was asked to be profound. Instead: don’t forget to eat cake. Also I love you both.",
    photos: ["guestbook-best-man-1.jpg", "guestbook-best-man-2.jpg", "guestbook-best-man-3.jpg"],
  },
  {
    guestName: "Grandad",
    text: "Look after each other. That’s the whole job.",
    photos: ["guestbook-grandad.jpg"],
  },
  {
    guestName: "Sam from work",
    text: "The wall is already prettier than our Slack channel. Congratulations, you two.",
    photos: ["guestbook-sam.jpg"],
  },
  {
    guestName: "A guest who forgot their name tag",
    text: "Left a toast without making an account, which feels like the most 2026 thing we could have done for you.",
    photos: [],
  },
];

const hostTokenHash = sha256Hex(DEMO_TOKEN);
const eventRef = doc(db, "events", DEMO_SLUG);
const existing = await getDoc(eventRef);
const batch = writeBatch(db);

if (!existing.exists()) {
  batch.set(eventRef, {
    coupleNames: "Maya & James",
    eventDate: Timestamp.fromDate(new Date("2026-09-12T12:00:00")),
    welcomeMessage: "Leave us a toast — a memory, a wish, or a terrible joke. No account needed.",
    themeColor: "#C45C67",
    signTheme: "classic",
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "events", DEMO_SLUG, "secrets", "host"), {
    hostTokenHash,
  });
}

// Client rules allow hide + create, not overwrite. Retire prior seed docs, then create seed-*.
for (const toast of toasts) {
  await hideIfVisible(legacyMessageIdFor(toast.guestName), hostTokenHash);
  await hideIfVisible(messageIdFor(toast.guestName), hostTokenHash);
}

const created = [];
for (const toast of toasts) {
  const id = messageIdFor(toast.guestName);
  const payload = {
    guestName: toast.guestName,
    text: toast.text,
    createdAt: serverTimestamp(),
    isHidden: false,
  };
  if (toast.photos.length > 0) {
    payload.photoUrls = [];
    for (let index = 0; index < toast.photos.length; index += 1) {
      payload.photoUrls.push(await uploadDemoPhoto(id, index, toast.photos[index]));
    }
  }
  batch.set(doc(db, "events", DEMO_SLUG, "messages", id), payload);
  created.push({ id, guestName: toast.guestName, photos: toast.photos.length });
}

try {
  await batch.commit();
} catch (error) {
  // Hidden seed-* docs still occupy their IDs; create uniquely-suffixed replacements.
  console.warn("Stable seed IDs unavailable; creating uniquely-suffixed messages…");
  const retry = writeBatch(db);
  created.length = 0;
  const suffix = Date.now().toString(36);
  for (const toast of toasts) {
    const id = `${messageIdFor(toast.guestName)}-${suffix}`;
    const payload = {
      guestName: toast.guestName,
      text: toast.text,
      createdAt: serverTimestamp(),
      isHidden: false,
    };
    if (toast.photos.length > 0) {
      payload.photoUrls = [];
      for (let index = 0; index < toast.photos.length; index += 1) {
        payload.photoUrls.push(await uploadDemoPhoto(id, index, toast.photos[index]));
      }
    }
    retry.set(doc(db, "events", DEMO_SLUG, "messages", id), payload);
    created.push({ id, guestName: toast.guestName, photos: toast.photos.length });
  }
  await retry.commit();
}

const origin = process.env.TOASTBOARD_ORIGIN ?? "http://localhost:5173";
const manage = `${origin}/e/${DEMO_SLUG}/manage?token=${DEMO_TOKEN}`;
writeFileSync(".demo-host-url", `${manage}\n`);
console.log("Seeded demo guestbook");
for (const item of created) {
  console.log(`  ${item.guestName}: ${item.photos} photo${item.photos === 1 ? "" : "s"} (${item.id})`);
}
console.log(`Wall: ${origin}/e/${DEMO_SLUG}/wall`);
console.log(`Host: ${manage}`);
process.exit(0);
