import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useSlideshowDeck } from "../hooks/useSlideshowDeck.ts";
import { getEventCopy } from "../lib/eventTypes.ts";
import { getSignTheme } from "../lib/signThemes.ts";
import { renderTableSignPng } from "../lib/tableSign.ts";
import type { MotionStyle } from "../lib/slideshow.ts";
import type { EventRecord, MessageRecord } from "../lib/types.ts";
import { formatEventDate } from "../lib/theme.ts";
import { guestUrl, qrDataUrl } from "../lib/urls.ts";
import { SlideshowSettingsDialog } from "./SlideshowSettingsDialog.tsx";

type Props = {
  event: EventRecord;
  messages: readonly MessageRecord[];
  ready: boolean;
  slug: string;
  onExit: () => void;
};

type ExpandTarget = "quote" | "photo" | "video";

type WakeLockSentinel = {
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
  removeEventListener: (type: "release", listener: () => void) => void;
};
type NavigatorWithWakeLock = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> } };

const EXPAND_MS = 10_000;
const SWIPE_THRESHOLD = 80;

const transitions = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  zoom: { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.02 } },
  lift: { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } },
  swing: { initial: { opacity: 0, rotate: -1.2 }, animate: { opacity: 1, rotate: 0 }, exit: { opacity: 0, rotate: 1.2 } },
} as const;

function stableNumber(value: string) {
  return [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
}

function transitionFor(slotKey: string, preference: MotionStyle, reduced: boolean) {
  if (reduced) return transitions.fade;
  const styles = ["fade", "zoom", "lift", "swing"] as const;
  return transitions[preference === "random" ? styles[stableNumber(slotKey) % styles.length] : preference];
}

export function GuestbookSlideshow({ event, messages, ready, slug, onExit }: Props) {
  const deck = useSlideshowDeck(slug, messages, ready);
  const effectiveSignTheme = deck.preferences.signTheme ?? event.signTheme;
  const palette = getSignTheme(effectiveSignTheme);
  const accent = event.themeColor ?? "#C45C67";
  const copy = getEventCopy(event.eventType);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandState, setExpandState] = useState<{ target: ExpandTarget; cycleKey: string } | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [qrEnlarged, setQrEnlarged] = useState(false);
  const [poster, setPoster] = useState<string | null>(null);
  const gearRef = useRef<HTMLButtonElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const [videoFailedCycleKey, setVideoFailedCycleKey] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const expanded = expandState?.cycleKey === deck.slot.cycleKey ? expandState.target : null;
  const qrIsEnlarged = deck.slot.kind !== "empty" && Boolean(qr) && qrEnlarged;
  const swipeEnabled = !settingsOpen;

  const navigateFromSwipe = useCallback((direction: "next" | "prev") => {
    setExpandState(null);
    if (direction === "next") void deck.goNextEntry();
    else void deck.goPrevEntry();
  }, [deck]);

  const onSwipeDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!swipeEnabled) return;
    if (info.offset.x <= -SWIPE_THRESHOLD) navigateFromSwipe("next");
    else if (info.offset.x >= SWIPE_THRESHOLD) navigateFromSwipe("prev");
  }, [navigateFromSwipe, swipeEnabled]);

  const onSwipePointerDown = useCallback((event: ReactPointerEvent) => {
    if (!swipeEnabled || !reducedMotion || !event.isPrimary) return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  }, [reducedMotion, swipeEnabled]);

  const onSwipePointerUp = useCallback((event: ReactPointerEvent) => {
    if (!swipeEnabled || !reducedMotion) {
      swipeStartRef.current = null;
      return;
    }
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
    navigateFromSwipe(dx < 0 ? "next" : "prev");
  }, [navigateFromSwipe, reducedMotion, swipeEnabled]);

  useEffect(() => {
    if (!qrIsEnlarged) return;
    const timer = setTimeout(() => setQrEnlarged(false), EXPAND_MS);
    return () => clearTimeout(timer);
  }, [qrIsEnlarged]);

  useEffect(() => {
    if (!expanded) return;
    const timer = setTimeout(() => setExpandState(null), EXPAND_MS);
    return () => clearTimeout(timer);
  }, [expanded]);

  const rootStyle = {
    "--slideshow-paper": palette.paper,
    "--slideshow-cream": palette.cream,
    "--slideshow-ink": palette.ink,
    "--slideshow-ink-soft": palette.inkSoft,
    "--slideshow-shadow": palette.shadow,
    "--slideshow-frame-border": palette.frameBorder,
    "--slideshow-frame-highlight": palette.frameHighlight,
    "--slideshow-accent": accent,
    "--slideshow-font": palette.id === "modern" ? '"Figtree", system-ui, sans-serif' : '"Fraunces", Georgia, serif',
  } as CSSProperties;

  useEffect(() => {
    let cancelled = false;
    void qrDataUrl(guestUrl(slug)).then((next) => {
      if (!cancelled) setQr(next);
    }).catch(() => {
      if (!cancelled) setQr(null);
    });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    void renderTableSignPng({
      coupleNames: event.coupleNames,
      guestUrl: guestUrl(slug),
      themeColor: accent,
      themeId: effectiveSignTheme,
      eventDateLabel: event.eventDate ? formatEventDate(event.eventDate) : null,
      welcomeMessage: event.welcomeMessage,
      signKicker: copy.signKicker,
      signScanInstruction: copy.signScanInstruction,
      signTagline: copy.signTagline,
    }, true).then((next) => {
      if (!cancelled) setPoster(next);
    }).catch(() => {
      if (!cancelled) setPoster(null);
    });
    return () => { cancelled = true; };
  }, [accent, copy.signKicker, copy.signScanInstruction, copy.signTagline, effectiveSignTheme, event.coupleNames, event.eventDate, event.welcomeMessage, slug]);

  useEffect(() => {
    const navigatorWithWakeLock = navigator as NavigatorWithWakeLock;
    let active = true;
    let requestId = 0;
    let requestInFlight = false;

    const clearSentinel = (sentinel: WakeLockSentinel) => {
      if (wakeLockRef.current === sentinel) wakeLockRef.current = null;
    };

    const attachReleaseListener = (sentinel: WakeLockSentinel) => {
      const onRelease = () => {
        sentinel.removeEventListener("release", onRelease);
        clearSentinel(sentinel);
      };
      sentinel.addEventListener("release", onRelease);
    };

    const requestWakeLock = async () => {
      if (!active || wakeLockRef.current || requestInFlight) return;
      requestInFlight = true;
      const id = ++requestId;
      try {
        const sentinel = await navigatorWithWakeLock.wakeLock?.request("screen") ?? null;
        if (!active || id !== requestId) {
          if (sentinel) void sentinel.release().catch(() => { });
          return;
        }
        if (sentinel) {
          wakeLockRef.current = sentinel;
          attachReleaseListener(sentinel);
        }
      } catch {
        // Wake Lock is best-effort; unsupported or denied requests are non-fatal.
      } finally {
        if (id === requestId) requestInFlight = false;
      }
    };

    const releaseWakeLock = () => {
      const lock = wakeLockRef.current;
      wakeLockRef.current = null;
      if (lock) void lock.release().catch(() => { });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && active && !wakeLockRef.current) void requestWakeLock();
    };

    void requestWakeLock();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      requestId += 1;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      releaseWakeLock();
    };
  }, []);

  useEffect(() => {
    if (settingsOpen || expanded) deck.pause();
    else deck.resume();
  }, [deck, expanded, settingsOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (expanded) setExpandState(null);
      else if (settingsOpen) setSettingsOpen(false);
      else onExit();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [expanded, onExit, settingsOpen]);

  const toggleExpand = (target: ExpandTarget) => {
    setExpandState((current) => {
      if (current?.cycleKey === deck.slot.cycleKey && current.target === target) return null;
      return { target, cycleKey: deck.slot.cycleKey };
    });
  };

  useEffect(() => {
    setVideoFailedCycleKey(null);
  }, [deck.slot.cycleKey]);

  const handleVideoError = useCallback(() => {
    setVideoFailedCycleKey((current) => {
      if (current === deck.slot.cycleKey) return current;
      return deck.slot.cycleKey;
    });
    setExpandState((current) => (
      current?.cycleKey === deck.slot.cycleKey && current.target === "video" ? null : current
    ));
  }, [deck.slot.cycleKey]);

  const rotation = useMemo(
    () => ((stableNumber(deck.slot.cycleKey) % 401) / 100) - 2,
    [deck.slot.cycleKey],
  );
  const animation = transitionFor(deck.slot.cycleKey, deck.preferences.motion, Boolean(reducedMotion));
  const hasPhoto = deck.slot.kind === "content" && deck.slot.media.kind === "photo";
  const hasVideo = deck.slot.kind === "content" && deck.slot.media.kind === "video";
  const videoFailed = hasVideo && videoFailedCycleKey === deck.slot.cycleKey;
  const hasText = deck.slot.kind === "content" && Boolean(deck.slot.text);
  const guestLabel = deck.slot.kind === "content" ? (deck.slot.guestName || "A guest") : "A guest";
  const expandMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 } };

  return (
    <section className="slideshow-root" style={rootStyle} aria-label={`${event.coupleNames} slideshow`}>
      <div
        className="slideshow-stage"
        aria-live="polite"
        onPointerDown={onSwipePointerDown}
        onPointerUp={onSwipePointerUp}
        onPointerCancel={() => { swipeStartRef.current = null; }}
      >
        <AnimatePresence mode="wait">
          {deck.slot.kind === "empty" ? (
            <motion.div
              key={deck.slot.cycleKey}
              className="slideshow-empty"
              {...animation}
              transition={{ duration: reducedMotion ? 0.18 : 0.5 }}
              drag={swipeEnabled && !reducedMotion ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onSwipeDragEnd}
            >
              {poster ? <img className="slideshow-poster" src={poster} alt={`Table sign for ${event.coupleNames}`} /> : null}
            </motion.div>
          ) : (
            <motion.article
              key={deck.slot.cycleKey}
              className={`slideshow-slide${hasPhoto || hasVideo ? " slideshow-slide-has-media" : ""}`}
              {...animation}
              transition={{ duration: reducedMotion ? 0.18 : 0.55 }}
              drag={swipeEnabled && !reducedMotion ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onSwipeDragEnd}
            >
              {deck.slot.media.kind === "photo" ? (
                <button
                  className="slideshow-photo-button"
                  type="button"
                  onClick={() => toggleExpand("photo")}
                  aria-expanded={expanded === "photo"}
                  aria-label={expanded === "photo" ? "Close photo" : "Expand photo"}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="slideshow-photo-frame">
                    <img
                      src={deck.slot.media.url}
                      className={deck.slot.dimensions && deck.slot.dimensions.height > deck.slot.dimensions.width
                        ? "slideshow-photo slideshow-photo-portrait"
                        : "slideshow-photo"}
                      alt=""
                    />
                  </div>
                </button>
              ) : null}
              {deck.slot.media.kind === "video" ? (
                <div className="slideshow-video-frame">
                  {videoFailed ? (
                    <div className="slideshow-video-unavailable" role="status">
                      <p className="slideshow-video-unavailable-text">Video unavailable</p>
                    </div>
                  ) : (
                    <>
                      <video
                        key={deck.slot.cycleKey}
                        className="slideshow-video"
                        src={deck.slot.media.url}
                        autoPlay
                        muted
                        playsInline
                        preload="metadata"
                        aria-label={`Video from ${guestLabel}`}
                        onError={handleVideoError}
                      />
                      <button
                        className="slideshow-video-expand"
                        type="button"
                        onClick={() => toggleExpand("video")}
                        aria-expanded={expanded === "video"}
                        aria-label={expanded === "video" ? "Close video" : "Expand video"}
                      >
                        Expand
                      </button>
                    </>
                  )}
                </div>
              ) : null}
              {hasText ? (
                <button
                  type="button"
                  className="slideshow-quote-card"
                  aria-expanded={expanded === "quote"}
                  aria-label={expanded === "quote" ? "Hide full message" : "Show full message"}
                  onClick={() => toggleExpand("quote")}
                >
                  <p className="slideshow-quote">{deck.slot.text}</p>
                  <p className="slideshow-attribution">— {guestLabel}</p>
                </button>
              ) : (
                <div className="slideshow-quote-card slideshow-quote-card-empty">
                  <p className="slideshow-attribution">— {guestLabel}</p>
                </div>
              )}
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      {deck.slot.kind !== "empty" && qr ? (
        <button
          type="button"
          className={`slideshow-qr${qrIsEnlarged ? " slideshow-qr-enlarged" : ""}`}
          aria-pressed={qrIsEnlarged}
          aria-label={qrIsEnlarged ? "Shrink guest QR" : "Enlarge guest QR"}
          onClick={() => setQrEnlarged((current) => !current)}
        >
          <img src={qr} alt="" />
          <span>{copy.slideshowQrPrompt}</span>
        </button>
      ) : null}

      <div className="slideshow-controls">
        <button ref={gearRef} className="slideshow-gear" type="button" onClick={() => setSettingsOpen(true)} aria-label="Open slideshow settings">
          <span aria-hidden="true">⚙</span>
          <span>Settings</span>
        </button>
        <button className="slideshow-exit" type="button" onClick={onExit}>
          Exit slideshow
        </button>
      </div>

      <AnimatePresence>
        {expanded && deck.slot.kind === "content" ? (
          <motion.div
            key={expanded}
            className="slideshow-expand-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.22 }}
            onPointerDown={(event) => {
              if (!swipeEnabled || !event.isPrimary) return;
              swipeStartRef.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerUp={(event) => {
              if (!swipeEnabled) {
                swipeStartRef.current = null;
                return;
              }
              const start = swipeStartRef.current;
              swipeStartRef.current = null;
              if (!start) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
              navigateFromSwipe(dx < 0 ? "next" : "prev");
            }}
            onPointerCancel={() => { swipeStartRef.current = null; }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setExpandState(null);
            }}
          >
            {expanded === "quote" && deck.slot.text ? (
              <motion.button
                type="button"
                className="slideshow-expand-quote"
                aria-label="Hide full message"
                onClick={() => setExpandState(null)}
                {...expandMotion}
                transition={{ duration: reducedMotion ? 0.12 : 0.28 }}
              >
                <p className="slideshow-expand-quote-text">{deck.slot.text}</p>
                <p className="slideshow-attribution">— {guestLabel}</p>
              </motion.button>
            ) : null}
            {expanded === "photo" && deck.slot.media.kind === "photo" ? (
              <motion.button
                type="button"
                className="slideshow-expand-photo"
                aria-label="Close photo"
                onClick={() => setExpandState(null)}
                {...expandMotion}
                transition={{ duration: reducedMotion ? 0.12 : 0.28 }}
              >
                <div className="slideshow-expand-photo-frame">
                  <img className="slideshow-expand-photo-image" src={deck.slot.media.url} alt="" />
                </div>
              </motion.button>
            ) : null}
            {expanded === "video" && deck.slot.media.kind === "video" && !videoFailed ? (
              <motion.div
                className="slideshow-expand-video"
                role="dialog"
                aria-label={`Expanded video from ${guestLabel}`}
                {...expandMotion}
                transition={{ duration: reducedMotion ? 0.12 : 0.28 }}
              >
                <video
                  key={deck.slot.cycleKey}
                  className="slideshow-expand-video-player"
                  src={deck.slot.media.url}
                  autoPlay
                  muted
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Video from ${guestLabel}`}
                  onError={handleVideoError}
                />
                <button type="button" className="slideshow-expand-video-close" onClick={() => setExpandState(null)}>
                  Close video
                </button>
              </motion.div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {settingsOpen ? (
        <SlideshowSettingsDialog
          preferences={deck.preferences}
          accent={accent}
          eventSignTheme={event.signTheme}
          onChange={deck.setPreferences}
          onClose={() => setSettingsOpen(false)}
          restoreFocusRef={gearRef}
        />
      ) : null}
    </section>
  );
}
