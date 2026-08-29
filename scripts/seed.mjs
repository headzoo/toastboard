import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import {
  Timestamp,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

const DEMO_SLUG = "maya-james-k8n2w4p9qx";
const DEMO_TOKEN = "toastboard-demo-host-k8n2w4p9qx-not-a-real-wedding";

const app = initializeApp({
  "projectId": "toastboard",
  "appId": "1:695090103004:web:71de06a692807c4afaea19",
  "storageBucket": "toastboard.firebasestorage.app",
  "apiKey": "AIzaSyAQSSPFYToH69ZcM8i73awb4MTQS8CXpQc",
  "authDomain": "toastboard.firebaseapp.com",
  "messagingSenderId": "695090103004",
  "projectNumber": "695090103004",
  "version": "2"
});

const db = getFirestore(app);

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const toasts = [
  {
    guestName: "Aunt June",
    text: "May your arguments be short, your Sunday mornings long, and your house always smell like someone just baked something.",
  },
  {
    guestName: "Priya",
    text: "Still can’t believe you two met over the last samosa. Please never stop telling that story.",
  },
  {
    guestName: "Best man, theoretically",
    text: "I was asked to be profound. Instead: don’t forget to eat cake. Also I love you both.",
  },
  {
    guestName: "Grandad",
    text: "Look after each other. That’s the whole job.",
  },
  {
    guestName: "Sam from work",
    text: "The wall is already prettier than our Slack channel. Congratulations, you two.",
  },
  {
    guestName: "A guest who forgot their name tag",
    text: "Left a toast without making an account, which feels like the most 2026 thing we could have done for you.",
  },
];

const eventRef = doc(db, "events", DEMO_SLUG);
const existing = await getDoc(eventRef);
const batch = writeBatch(db);

if (!existing.exists()) {
  batch.set(eventRef, {
    coupleNames: "Maya & James",
    eventDate: Timestamp.fromDate(new Date("2026-09-12T12:00:00")),
    welcomeMessage: "Leave us a toast — a memory, a wish, or a terrible joke. No account needed.",
    themeColor: "#C45C67",
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "events", DEMO_SLUG, "secrets", "host"), {
    hostTokenHash: sha256Hex(DEMO_TOKEN),
  });
}

for (const toast of toasts) {
  const id = `demo-${toast.guestName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
  batch.set(doc(db, "events", DEMO_SLUG, "messages", id), {
    ...toast,
    createdAt: serverTimestamp(),
    isHidden: false,
  });
}

await batch.commit();

const origin = process.env.TOASTBOARD_ORIGIN ?? "http://localhost:5173";
const manage = `${origin}/e/${DEMO_SLUG}/manage?token=${DEMO_TOKEN}`;
writeFileSync(".demo-host-url", `${manage}\n`);
console.log("Seeded demo guestbook");
console.log(`Wall: ${origin}/e/${DEMO_SLUG}/wall`);
console.log(`Host: ${manage}`);
process.exit(0);
