"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildDownloadUrl,
  downloadTokenFromMetadata,
  inspectProbeOutput,
  isIdempotencyStorageOutcome,
  isRemuxEligible,
  isValidRawMedia,
  parseRawMediaPath,
  remuxArgs,
  shouldDeleteFinalForReadinessOutcome,
  transcodeArgs,
  videoReadyTransitionOutcome,
} = require("./video");

const slug = "maya-james-k8n2w4p9qx";
const messageId = "123e4567-e89b-42d3-a456-426614174000";

test("parses only exact raw video paths", () => {
  assert.deepEqual(
    parseRawMediaPath(`events/${slug}/messages/${messageId}-raw.webm`),
    { slug, messageId, extension: "webm" },
  );
  assert.equal(parseRawMediaPath(`events/${slug}/messages/${messageId}.mp4`), null);
  assert.equal(parseRawMediaPath(`events/${slug}/messages/${messageId}-raw.MP4`), null);
  assert.equal(parseRawMediaPath(`events/${slug}/messages/not-a-uuid-raw.mp4`), null);
});

test("rejects empty and extension/MIME-mismatched raw uploads", () => {
  const media = parseRawMediaPath(`events/${slug}/messages/${messageId}-raw.mp4`);
  assert.equal(isValidRawMedia({ size: "0", contentType: "video/mp4" }, media), false);
  assert.equal(isValidRawMedia({ size: "1024", contentType: "video/webm" }, media), false);
  assert.equal(isValidRawMedia({ size: "10485760", contentType: "video/mp4" }, media), false);
  assert.equal(isValidRawMedia({ size: "1024", contentType: "video/mp4" }, media), true);
});

test("recognizes only H.264/AAC MP4-family remuxes", () => {
  const h264Aac = inspectProbeOutput(`
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'input.mp4':
  Stream #0:0: Video: h264 (High), yuv420p
  Stream #0:1: Audio: aac (LC), 48000 Hz
`);
  assert.equal(isRemuxEligible(h264Aac), true);

  const h264NoAudio = inspectProbeOutput(`
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'input.mp4':
  Stream #0:0: Video: h264 (High), yuv420p
`);
  assert.equal(isRemuxEligible(h264NoAudio), true);

  const h264Opus = { ...h264Aac, audioCodec: "opus" };
  assert.equal(isRemuxEligible(h264Opus), false);
  assert.equal(isRemuxEligible({ ...h264Aac, container: "matroska,webm" }), false);
});

test("remuxes only the first AAC audio stream", () => {
  const args = remuxArgs("/tmp/input.mp4", "/tmp/output.mp4");
  assert.ok(args.includes("0:v:0"));
  assert.ok(args.includes("0:a:0?"));
  assert.equal(args.includes("0:a?"), false);
});

test("transcode arguments keep video browser-compatible and width bounded", () => {
  const args = transcodeArgs("/tmp/input.webm", "/tmp/output.mp4", true);
  assert.deepEqual(args.slice(0, 8), [
    "-y",
    "-i",
    "/tmp/input.webm",
    "-map",
    "0:v:0",
    "-map_metadata",
    "-1",
    "-c:v",
  ]);
  assert.ok(args.includes("libx264"));
  assert.ok(args.includes("yuv420p"));
  assert.ok(args.includes("scale='min(1280,iw)':-2"));
  assert.ok(args.includes("aac"));
  assert.ok(args.includes("+faststart"));
  assert.equal(args.includes("-an"), false);

  const noAudioArgs = transcodeArgs("/tmp/input.mov", "/tmp/output.mp4", false);
  assert.ok(noAudioArgs.includes("-an"));
  assert.equal(noAudioArgs.includes("aac"), false);
});

test("constructs encoded production and emulator download URLs", () => {
  const objectPath = `events/${slug}/messages/${messageId}.mp4`;
  const production = buildDownloadUrl({
    bucket: "toastboard.appspot.com",
    objectPath,
    token: "token value",
    emulatorHost: "",
  });
  assert.equal(
    production,
    `https://firebasestorage.googleapis.com/v0/b/toastboard.appspot.com/o/${encodeURIComponent(objectPath)}?alt=media&token=token%20value`,
  );
  assert.equal(
    buildDownloadUrl({
      bucket: "toastboard.appspot.com",
      objectPath,
      token: "test-token",
      emulatorHost: "127.0.0.1:9199",
    }),
    `http://127.0.0.1:9199/v0/b/toastboard.appspot.com/o/${encodeURIComponent(objectPath)}?alt=media&token=test-token`,
  );
});

test("recovers a valid final download token without exposing it in logs", () => {
  const token = downloadTokenFromMetadata({
    contentType: "video/mp4",
    metadata: { firebaseStorageDownloadTokens: "first-token, second-token" },
  });
  assert.equal(token, "first-token");
  assert.equal(downloadTokenFromMetadata({ metadata: {} }), null);
  assert.equal(downloadTokenFromMetadata({ metadata: { firebaseStorageDownloadTokens: "" } }), null);
});

test("classifies duplicate storage deliveries as non-terminal outcomes", () => {
  assert.equal(isIdempotencyStorageOutcome({ code: 412 }), true);
  assert.equal(isIdempotencyStorageOutcome({ code: 409 }), true);
  assert.equal(isIdempotencyStorageOutcome({ code: 404 }), true);
  assert.equal(isIdempotencyStorageOutcome(new Error("ffmpeg failed")), false);
});

test("classifies readiness rejections for final-object cleanup", () => {
  const videoUrl = "https://example.test/video.mp4";
  for (const [data, reason] of [
    [null, "missing"],
    [{ isHidden: true, videoStatus: "processing" }, "hidden"],
    [{ videoStatus: "failed" }, "failed"],
    [{ videoStatus: "queued" }, "ineligible"],
  ]) {
    const outcome = videoReadyTransitionOutcome(data, videoUrl);
    assert.deepEqual(outcome, { status: "rejected", reason });
    assert.equal(shouldDeleteFinalForReadinessOutcome(outcome), true);
  }
});

test("preserves a final object when concurrent delivery already made it ready", () => {
  const videoUrl = "https://example.test/video.mp4";
  const outcome = videoReadyTransitionOutcome({ videoStatus: "ready", videoUrl }, videoUrl);

  assert.deepEqual(outcome, { status: "already-ready", sameUrl: true });
  assert.equal(shouldDeleteFinalForReadinessOutcome(outcome), false);
});

test("commits readiness only for visible processing messages", () => {
  const outcome = videoReadyTransitionOutcome(
    { isHidden: false, videoStatus: "processing" },
    "https://example.test/video.mp4",
  );
  assert.deepEqual(outcome, { status: "committed" });
  assert.equal(shouldDeleteFinalForReadinessOutcome(outcome), false);
});
