const { createHash, timingSafeEqual } = require("crypto");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

initializeApp();

const SLUG = /^[a-z0-9-]{10,80}$/;
const SIGN_THEMES = new Set(["classic", "botanical", "modern", "art-deco", "coastal", "midnight"]);

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function hashesMatch(a, b) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function verifyHostToken(slug, hostToken) {
  if (!SLUG.test(slug) || hostToken.length < 20) {
    throw new HttpsError("invalid-argument", "Missing or invalid host credential.");
  }

  const db = getFirestore();
  const secretSnap = await db.doc(`events/${slug}/secrets/host`).get();
  if (!secretSnap.exists) {
    throw new HttpsError("permission-denied", "Host link is not valid for this guestbook.");
  }

  const incomingHash = sha256Hex(hostToken);
  const storedHash = secretSnap.get("hostTokenHash");
  if (typeof storedHash !== "string" || !hashesMatch(storedHash, incomingHash)) {
    throw new HttpsError("permission-denied", "Host link is not valid for this guestbook.");
  }

  return { db, incomingHash };
}

exports.deleteMessage = onCall({ cors: true, region: "us-central1" }, async (request) => {
  const slug = typeof request.data?.slug === "string" ? request.data.slug : "";
  const messageId = typeof request.data?.messageId === "string" ? request.data.messageId : "";
  const hostToken = typeof request.data?.hostToken === "string" ? request.data.hostToken : "";

  if (!SLUG.test(slug) || !messageId || hostToken.length < 20) {
    throw new HttpsError("invalid-argument", "Missing or invalid moderation payload.");
  }

  const { db, incomingHash } = await verifyHostToken(slug, hostToken);

  const messageRef = db.doc(`events/${slug}/messages/${messageId}`);
  const messageSnap = await messageRef.get();
  if (!messageSnap.exists) {
    throw new HttpsError("not-found", "That toast has already been removed.");
  }

  await messageRef.update({
    isHidden: true,
    hostTokenHash: incomingHash,
    hiddenAt: FieldValue.serverTimestamp(),
  });

  const photoUrls = messageSnap.get("photoUrls");
  const legacyPhotoUrl = messageSnap.get("photoUrl");
  const hasPhotos =
    (Array.isArray(photoUrls) && photoUrls.length > 0) ||
    (typeof legacyPhotoUrl === "string" && legacyPhotoUrl.includes(`/events/${slug}/messages/`));

  if (hasPhotos) {
    const bucket = getStorage().bucket();
    const paths = [`events/${slug}/messages/${messageId}.jpg`];
    for (let i = 0; i < 10; i += 1) {
      paths.push(`events/${slug}/messages/${messageId}-${i}.jpg`);
    }
    await Promise.all(
      paths.map(async (path) => {
        try {
          await bucket.file(path).delete({ ignoreNotFound: true });
        } catch {
          // Soft-delete in Firestore is the source of truth; storage cleanup is best-effort.
        }
      }),
    );
  }

  return { ok: true };
});

exports.updateSignTheme = onCall({ cors: true, region: "us-central1" }, async (request) => {
  const slug = typeof request.data?.slug === "string" ? request.data.slug : "";
  const signTheme = typeof request.data?.signTheme === "string" ? request.data.signTheme : "";
  const hostToken = typeof request.data?.hostToken === "string" ? request.data.hostToken : "";

  if (!SLUG.test(slug) || hostToken.length < 20 || !SIGN_THEMES.has(signTheme)) {
    throw new HttpsError("invalid-argument", "Missing or invalid theme update payload.");
  }

  const { db } = await verifyHostToken(slug, hostToken);
  await db.doc(`events/${slug}`).update({ signTheme });

  return { ok: true, signTheme };
});
