import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp as initializeAdminApp } from "firebase-admin/app";
import {
  FieldValue,
  Timestamp as AdminTimestamp,
  getFirestore as getAdminFirestore,
} from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import { initializeApp } from "firebase/app";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { connectStorageEmulator, getDownloadURL, getStorage, ref } from "firebase/storage";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRANDING = join(ROOT, "public", "images");
const CATALOG_PATH = join(ROOT, "src", "content", "demoCatalog.json");
const WEDDING_DEMO_SLUG = "maya-james-k8n2w4p9qx";
const STORAGE_BUCKET = "toastboard.firebasestorage.app";

const ALLOWED_EVENT_TYPES = new Set(["wedding", "birthday", "graduation", "religious-milestone"]);
const SIGN_THEMES = new Set(["classic", "botanical", "modern", "art-deco", "coastal", "midnight"]);
const SLUG_RE = /^[a-z0-9-]{10,80}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const PHOTO_FILE_RE = /^[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/;

// Keep in sync with functions/index.js DEMO_EVENT_TYPES. The callable does not read this file.
const EXPECTED_DEMO_TYPES = Object.freeze({
  "maya-james-k8n2w4p9qx": "wedding",
  "lena-birthday-b7r3m9q2vx": "birthday",
  "jordan-graduation-g6p4n8w2kc": "graduation",
  "noah-bar-mitzvah-r5m8k2q7tz": "religious-milestone",
});

const DEFAULT_EMULATORS = Object.freeze({
  firestore: { host: "127.0.0.1", port: 8080 },
  storage: { host: "127.0.0.1", port: 9199 },
  functions: { host: "127.0.0.1", port: 5001 },
});

function useEmulators() {
  const value = String(process.env.TOASTBOARD_EMULATORS ?? "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function parseHostPort(raw, fallback) {
  if (!raw) return { ...fallback };
  const trimmed = String(raw).trim();
  const separator = trimmed.lastIndexOf(":");
  if (separator <= 0) return { ...fallback };
  const port = Number(trimmed.slice(separator + 1));
  if (!Number.isInteger(port) || port <= 0) return { ...fallback };
  return { host: trimmed.slice(0, separator), port };
}

function emulatorEndpoints() {
  return {
    firestore: parseHostPort(process.env.FIRESTORE_EMULATOR_HOST, DEFAULT_EMULATORS.firestore),
    storage: parseHostPort(process.env.FIREBASE_STORAGE_EMULATOR_HOST, DEFAULT_EMULATORS.storage),
    functions: parseHostPort(
      process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST,
      DEFAULT_EMULATORS.functions,
    ),
  };
}

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function messageIdFor(guestName) {
  return `seed-${guestName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
}

function legacyMessageIdFor(guestName) {
  return `demo-${guestName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
}

function isSeedMessageId(id) {
  return id.startsWith("seed-") || id.startsWith("demo-");
}

function loadCatalog() {
  const parsed = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  return validateCatalog(parsed);
}

function validateCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== "object" || !Array.isArray(catalog.demos)) {
    throw new Error("Demo catalog is invalid: expected a top-level { demos: [...] } object.");
  }

  const demos = catalog.demos;
  if (demos.length !== 4) {
    errors.push(`expected exactly 4 demos, found ${demos.length}`);
  }

  const slugs = new Set();
  const types = new Set();
  const tokens = new Set();

  for (const [index, demo] of demos.entries()) {
    const label = `demos[${index}]`;
    if (!demo || typeof demo !== "object") {
      errors.push(`${label} must be an object`);
      continue;
    }

    if (typeof demo.slug !== "string" || !SLUG_RE.test(demo.slug)) {
      errors.push(`${label}.slug must match ${SLUG_RE}`);
    } else if (slugs.has(demo.slug)) {
      errors.push(`duplicate slug ${demo.slug}`);
    } else {
      slugs.add(demo.slug);
      if (!(demo.slug in EXPECTED_DEMO_TYPES)) {
        errors.push(`${label}.slug ${demo.slug} is not a marketed demo slug`);
      }
    }

    if (!ALLOWED_EVENT_TYPES.has(demo.eventType)) {
      errors.push(`${label}.eventType must be one of ${[...ALLOWED_EVENT_TYPES].join(", ")}`);
    } else if (types.has(demo.eventType)) {
      errors.push(`duplicate eventType ${demo.eventType}`);
    } else {
      types.add(demo.eventType);
    }

    if (demo.slug in EXPECTED_DEMO_TYPES && demo.eventType !== EXPECTED_DEMO_TYPES[demo.slug]) {
      errors.push(`${label} expected eventType ${EXPECTED_DEMO_TYPES[demo.slug]}, found ${demo.eventType}`);
    }

    if (typeof demo.coupleNames !== "string" || demo.coupleNames.length < 1 || demo.coupleNames.length > 120) {
      errors.push(`${label}.coupleNames must be 1–120 characters`);
    }
    if (typeof demo.eventDate !== "string" || !DATE_RE.test(demo.eventDate) || Number.isNaN(Date.parse(`${demo.eventDate}T12:00:00`))) {
      errors.push(`${label}.eventDate must be YYYY-MM-DD`);
    }
    if (typeof demo.welcomeMessage !== "string" || demo.welcomeMessage.length < 1 || demo.welcomeMessage.length > 500) {
      errors.push(`${label}.welcomeMessage must be 1–500 characters`);
    }
    if (typeof demo.themeColor !== "string" || !COLOR_RE.test(demo.themeColor)) {
      errors.push(`${label}.themeColor must be #RRGGBB`);
    }
    if (!SIGN_THEMES.has(demo.signTheme)) {
      errors.push(`${label}.signTheme must be one of ${[...SIGN_THEMES].join(", ")}`);
    }
    if (typeof demo.hostToken !== "string" || demo.hostToken.length < 20) {
      errors.push(`${label}.hostToken must be at least 20 characters`);
    } else if (tokens.has(demo.hostToken)) {
      errors.push(`duplicate hostToken for ${demo.slug ?? label}`);
    } else {
      tokens.add(demo.hostToken);
    }

    if (!Array.isArray(demo.messages) || demo.messages.length === 0) {
      errors.push(`${label}.messages must be a non-empty array`);
      continue;
    }

    const messageIds = new Set();
    for (const [messageIndex, message] of demo.messages.entries()) {
      const messageLabel = `${label}.messages[${messageIndex}]`;
      if (!message || typeof message !== "object") {
        errors.push(`${messageLabel} must be an object`);
        continue;
      }
      if (typeof message.guestName !== "string" || message.guestName.length < 1 || message.guestName.length > 80) {
        errors.push(`${messageLabel}.guestName must be 1–80 characters`);
      }
      if (typeof message.text !== "string" || message.text.length < 1 || message.text.length > 1000) {
        errors.push(`${messageLabel}.text must be 1–1000 characters`);
      }
      if (message.photos !== undefined && !Array.isArray(message.photos)) {
        errors.push(`${messageLabel}.photos must be an array of filenames when present`);
      }

      const photos = Array.isArray(message.photos) ? message.photos : [];
      for (const filename of photos) {
        if (typeof filename !== "string" || !PHOTO_FILE_RE.test(filename)) {
          errors.push(`${messageLabel} photo "${filename}" is not a safe image filename`);
          continue;
        }
        if (!existsSync(join(BRANDING, filename))) {
          errors.push(`${messageLabel} photo ${filename} is missing from public/branding`);
        }
      }

      if (typeof message.guestName === "string") {
        const id = messageIdFor(message.guestName);
        if (id === "seed-" || id === "seed") {
          errors.push(`${messageLabel}.guestName does not produce a stable seed id`);
        } else if (messageIds.has(id)) {
          errors.push(`${messageLabel} collides with another seed id (${id})`);
        } else {
          messageIds.add(id);
        }
      }
    }
  }

  for (const slug of Object.keys(EXPECTED_DEMO_TYPES)) {
    if (!slugs.has(slug)) errors.push(`missing marketed demo slug ${slug}`);
  }

  if (errors.length > 0) {
    throw new Error(`Demo catalog is invalid:\n- ${errors.join("\n- ")}`);
  }

  return demos;
}

function initFirebase(emulatorMode) {
  const app = initializeApp({
    projectId: "toastboard",
    appId: "1:695090103004:web:71de06a692807c4afaea19",
    storageBucket: STORAGE_BUCKET,
    apiKey: "AIzaSyAQSSPFYToH69ZcM8i73awb4MTQS8CXpQc",
    authDomain: "toastboard.firebaseapp.com",
    messagingSenderId: "695090103004",
    projectNumber: "695090103004",
    version: "2",
  });

  const db = getFirestore(app);
  const storage = getStorage(app);
  const functions = getFunctions(app, "us-central1");

  if (emulatorMode) {
    const emulators = emulatorEndpoints();
    connectFirestoreEmulator(db, emulators.firestore.host, emulators.firestore.port);
    connectStorageEmulator(storage, emulators.storage.host, emulators.storage.port);
    connectFunctionsEmulator(functions, emulators.functions.host, emulators.functions.port);
    console.log(
      `Using Firebase emulators at ${emulators.firestore.host} (firestore:${emulators.firestore.port}, storage:${emulators.storage.port}, functions:${emulators.functions.port})`,
    );
  } else {
    console.log("Using Firebase project toastboard (production)");
  }

  return { db, storage, functions };
}

function initAdmin(emulatorMode) {
  if (emulatorMode) {
    const emulators = emulatorEndpoints();
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      process.env.FIRESTORE_EMULATOR_HOST = `${emulators.firestore.host}:${emulators.firestore.port}`;
    }
    if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = `${emulators.storage.host}:${emulators.storage.port}`;
    }
  }

  if (!getApps().length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      initializeAdminApp({
        credential: cert({ projectId: "toastboard", clientEmail, privateKey }),
        projectId: "toastboard",
        storageBucket: STORAGE_BUCKET,
      });
    } else {
      initializeAdminApp({ projectId: "toastboard", storageBucket: STORAGE_BUCKET });
    }
  }

  return {
    adminDb: getAdminFirestore(),
    adminBucket: getAdminStorage().bucket(STORAGE_BUCKET),
  };
}

async function uploadDemoPhoto(adminBucket, storage, slug, messageId, index, filename) {
  const bytes = readFileSync(join(BRANDING, filename));
  const objectPath = `events/${slug}/messages/${messageId}-${index}.jpg`;
  const token = randomUUID();
  await adminBucket.file(objectPath).save(bytes, {
    contentType: "image/jpeg",
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });
  return getDownloadURL(ref(storage, objectPath));
}

async function hideIfVisible(db, slug, messageId, hostTokenHash) {
  const messageRef = doc(db, "events", slug, "messages", messageId);
  try {
    const snap = await getDoc(messageRef);
    if (!snap.exists()) return;
    await updateDoc(messageRef, { isHidden: true, hostTokenHash });
    console.log(`  Hidden previous seed message ${messageId}`);
  } catch {
    // Already hidden or missing — client rules block reads of hidden docs.
  }
}

async function hideVisibleSeedMessages(db, demo, hostTokenHash) {
  const messagesQuery = query(
    collection(db, "events", demo.slug, "messages"),
    where("isHidden", "==", false),
  );
  try {
    const snap = await getDocs(messagesQuery);
    for (const messageDoc of snap.docs) {
      if (!isSeedMessageId(messageDoc.id)) continue;
      await hideIfVisible(db, demo.slug, messageDoc.id, hostTokenHash);
    }
  } catch (error) {
    console.warn(`  Could not list visible messages for ${demo.slug}; hiding known seed ids only.`);
    if (error instanceof Error && error.message) console.warn(`  ${error.message}`);
  }

  for (const message of demo.messages) {
    await hideIfVisible(db, demo.slug, legacyMessageIdFor(message.guestName), hostTokenHash);
    await hideIfVisible(db, demo.slug, messageIdFor(message.guestName), hostTokenHash);
  }
}

async function buildMessagePayload(adminBucket, storage, slug, message, messageId) {
  const payload = {
    guestName: message.guestName,
    text: message.text,
    createdAt: serverTimestamp(),
    isHidden: false,
  };
  const photos = Array.isArray(message.photos) ? message.photos : [];
  if (photos.length > 0) {
    payload.photoUrls = [];
    for (let index = 0; index < photos.length; index += 1) {
      payload.photoUrls.push(
        await uploadDemoPhoto(adminBucket, storage, slug, messageId, index, photos[index]),
      );
    }
  }
  return { payload, photoCount: photos.length };
}

async function createSeedMessages(db, adminBucket, storage, demo) {
  const created = [];
  const batch = writeBatch(db);
  for (const message of demo.messages) {
    const id = messageIdFor(message.guestName);
    const { payload, photoCount } = await buildMessagePayload(
      adminBucket,
      storage,
      demo.slug,
      message,
      id,
    );
    batch.set(doc(db, "events", demo.slug, "messages", id), payload);
    created.push({ id, guestName: message.guestName, photos: photoCount });
  }

  try {
    await batch.commit();
    return created;
  } catch {
    // Hidden seed-* docs still occupy their IDs; create uniquely-suffixed replacements.
    console.warn(`  Stable seed IDs unavailable for ${demo.slug}; creating uniquely-suffixed messages…`);
    const retry = writeBatch(db);
    created.length = 0;
    const suffix = Date.now().toString(36);
    for (const message of demo.messages) {
      const id = `${messageIdFor(message.guestName)}-${suffix}`;
      const { payload, photoCount } = await buildMessagePayload(
        adminBucket,
        storage,
        demo.slug,
        message,
        id,
      );
      retry.set(doc(db, "events", demo.slug, "messages", id), payload);
      created.push({ id, guestName: message.guestName, photos: photoCount });
    }
    await retry.commit();
    return created;
  }
}

async function createDemoEvent(adminDb, demo, hostTokenHash) {
  const batch = adminDb.batch();
  batch.set(adminDb.doc(`events/${demo.slug}`), {
    coupleNames: demo.coupleNames,
    eventType: demo.eventType,
    eventDate: AdminTimestamp.fromDate(new Date(`${demo.eventDate}T12:00:00`)),
    welcomeMessage: demo.welcomeMessage,
    themeColor: demo.themeColor,
    signTheme: demo.signTheme,
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.set(adminDb.doc(`events/${demo.slug}/secrets/host`), { hostTokenHash });
  await batch.commit();
}

async function enrichExistingDemo(functions, demo) {
  const enrichDemoEventType = httpsCallable(functions, "enrichDemoEventType");
  try {
    const result = await enrichDemoEventType({ slug: demo.slug, hostToken: demo.hostToken });
    const data = result.data ?? {};
    if (data.updated) {
      console.log(`  Set missing eventType to ${demo.eventType}`);
    } else {
      console.log(`  eventType already ${demo.eventType}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Refusing to seed ${demo.slug}: ${message}`);
  }
}

async function seedDemo(db, adminDb, adminBucket, storage, functions, demo) {
  const hostTokenHash = sha256Hex(demo.hostToken);
  const existing = await adminDb.doc(`events/${demo.slug}`).get();

  console.log(`Seeding ${demo.coupleNames} (${demo.eventType}) [${demo.slug}]`);

  if (!existing.exists) {
    await createDemoEvent(adminDb, demo, hostTokenHash);
    console.log("  Created event and host secret");
  } else {
    console.log("  Event already exists; leaving stored fields unchanged");
    await enrichExistingDemo(functions, demo);
  }

  await hideVisibleSeedMessages(db, demo, hostTokenHash);
  const created = await createSeedMessages(db, adminBucket, storage, demo);
  for (const item of created) {
    console.log(`  ${item.guestName}: ${item.photos} photo${item.photos === 1 ? "" : "s"} (${item.id})`);
  }
  return created;
}

function printDemoUrls(origin, demo) {
  const manage = `${origin}/e/${demo.slug}/manage?token=${demo.hostToken}`;
  console.log(`${demo.coupleNames}`);
  console.log(`  Guest: ${origin}/e/${demo.slug}`);
  console.log(`  Guestbook: ${origin}/e/${demo.slug}/guestbook`);
  console.log(`  Host: ${manage}`);
  return manage;
}

async function main() {
  const demos = loadCatalog();
  const emulatorMode = useEmulators();
  const { db, storage, functions } = initFirebase(emulatorMode);
  const { adminDb, adminBucket } = initAdmin(emulatorMode);

  for (const demo of demos) {
    await seedDemo(db, adminDb, adminBucket, storage, functions, demo);
  }

  const origin = process.env.TOASTBOARD_ORIGIN ?? "http://localhost:3000";
  console.log("Seeded demo guestbooks");
  let weddingHostUrl = "";
  for (const demo of demos) {
    const manage = printDemoUrls(origin, demo);
    if (demo.slug === WEDDING_DEMO_SLUG) weddingHostUrl = manage;
  }

  if (!weddingHostUrl) {
    throw new Error("Maya & James host URL missing after seed.");
  }
  writeFileSync(".demo-host-url", `${weddingHostUrl}\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
