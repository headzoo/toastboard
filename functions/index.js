const { createHash, randomUUID, timingSafeEqual } = require('crypto');
const { readFile, unlink } = require('fs/promises');
const os = require('os');
const ffmpegPath = require('ffmpeg-static');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { onObjectFinalized } = require('firebase-functions/v2/storage');
const {
  buildDownloadUrl,
  downloadTokenFromMetadata,
  isIdempotencyStorageOutcome,
  isRemuxEligible,
  isStorageNotFound,
  isValidRawMedia,
  isVisibleProcessing,
  makeTempPaths,
  parseRawMediaCandidate,
  parseRawMediaPath,
  probeMedia,
  remuxArgs,
  runFfmpeg,
  shouldDeleteFinalForReadinessOutcome,
  terminalVideoState,
  transcodeArgs,
  videoReadyTransitionOutcome,
} = require('./video');

initializeApp();

const SLUG = /^[a-z0-9-]{10,80}$/;
const SIGN_THEMES = new Set([
  'classic',
  'botanical',
  'modern',
  'art-deco',
  'coastal',
  'midnight',
]);
// Hard-coded marketed demos only. Do not read the catalog at runtime.
const DEMO_EVENT_TYPES = Object.freeze({
  'maya-james-k8n2w4p9qx': 'wedding',
  'lena-birthday-b7r3m9q2vx': 'birthday',
  'jordan-graduation-g6p4n8w2kc': 'graduation',
  'noah-bar-mitzvah-r5m8k2q7tz': 'religious-milestone',
});
const VIDEO_DOCUMENT_RETRY_DELAYS_MS = [50, 100, 200, 400, 800];
const RAW_VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'm4v', '3gp']);

async function deleteMessageStorage(bucket, slug, messageId) {
  const prefix = `events/${slug}/messages/`;
  const paths = [`${prefix}${messageId}.jpg`, `${prefix}${messageId}.mp4`];
  for (let i = 0; i < 10; i += 1) {
    paths.push(`${prefix}${messageId}-${i}.jpg`);
  }

  const rawPrefix = `${prefix}${messageId}-raw.`;
  try {
    const [rawFiles] = await bucket.getFiles({ prefix: rawPrefix });
    for (const file of rawFiles) {
      const remainder = file.name.slice(rawPrefix.length);
      if (!remainder || remainder.includes('/') || remainder.includes('.'))
        continue;
      if (RAW_VIDEO_EXTENSIONS.has(remainder.toLowerCase())) {
        paths.push(file.name);
      }
    }
  } catch (error) {
    console.error('delete_message_raw_list_failed', {
      slug,
      messageId,
      error: error instanceof Error ? error.message : 'unknown',
    });
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

function rawDeleteOptions(generation) {
  return generation
    ? { preconditionOpts: { ifGenerationMatch: generation } }
    : undefined;
}

async function deleteRawObject(rawFile, generation) {
  try {
    await rawFile.delete({
      ignoreNotFound: true,
      ...rawDeleteOptions(generation),
    });
  } catch (error) {
    // A precondition failure means a newer object exists and must be left alone.
    if (error.code !== 412) throw error;
  }
}

async function cleanupRawObject(rawFile, generation, identifiers) {
  try {
    await deleteRawObject(rawFile, generation);
  } catch (error) {
    console.error('video_raw_cleanup_failed', {
      ...identifiers,
      generation,
      error: error instanceof Error ? error.message : 'unknown',
    });
  }
}

async function waitForProcessingMessage(db, messageRef) {
  for (
    let attempt = 0;
    attempt <= VIDEO_DOCUMENT_RETRY_DELAYS_MS.length;
    attempt += 1
  ) {
    const snapshot = await messageRef.get();
    if (snapshot.exists) {
      const data = snapshot.data();
      return {
        data,
        state: isVisibleProcessing(data)
          ? 'processing'
          : terminalVideoState(data),
      };
    }
    if (attempt < VIDEO_DOCUMENT_RETRY_DELAYS_MS.length) {
      await new Promise((resolve) =>
        setTimeout(resolve, VIDEO_DOCUMENT_RETRY_DELAYS_MS[attempt]),
      );
    }
  }
  return { data: null, state: 'missing' };
}

async function setVideoFailedIfProcessing(db, messageRef, claimedGeneration) {
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(messageRef);
    if (!snapshot.exists || !isVisibleProcessing(snapshot.data())) return false;
    const owner = snapshot.get('videoProcessingGeneration');
    if (claimedGeneration && owner && owner !== claimedGeneration) return false;
    transaction.update(messageRef, {
      videoStatus: 'failed',
      videoProcessingGeneration: FieldValue.delete(),
    });
    return true;
  });
}

async function setVideoReadyIfProcessing(db, messageRef, videoUrl) {
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(messageRef);
    const outcome = videoReadyTransitionOutcome(
      snapshot.exists ? snapshot.data() : null,
      videoUrl,
    );
    if (outcome.status !== 'committed') return outcome;
    transaction.update(messageRef, {
      videoStatus: 'ready',
      videoUrl,
      videoProcessingGeneration: FieldValue.delete(),
    });
    return outcome;
  });
}

async function claimVideoProcessing(db, messageRef, generation) {
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(messageRef);
    if (!snapshot.exists || !isVisibleProcessing(snapshot.data())) return false;
    if (snapshot.get('videoProcessingGeneration')) return false;
    transaction.update(messageRef, { videoProcessingGeneration: generation });
    return true;
  });
}

async function recoverExistingFinalVideo(bucket, bucketName, finalPath) {
  const finalFile = bucket.file(finalPath);
  try {
    const [metadata] = await finalFile.getMetadata();
    const token = downloadTokenFromMetadata(metadata);
    if (metadata.contentType !== 'video/mp4' || !token) return null;
    return {
      generation: metadata.generation,
      videoUrl: buildDownloadUrl({
        bucket: bucketName,
        objectPath: finalPath,
        token,
      }),
    };
  } catch (error) {
    if (isStorageNotFound(error)) return null;
    throw error;
  }
}

async function deleteFinalVideoIfCurrent(bucket, finalPath, generation) {
  if (!generation) return false;
  try {
    await bucket.file(finalPath).delete({
      ignoreNotFound: true,
      preconditionOpts: { ifGenerationMatch: generation },
    });
    return true;
  } catch (error) {
    // A newer final object belongs to another delivery and must survive.
    if (error.code === 404 || error.code === 412) return false;
    throw error;
  }
}

function isReadyVideoOutcome(outcome) {
  return outcome?.status === 'committed' || outcome?.status === 'already-ready';
}

async function recoverReadyVideo(
  db,
  messageRef,
  bucket,
  bucketName,
  finalPath,
) {
  const finalVideo = await recoverExistingFinalVideo(
    bucket,
    bucketName,
    finalPath,
  );
  if (!finalVideo) return { status: 'no-final' };
  const outcome = await setVideoReadyIfProcessing(
    db,
    messageRef,
    finalVideo.videoUrl,
  );
  if (shouldDeleteFinalForReadinessOutcome(outcome)) {
    await deleteFinalVideoIfCurrent(bucket, finalPath, finalVideo.generation);
  }
  return outcome;
}

async function removeTempFile(filePath) {
  if (!filePath) return;
  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function sha256Hex(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function hashesMatch(a, b) {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function verifyHostToken(slug, hostToken) {
  if (!SLUG.test(slug) || hostToken.length < 20) {
    throw new HttpsError(
      'invalid-argument',
      'Missing or invalid host credential.',
    );
  }

  const db = getFirestore();
  const secretSnap = await db.doc(`events/${slug}/secrets/host`).get();
  if (!secretSnap.exists) {
    throw new HttpsError(
      'permission-denied',
      'Host link is not valid for this guestbook.',
    );
  }

  const incomingHash = sha256Hex(hostToken);
  const storedHash = secretSnap.get('hostTokenHash');
  if (
    typeof storedHash !== 'string' ||
    !hashesMatch(storedHash, incomingHash)
  ) {
    throw new HttpsError(
      'permission-denied',
      'Host link is not valid for this guestbook.',
    );
  }

  return { db, incomingHash };
}

async function verifyHostAccess(slug, hostToken, authUid) {
  const db = getFirestore();
  const eventSnap = await db.doc(`events/${slug}`).get();
  if (!eventSnap.exists) {
    throw new HttpsError('not-found', 'Guestbook not found.');
  }

  const ownerUid = eventSnap.get('ownerUid');
  if (authUid && typeof ownerUid === 'string' && ownerUid === authUid) {
    return { db, incomingHash: null };
  }

  if (typeof hostToken === 'string' && hostToken.length >= 20) {
    return verifyHostToken(slug, hostToken);
  }

  throw new HttpsError(
    'permission-denied',
    'Host link is not valid for this guestbook.',
  );
}

exports.deleteMessage = onCall(
  { cors: true, region: 'us-central1' },
  async (request) => {
    const slug =
      typeof request.data?.slug === 'string' ? request.data.slug : '';
    const messageId =
      typeof request.data?.messageId === 'string' ? request.data.messageId : '';
    const hostToken =
      typeof request.data?.hostToken === 'string' ? request.data.hostToken : '';
    const authUid = request.auth?.uid ?? null;

    if (!SLUG.test(slug) || !messageId) {
      throw new HttpsError(
        'invalid-argument',
        'Missing or invalid moderation payload.',
      );
    }

    const { db, incomingHash } = await verifyHostAccess(
      slug,
      hostToken,
      authUid,
    );

    const messageRef = db.doc(`events/${slug}/messages/${messageId}`);
    const messageSnap = await messageRef.get();
    if (!messageSnap.exists) {
      throw new HttpsError('not-found', 'That toast has already been removed.');
    }

    const updatePayload = {
      isHidden: true,
      hiddenAt: FieldValue.serverTimestamp(),
    };
    if (incomingHash) {
      updatePayload.hostTokenHash = incomingHash;
    }

    await messageRef.update(updatePayload);

    const bucket = getStorage().bucket();
    await deleteMessageStorage(bucket, slug, messageId);

    return { ok: true };
  },
);

exports.updateSignTheme = onCall(
  { cors: true, region: 'us-central1' },
  async (request) => {
    const slug =
      typeof request.data?.slug === 'string' ? request.data.slug : '';
    const signTheme =
      typeof request.data?.signTheme === 'string' ? request.data.signTheme : '';
    const hostToken =
      typeof request.data?.hostToken === 'string' ? request.data.hostToken : '';
    const authUid = request.auth?.uid ?? null;

    if (!SLUG.test(slug) || !SIGN_THEMES.has(signTheme)) {
      throw new HttpsError(
        'invalid-argument',
        'Missing or invalid theme update payload.',
      );
    }

    const { db } = await verifyHostAccess(slug, hostToken, authUid);
    await db.doc(`events/${slug}`).update({ signTheme });

    return { ok: true, signTheme };
  },
);

exports.enrichDemoEventType = onCall(
  { cors: true, region: 'us-central1' },
  async (request) => {
    const data =
      request.data && typeof request.data === 'object' ? request.data : {};
    const extraKeys = Object.keys(data).filter(
      (key) => key !== 'slug' && key !== 'hostToken',
    );
    if (extraKeys.length > 0) {
      throw new HttpsError(
        'invalid-argument',
        'Missing or invalid demo metadata payload.',
      );
    }

    const slug = typeof data.slug === 'string' ? data.slug : '';
    const hostToken = typeof data.hostToken === 'string' ? data.hostToken : '';
    const expectedType = DEMO_EVENT_TYPES[slug];

    if (!expectedType || hostToken.length < 20) {
      throw new HttpsError(
        'invalid-argument',
        'Missing or invalid demo metadata payload.',
      );
    }

    const { db } = await verifyHostToken(slug, hostToken);
    const eventRef = db.doc(`events/${slug}`);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      throw new HttpsError('not-found', 'That demo guestbook does not exist.');
    }

    const currentType = eventSnap.get('eventType');
    if (currentType == null || currentType === '') {
      await eventRef.update({ eventType: expectedType });
      return { ok: true, eventType: expectedType, updated: true };
    }
    if (currentType === expectedType) {
      return { ok: true, eventType: expectedType, updated: false };
    }

    throw new HttpsError(
      'failed-precondition',
      `This demo already has eventType "${currentType}"; expected "${expectedType}".`,
    );
  },
);

exports.transcodeUploadedVideo = onObjectFinalized(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 120,
    cpu: 1,
    minInstances: 0,
    retry: false,
  },
  async (event) => {
    const object = event.data;
    const media = parseRawMediaPath(object.name);
    const candidate = parseRawMediaCandidate(object.name);
    if (!media && !candidate) return;

    const db = getFirestore();
    const bucket = getStorage().bucket(object.bucket);
    const rawFile = bucket.file(object.name);
    const generation = object.generation;
    const target = media ?? candidate;
    const messageRef = db.doc(
      `events/${target.slug}/messages/${target.messageId}`,
    );
    const identifiers = { slug: target.slug, messageId: target.messageId };
    const finalPath = `events/${target.slug}/messages/${target.messageId}.mp4`;

    if (!media || !isValidRawMedia(object, media)) {
      const message = await waitForProcessingMessage(db, messageRef);
      const recovered = isReadyVideoOutcome(
        await recoverReadyVideo(
          db,
          messageRef,
          bucket,
          object.bucket,
          finalPath,
        ),
      );
      if (!recovered && message.state === 'processing')
        await setVideoFailedIfProcessing(db, messageRef, generation);
      await cleanupRawObject(rawFile, generation, identifiers);
      return;
    }

    let inputPath;
    let outputPath;

    try {
      const [metadata] = await rawFile.getMetadata();
      if (!isValidRawMedia(metadata, media)) {
        const message = await waitForProcessingMessage(db, messageRef);
        const recovered = isReadyVideoOutcome(
          await recoverReadyVideo(
            db,
            messageRef,
            bucket,
            object.bucket,
            finalPath,
          ),
        );
        if (!recovered && message.state === 'processing')
          await setVideoFailedIfProcessing(db, messageRef, generation);
        await cleanupRawObject(rawFile, generation, identifiers);
        return;
      }

      const message = await waitForProcessingMessage(db, messageRef);
      if (message.state !== 'processing') {
        await cleanupRawObject(rawFile, generation, identifiers);
        if (message.state === 'missing') {
          console.warn('video_raw_orphaned', {
            slug: media.slug,
            messageId: media.messageId,
            generation,
          });
        }
        return;
      }

      if (
        isReadyVideoOutcome(
          await recoverReadyVideo(
            db,
            messageRef,
            bucket,
            object.bucket,
            finalPath,
          ),
        )
      ) {
        await cleanupRawObject(rawFile, generation, identifiers);
        return;
      }

      if (!(await claimVideoProcessing(db, messageRef, generation))) {
        // Another delivery owns this generation. It may still need the raw object.
        await recoverReadyVideo(
          db,
          messageRef,
          bucket,
          object.bucket,
          finalPath,
        );
        return;
      }

      if (!ffmpegPath) throw new Error('ffmpeg-static binary is unavailable');
      ({ inputPath, outputPath } = makeTempPaths(os.tmpdir(), media.extension));
      await rawFile.download({
        destination: inputPath,
        validation: false,
        ...rawDeleteOptions(generation),
      });

      const probe = await probeMedia(ffmpegPath, inputPath);
      if (!probe.hasVideo)
        throw new Error('uploaded media has no video stream');
      const shouldRemux = isRemuxEligible(probe);
      const args = shouldRemux
        ? remuxArgs(inputPath, outputPath)
        : transcodeArgs(inputPath, outputPath, probe.hasAudio);
      console.info(shouldRemux ? 'video_remux' : 'video_transcode', {
        slug: media.slug,
        messageId: media.messageId,
        generation,
        inputExtension: media.extension,
        hasAudio: probe.hasAudio,
      });
      await runFfmpeg(ffmpegPath, args, { timeoutMs: 100000 });

      const token = randomUUID();
      const finalFile = bucket.file(finalPath);
      await finalFile.save(await readFile(outputPath), {
        resumable: false,
        preconditionOpts: { ifGenerationMatch: 0 },
        metadata: {
          contentType: 'video/mp4',
          cacheControl: 'public,max-age=31536000,immutable',
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });

      const outcome = await recoverReadyVideo(
        db,
        messageRef,
        bucket,
        object.bucket,
        finalPath,
      );
      if (outcome.status === 'no-final') {
        throw new Error('uploaded final video could not be recovered');
      }
      await cleanupRawObject(rawFile, generation, identifiers);
    } catch (error) {
      let recovered = false;
      try {
        recovered = isReadyVideoOutcome(
          await recoverReadyVideo(
            db,
            messageRef,
            bucket,
            object.bucket,
            finalPath,
          ),
        );
      } catch (recoveryError) {
        console.error('video_final_recovery_failed', {
          ...identifiers,
          generation,
          error:
            recoveryError instanceof Error ? recoveryError.message : 'unknown',
        });
      }
      try {
        if (!recovered && !isIdempotencyStorageOutcome(error)) {
          await setVideoFailedIfProcessing(db, messageRef, generation);
        }
      } finally {
        await cleanupRawObject(rawFile, generation, identifiers);
      }
      console.error(
        recovered ? 'video_transcode_recovered' : 'video_transcode_failed',
        {
          slug: media.slug,
          messageId: media.messageId,
          generation,
          error: error instanceof Error ? error.message : 'unknown',
        },
      );
    } finally {
      await Promise.all([
        removeTempFile(inputPath),
        removeTempFile(outputPath),
      ]);
    }
  },
);
