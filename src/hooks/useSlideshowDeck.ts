import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_SLIDESHOW_PREFERENCES,
  loadSlideshowPreferences,
  saveSlideshowPreferences,
  shuffleEntries,
  SlideImageCache,
  isCurrentDeckCandidate,
  mediaTargets,
  toDeckEntry,
  type ContentSlideSlot,
  type DeckEntry,
  type SlideMediaTarget,
  type SlideSlot,
  type SlideshowPreferences,
} from "../lib/slideshow.ts";
import type { MessageRecord } from "../lib/types.ts";

const LOOKAHEAD_ENTRIES = 3;

function emptySlot(cycle: number): SlideSlot {
  return { kind: "empty", cycleKey: `empty-${cycle}` };
}

function contentSlot(
  entry: DeckEntry,
  media: SlideMediaTarget,
  cycle: number,
  dimensions?: { width: number; height: number },
): ContentSlideSlot {
  return {
    kind: "content",
    cycleKey: `${entry.id}:${media.kind === "photo" ? media.index : media.kind}:${cycle}`,
    messageId: entry.id,
    text: entry.text,
    guestName: entry.guestName,
    media,
    ...(dimensions ? { dimensions } : {}),
  };
}

/**
 * A frozen-slot controller for the fullscreen guestbook. Changing `messages` only
 * replaces its upcoming work; it never rewrites the slot currently on screen.
 *
 * `ready` should become true after the initial live snapshot. This lets a deck
 * which initially has messages start with content, while a genuinely empty deck
 * observes the poster's full dwell before its first arrival is promoted.
 */
export function useSlideshowDeck(
  slug: string | undefined,
  messages: readonly MessageRecord[],
  ready = true,
) {
  const [preferences, setPreferencesState] = useState<SlideshowPreferences>(
    DEFAULT_SLIDESHOW_PREFERENCES,
  );
  const [slot, setSlot] = useState<SlideSlot>(() => emptySlot(0));
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const liveRef = useRef(new Map<string, DeckEntry>());
  const queueRef = useRef<DeckEntry[]>([]);
  const historyRef = useRef<string[]>([]);
  const currentRef = useRef<SlideSlot>(slot);
  const timerRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const remainingRef = useRef<number | null>(null);
  const cycleRef = useRef(0);
  const initializedRef = useRef(false);
  const pausedRef = useRef(false);
  const advancingRef = useRef(false);
  const unmountedRef = useRef(false);
  const cacheRef = useRef(new SlideImageCache());
  const advanceRef = useRef<() => Promise<void>>(async () => { });
  const preferencesRef = useRef(preferences);

  const rememberLeftEntry = useCallback((priorId: string | undefined, nextId: string) => {
    if (!priorId || priorId === nextId) return;
    const history = historyRef.current;
    if (history[history.length - 1] === priorId) return;
    history.push(priorId);
  }, []);

  const updateSlot = useCallback((next: SlideSlot) => {
    currentRef.current = next;
    setSlot(next);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    deadlineRef.current = null;
  }, []);

  const preloadNearFuture = useCallback(() => {
    const current = currentRef.current;
    if (current.kind === "content" && current.media.kind === "photo") cacheRef.current.preload(current.media.url);
    if (current.kind === "content") {
      const entry = liveRef.current.get(current.messageId);
      if (entry && current.media.kind === "photo") {
        entry.photoUrls.slice(current.media.index + 1).forEach((url) => cacheRef.current.preload(url));
      }
    }
    queueRef.current.slice(0, LOOKAHEAD_ENTRIES).forEach((entry) => {
      const firstPhoto = entry.photoUrls[0];
      if (firstPhoto) cacheRef.current.preload(firstPhoto);
    });
  }, []);

  const schedule = useCallback(
    (duration: number) => {
      clearTimer();
      if (pausedRef.current || unmountedRef.current) {
        remainingRef.current = duration;
        return;
      }
      deadlineRef.current = Date.now() + duration;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        deadlineRef.current = null;
        void advanceRef.current();
      }, duration);
    },
    [clearTimer],
  );

  const promote = useCallback(
    async (entry: DeckEntry, media: SlideMediaTarget): Promise<boolean> => {
      if (media.kind !== "photo") {
        const liveEntry = liveRef.current.get(entry.id);
        if (!isCurrentDeckCandidate(liveEntry, entry, media)) return false;
        cycleRef.current += 1;
        updateSlot(contentSlot(liveEntry, media, cycleRef.current));
        queueRef.current = queueRef.current.filter((queued) => queued.id !== liveEntry.id);
        setIsLoading(false);
        return true;
      }
      setIsLoading(true);
      const dimensions = await cacheRef.current.preload(media.url);
      if (unmountedRef.current) return false;
      if (!dimensions) {
        setIsLoading(false);
        return false;
      }
      const liveEntry = liveRef.current.get(entry.id);
      if (!isCurrentDeckCandidate(liveEntry, entry, media)) {
        setIsLoading(false);
        return false;
      }
      cycleRef.current += 1;
      updateSlot(contentSlot(liveEntry, media, cycleRef.current, dimensions));
      queueRef.current = queueRef.current.filter((queued) => queued.id !== liveEntry.id);
      setIsLoading(false);
      return true;
    },
    [updateSlot],
  );

  const promoteFromQueue = useCallback(
    async (prior: SlideSlot, skipRemainingPhotos: boolean): Promise<boolean> => {
      const priorId = prior.kind === "content" ? prior.messageId : undefined;
      const liveCount = liveRef.current.size;
      const visitLimit = Math.max(1, [...liveRef.current.values()].reduce((total, entry) => total + mediaTargets(entry).length, 0) + 1);
      let visits = 0;
      let next: { entry: DeckEntry; media: SlideMediaTarget } | null = null;

      if (!skipRemainingPhotos && prior.kind === "content") {
        const currentLive = liveRef.current.get(prior.messageId);
        if (currentLive && prior.media.kind === "photo" && prior.media.index + 1 < currentLive.photoUrls.length) {
          const media = mediaTargets(currentLive)[prior.media.index + 1];
          if (media?.kind === "photo") next = { entry: currentLive, media };
        }
      }

      while (visits < visitLimit) {
        visits += 1;
        if (!next) {
          let candidate: DeckEntry | undefined;
          while (queueRef.current.length && !candidate) {
            const queued = queueRef.current.shift()!;
            candidate = liveRef.current.get(queued.id);
          }
          if (!candidate && liveCount > 0) {
            queueRef.current = shuffleEntries([...liveRef.current.values()], priorId);
            continue;
          }
          if (!candidate) break;
          const media = mediaTargets(candidate)[0];
          if (!media) continue;
          next = { entry: candidate, media };
        }

        if (await promote(next.entry, next.media)) {
          rememberLeftEntry(priorId, next.entry.id);
          preloadNearFuture();
          schedule(preferencesRef.current.duration);
          return true;
        }

        // A failed photo is skipped. Re-read the live entry so a snapshot
        // received while loading cannot advance a removed or changed candidate.
        const liveEntry = liveRef.current.get(next.entry.id);
        if (
          next.media.kind === "photo"
          && isCurrentDeckCandidate(liveEntry, next.entry, next.media)
          && next.media.index + 1 < liveEntry.photoUrls.length
        ) {
          const media = mediaTargets(liveEntry)[next.media.index + 1];
          next = media?.kind === "photo" ? { entry: liveEntry, media } : null;
        } else {
          next = null;
        }
      }

      return false;
    },
    [preloadNearFuture, promote, rememberLeftEntry, schedule],
  );

  const advance = useCallback(async () => {
    if (advancingRef.current || unmountedRef.current) return;
    advancingRef.current = true;
    setIsLoading(false);
    try {
      const prior = currentRef.current;
      if (await promoteFromQueue(prior, false)) return;

      cycleRef.current += 1;
      updateSlot(emptySlot(cycleRef.current));
      schedule(preferencesRef.current.duration);
    } finally {
      advancingRef.current = false;
    }
  }, [promoteFromQueue, schedule, updateSlot]);

  const goNextEntry = useCallback(async () => {
    if (advancingRef.current || unmountedRef.current) return;
    if (liveRef.current.size === 0) return;
    advancingRef.current = true;
    setIsLoading(false);
    try {
      const prior = currentRef.current;
      if (await promoteFromQueue(prior, true)) return;

      cycleRef.current += 1;
      updateSlot(emptySlot(cycleRef.current));
      schedule(preferencesRef.current.duration);
    } finally {
      advancingRef.current = false;
    }
  }, [promoteFromQueue, schedule, updateSlot]);

  const goPrevEntry = useCallback(async () => {
    if (advancingRef.current || unmountedRef.current) return;
    if (historyRef.current.length === 0) return;

    advancingRef.current = true;
    setIsLoading(false);
    try {
      const prior = currentRef.current;
      let previous: DeckEntry | undefined;
      while (historyRef.current.length && !previous) {
        const candidateId = historyRef.current.pop()!;
        previous = liveRef.current.get(candidateId);
      }
      if (!previous) return;

      if (prior.kind === "content") {
        const currentLive = liveRef.current.get(prior.messageId);
        if (currentLive) {
          queueRef.current = [
            currentLive,
            ...queueRef.current.filter((queued) => queued.id !== currentLive.id),
          ];
        }
      }

      const firstMedia = mediaTargets(previous)[0];
      if (!firstMedia) return;
      if (await promote(previous, firstMedia)) {
        preloadNearFuture();
        schedule(preferencesRef.current.duration);
        return;
      }

      // First photo failed — fall through remaining photos of that entry, then stop.
      if (firstMedia.kind === "photo") {
        for (let index = 1; index < previous.photoUrls.length; index += 1) {
          const liveEntry = liveRef.current.get(previous.id);
          if (!liveEntry) break;
          const media = mediaTargets(liveEntry)[index];
          if (media?.kind === "photo" && await promote(liveEntry, media)) {
            preloadNearFuture();
            schedule(preferencesRef.current.duration);
            return;
          }
        }
      }
    } finally {
      advancingRef.current = false;
    }
  }, [preloadNearFuture, promote, schedule]);

  useEffect(() => {
    advanceRef.current = advance;
    preferencesRef.current = preferences;
  }, [advance, preferences]);

  useEffect(() => {
    if (!slug) return;
    setPreferencesState(loadSlideshowPreferences(slug));
  }, [slug]);

  useEffect(() => {
    liveRef.current = new Map(
      messages.flatMap((message) => {
        const entry = toDeckEntry(message);
        return entry ? [[entry.id, entry] as const] : [];
      }),
    );
    const activeId = currentRef.current.kind === "content" ? currentRef.current.messageId : undefined;
    queueRef.current = shuffleEntries(
      [...liveRef.current.values()].filter((entry) => entry.id !== activeId),
      activeId,
    );
    historyRef.current = historyRef.current.filter((id) => liveRef.current.has(id) && id !== activeId);
    preloadNearFuture();

    if (!ready || initializedRef.current) return;
    initializedRef.current = true;
    if (liveRef.current.size) void advanceRef.current();
    else schedule(preferencesRef.current.duration);
  }, [messages, preloadNearFuture, ready, schedule]);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      initializedRef.current = false;
      historyRef.current = [];
      clearTimer();
    };
  }, [clearTimer]);

  const pause = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    setIsPaused(true);
    remainingRef.current = deadlineRef.current === null
      ? preferencesRef.current.duration
      : Math.max(0, deadlineRef.current - Date.now());
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    setIsPaused(false);
    schedule(remainingRef.current ?? preferencesRef.current.duration);
    remainingRef.current = null;
  }, [schedule]);

  const setPreferences = useCallback(
    (next: SlideshowPreferences) => {
      const validated = { ...next };
      setPreferencesState(validated);
      if (slug) saveSlideshowPreferences(slug, validated);
      // A changed duration always affects the next full dwell; paused remainder is retained.
    },
    [slug],
  );

  return {
    slot,
    isEmpty: slot.kind === "empty",
    isLoading,
    isPaused,
    preferences,
    setPreferences,
    pause,
    resume,
    goNextEntry,
    goPrevEntry,
  };
}
