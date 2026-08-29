const { createHash, timingSafeEqual } = require("crypto");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { HttpsError, onCall } = require("firebase-functions/v2/https");

initializeApp();

const SLUG = /^[a-z0-9-]{10,80}$/;

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function hashesMatch(a, b) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

exports.deleteMessage = onCall({ cors: true, region: "us-central1" }, async (request) => {
  const slug = typeof request.data?.slug === "string" ? request.data.slug : "";
  const messageId = typeof request.data?.messageId === "string" ? request.data.messageId : "";
  const hostToken = typeof request.data?.hostToken === "string" ? request.data.hostToken : "";

  if (!SLUG.test(slug) || !messageId || hostToken.length < 20) {
    throw new HttpsError("invalid-argument", "Missing or invalid moderation payload.");
  }

  const db = getFirestore();
  const secretSnap = await db.doc(`events/${slug}/secrets/host`).get();
  if (!secretSnap.exists) {
    throw new HttpsError("permission-denied", "Host link is not valid for this guestbook.");
  }

  const storedHash = secretSnap.get("hostTokenHash");
  const incomingHash = sha256Hex(hostToken);
  if (typeof storedHash !== "string" || !hashesMatch(storedHash, incomingHash)) {
    throw new HttpsError("permission-denied", "Host link is not valid for this guestbook.");
  }

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

  const photoUrl = messageSnap.get("photoUrl");
  if (typeof photoUrl === "string" && photoUrl.includes(`/events/${slug}/messages/`)) {
    try {
      await getStorage().bucket().file(`events/${slug}/messages/${messageId}.jpg`).delete({ ignoreNotFound: true });
    } catch {
      // Soft-delete in Firestore is the source of truth; storage cleanup is best-effort.
    }
  }

  return { ok: true };
});
