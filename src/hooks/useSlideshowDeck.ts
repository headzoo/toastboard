import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_SLIDESHOW_PREFERENCES,
  loadSlideshowPreferences,
  saveSlideshowPreferences,
  shuffleEntries,
  SlideImageCache,
  isCurrentDeckCandidate,
  toDeckEntry,
  type ContentSlideSlot,
  type DeckEntry,
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
  photoIndex: number | null,
  cycle: number,
  dimensions?: { width: number; height: number },
): ContentSlideSlot {
  return {
    kind: "content",
    cycleKey: `${entry.id}:${photoIndex ?? "text"}:${cycle}`,
    messageId: entry.id,
    photoIndex,
    text: entry.text,
    guestName: entry.guestName,
    photoUrl: photoIndex === null ? null : entry.photoUrls[photoIndex] ?? null,
    ...(dimensions ? { dimensions } : {}),
  };
}

/**
 * A frozen-slot controller for the fullscreen wall. Changing `messages` only
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
  const advanceRef = useRef<() => Promise<void>>(async () => {});
  const preferencesRef = useRef(preferences);

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
    if (current.kind === "content" && current.photoUrl) cacheRef.current.preload(current.photoUrl);
    if (current.kind === "content") {
      const entry = liveRef.current.get(current.messageId);
      if (entry && current.photoIndex !== null) {
        entry.photoUrls.slice(current.photoIndex + 1).forEach((url) => cacheRef.current.preload(url));
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
    async (entry: DeckEntry, photoIndex: number | null): Promise<boolean> => {
      if (photoIndex === null) {
        const liveEntry = liveRef.current.get(entry.id);
        if (!isCurrentDeckCandidate(liveEntry, entry, null, undefined)) return false;
        cycleRef.current += 1;
        updateSlot(contentSlot(liveEntry, null, cycleRef.current));
        queueRef.current = queueRef.current.filter((queued) => queued.id !== liveEntry.id);
        setIsLoading(false);
        return true;
      }
      const url = entry.photoUrls[photoIndex];
      if (!url) return false;
      setIsLoading(true);
      const dimensions = await cacheRef.current.preload(url);
      if (unmountedRef.current) return false;
      if (!dimensions) {
        setIsLoading(false);
        return false;
      }
      const liveEntry = liveRef.current.get(entry.id);
      if (!isCurrentDeckCandidate(liveEntry, entry, photoIndex, url)) {
        setIsLoading(false);
        return false;
      }
      cycleRef.current += 1;
      updateSlot(contentSlot(liveEntry, photoIndex, cycleRef.current, dimensions));
      queueRef.current = queueRef.current.filter((queued) => queued.id !== liveEntry.id);
      setIsLoading(false);
      return true;
    },
    [updateSlot],
  );

  const advance = useCallback(async () => {
    if (advancingRef.current || unmountedRef.current) return;
    advancingRef.current = true;
    setIsLoading(false);
    try {
      const prior = currentRef.current;
      const liveCount = liveRef.current.size;
      const visitLimit = Math.max(1, [...liveRef.current.values()].reduce((total, entry) => total + Math.max(1, entry.photoUrls.length), 0) + 1);
      let visits = 0;
      let next: { entry: DeckEntry; photoIndex: number | null } | null = null;

      if (prior.kind === "content") {
        const currentLive = liveRef.current.get(prior.messageId);
        if (currentLive && prior.photoIndex !== null && prior.photoIndex + 1 < currentLive.photoUrls.length) {
          next = { entry: currentLive, photoIndex: prior.photoIndex + 1 };
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
            const avoidId = prior.kind === "content" ? prior.messageId : undefined;
            queueRef.current = shuffleEntries([...liveRef.current.values()], avoidId);
            continue;
          }
          if (!candidate) break;
          next = { entry: candidate, photoIndex: candidate.photoUrls.length ? 0 : null };
        }

        if (await promote(next.entry, next.photoIndex)) {
          preloadNearFuture();
          schedule(preferencesRef.current.duration);
          return;
        }

        // A failed photo is skipped. Re-read the live entry so a snapshot
        // received while loading cannot advance a removed or changed candidate.
        const liveEntry = liveRef.current.get(next.entry.id);
        if (
          next.photoIndex !== null
          && isCurrentDeckCandidate(liveEntry, next.entry, next.photoIndex, next.entry.photoUrls[next.photoIndex])
          && next.photoIndex + 1 < liveEntry.photoUrls.length
        ) {
          next = { entry: liveEntry, photoIndex: next.photoIndex + 1 };
        } else {
          next = null;
        }
      }

      cycleRef.current += 1;
      updateSlot(emptySlot(cycleRef.current));
      schedule(preferencesRef.current.duration);
    } finally {
      advancingRef.current = false;
    }
  }, [preloadNearFuture, promote, schedule, updateSlot]);

  useEffect(() => {
    advanceRef.current = advance;
    preferencesRef.current = preferences;
  }, [advance, preferences]);

  useEffect(() => {
    if (!slug) return;
    setPreferencesState(loadSlideshowPreferences(slug));
  }, [slug]);

  useEffect(() => {
    liveRef.current = new Map(messages.map((message) => [message.id, toDeckEntry(message)]));
    const activeId = currentRef.current.kind === "content" ? currentRef.current.messageId : undefined;
    queueRef.current = shuffleEntries(
      [...liveRef.current.values()].filter((entry) => entry.id !== activeId),
      activeId,
    );
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
  };
}
