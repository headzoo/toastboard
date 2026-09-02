'use strict';

const { randomUUID } = require('crypto');
const { spawn } = require('child_process');

const MAX_VIDEO_BYTES = 10 * 1024 * 1024;
const SLUG_PATTERN = /^[a-z0-9-]{10,80}$/;
const MESSAGE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const RAW_MEDIA_PATTERN =
  /^events\/([a-z0-9-]{10,80})\/messages\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})-raw\.(mp4|mov|webm|m4v|3gp)$/;

const VIDEO_FORMATS = Object.freeze({
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  m4v: 'video/x-m4v',
  '3gp': 'video/3gpp',
});

function parseRawMediaPath(name) {
  if (typeof name !== 'string') return null;
  const match = RAW_MEDIA_PATTERN.exec(name);
  if (!match) return null;
  return { slug: match[1], messageId: match[2], extension: match[3] };
}

function parseRawMediaCandidate(name) {
  if (typeof name !== 'string') return null;
  const match =
    /^events\/([a-z0-9-]{10,80})\/messages\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})-raw\.([^/]+)$/.exec(
      name,
    );
  if (!match) return null;
  return {
    slug: match[1],
    messageId: match[2],
    extension: match[3].toLowerCase(),
  };
}

function isValidRawMedia(metadata, media) {
  if (
    !media ||
    !SLUG_PATTERN.test(media.slug) ||
    !MESSAGE_ID_PATTERN.test(media.messageId)
  ) {
    return false;
  }
  const size = Number(metadata?.size);
  return (
    Number.isSafeInteger(size) &&
    size > 0 &&
    size < MAX_VIDEO_BYTES &&
    metadata?.contentType === VIDEO_FORMATS[media.extension]
  );
}

function inspectProbeOutput(output) {
  const text = typeof output === 'string' ? output : '';
  const containerMatch = /^\s*Input #\d+,\s*([^,]+(?:,[^,]+)*),/m.exec(text);
  const container = containerMatch ? containerMatch[1].toLowerCase() : '';
  const videoMatch =
    /^\s*Stream #\d+:\d+(?:\[[^\]]+\])?(?:\([^)]+\))?: Video:\s*([^,\s]+)/m.exec(
      text,
    );
  const audioMatch =
    /^\s*Stream #\d+:\d+(?:\[[^\]]+\])?(?:\([^)]+\))?: Audio:\s*([^,\s]+)/m.exec(
      text,
    );
  return {
    container,
    videoCodec: videoMatch?.[1]?.toLowerCase() ?? null,
    audioCodec: audioMatch?.[1]?.toLowerCase() ?? null,
    hasVideo: Boolean(videoMatch),
    hasAudio: Boolean(audioMatch),
  };
}

function isRemuxEligible(probe) {
  const mp4Family = /(?:^|,)\s*(mov|mp4|m4a|3gp|3g2|mj2)\s*(?:,|$)/.test(
    probe?.container ?? '',
  );
  return Boolean(
    mp4Family &&
    probe?.videoCodec === 'h264' &&
    (!probe?.hasAudio || probe?.audioCodec === 'aac'),
  );
}

function remuxArgs(inputPath, outputPath) {
  return [
    '-y',
    '-i',
    inputPath,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0?',
    '-map_metadata',
    '-1',
    '-c',
    'copy',
    '-movflags',
    '+faststart',
    outputPath,
  ];
}

function transcodeArgs(inputPath, outputPath, hasAudio) {
  const args = [
    '-y',
    '-i',
    inputPath,
    '-map',
    '0:v:0',
    '-map_metadata',
    '-1',
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-pix_fmt',
    'yuv420p',
    '-vf',
    "scale='min(1280,iw)':-2",
  ];
  if (hasAudio) {
    args.push('-map', '0:a:0?', '-c:a', 'aac');
  } else {
    args.push('-an');
  }
  return args.concat(['-movflags', '+faststart', outputPath]);
}

function buildDownloadUrl({
  bucket,
  objectPath,
  token,
  emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST,
}) {
  const host = emulatorHost
    ? `http://${emulatorHost}`
    : 'https://firebasestorage.googleapis.com';
  return `${host}/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`;
}

function downloadTokenFromMetadata(metadata) {
  const raw = metadata?.metadata?.firebaseStorageDownloadTokens;
  if (typeof raw !== 'string') return null;
  return (
    raw
      .split(',')
      .map((token) => token.trim())
      .find(Boolean) ?? null
  );
}

function isStoragePreconditionConflict(error) {
  return error?.code === 412 || error?.code === 409;
}

function isStorageNotFound(error) {
  return error?.code === 404;
}

function isIdempotencyStorageOutcome(error) {
  return isStoragePreconditionConflict(error) || isStorageNotFound(error);
}

function isVisibleProcessing(data) {
  return Boolean(
    data && data.isHidden !== true && data.videoStatus === 'processing',
  );
}

function terminalVideoState(data) {
  if (!data) return 'missing';
  if (data.isHidden === true) return 'hidden';
  if (data.videoStatus === 'ready' || data.videoStatus === 'failed')
    return data.videoStatus;
  return 'other';
}

function videoReadyTransitionOutcome(data, videoUrl) {
  if (!data) return { status: 'rejected', reason: 'missing' };
  if (data.isHidden === true) return { status: 'rejected', reason: 'hidden' };
  if (data.videoStatus === 'ready') {
    return {
      status: 'already-ready',
      sameUrl: data.videoUrl === videoUrl,
    };
  }
  if (data.videoStatus === 'failed')
    return { status: 'rejected', reason: 'failed' };
  if (data.videoStatus !== 'processing')
    return { status: 'rejected', reason: 'ineligible' };
  return { status: 'committed' };
}

function shouldDeleteFinalForReadinessOutcome(outcome) {
  return outcome?.status === 'rejected';
}

function runFfmpeg(
  binary,
  args,
  { timeoutMs = 105000, allowNonZero = false } = {},
) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { shell: false, windowsHide: true });
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error('ffmpeg timed out'));
      } else if (code !== 0 && !allowNonZero) {
        reject(new Error(`ffmpeg exited with ${code ?? signal ?? 'an error'}`));
      } else {
        resolve({ code, stderr });
      }
    });
  });
}

async function probeMedia(binary, inputPath) {
  const result = await runFfmpeg(binary, ['-hide_banner', '-i', inputPath], {
    allowNonZero: true,
    timeoutMs: 15000,
  });
  return inspectProbeOutput(result.stderr);
}

function makeTempPaths(directory, extension) {
  const id = randomUUID();
  return {
    inputPath: `${directory}/toastboard-${id}-input.${extension}`,
    outputPath: `${directory}/toastboard-${id}-output.mp4`,
  };
}

module.exports = {
  MAX_VIDEO_BYTES,
  VIDEO_FORMATS,
  buildDownloadUrl,
  downloadTokenFromMetadata,
  inspectProbeOutput,
  isRemuxEligible,
  isIdempotencyStorageOutcome,
  isStorageNotFound,
  isStoragePreconditionConflict,
  isValidRawMedia,
  isVisibleProcessing,
  makeTempPaths,
  parseRawMediaCandidate,
  parseRawMediaPath,
  probeMedia,
  remuxArgs,
  runFfmpeg,
  terminalVideoState,
  transcodeArgs,
  videoReadyTransitionOutcome,
  shouldDeleteFinalForReadinessOutcome,
};
