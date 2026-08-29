import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSlideshowDeck } from "../hooks/useSlideshowDeck.ts";
import { getSignTheme } from "../lib/signThemes.ts";
import { renderTableSignPng } from "../lib/tableSign.ts";
import type { MotionStyle } from "../lib/slideshow.ts";
import type { EventRecord, MessageRecord } from "../lib/types.ts";
import { formatEventDate } from "../lib/theme.ts";
import { guestUrl, qrDataUrl } from "../lib/urls.ts";
import { PhotoLightbox } from "./PhotoLightbox.tsx";
import { SlideshowSettingsDialog } from "./SlideshowSettingsDialog.tsx";

type Props = {
  event: EventRecord;
  messages: readonly MessageRecord[];
  ready: boolean;
  slug: string;
  onExit: () => void;
};

type WakeLockSentinel = {
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
  removeEventListener: (type: "release", listener: () => void) => void;
};
type NavigatorWithWakeLock = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> } };

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

export function WallSlideshow({ event, messages, ready, slug, onExit }: Props) {
  const palette = getSignTheme(event.signTheme);
  const deck = useSlideshowDeck(slug, messages, ready);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const gearRef = useRef<HTMLButtonElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const reducedMotion = useReducedMotion();

  const rootStyle = {
    "--slideshow-paper": palette.paper,
    "--slideshow-cream": palette.cream,
    "--slideshow-ink": palette.ink,
    "--slideshow-ink-soft": palette.inkSoft,
    "--slideshow-accent": event.themeColor ?? "#C45C67",
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
      themeColor: event.themeColor ?? "#C45C67",
      themeId: event.signTheme,
      eventDateLabel: event.eventDate ? formatEventDate(event.eventDate) : null,
      welcomeMessage: event.welcomeMessage,
    }, true).then((next) => {
      if (!cancelled) setPoster(next);
    }).catch(() => {
      if (!cancelled) setPoster(null);
    });
    return () => { cancelled = true; };
  }, [event, slug]);

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
    if (settingsOpen || lightbox) deck.pause();
    else deck.resume();
  }, [deck, lightbox, settingsOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (lightbox) setLightbox(null);
      else if (settingsOpen) setSettingsOpen(false);
      else onExit();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [lightbox, onExit, settingsOpen]);

  const openLightbox = () => {
    const slot = deck.slot;
    if (slot.kind !== "content" || slot.photoIndex === null) return;
    const message = messages.find((entry) => entry.id === slot.messageId);
    if (!message?.photoUrls.length) return;
    setLightbox({ urls: [...message.photoUrls], index: slot.photoIndex });
  };

  const rotation = useMemo(
    () => ((stableNumber(deck.slot.cycleKey) % 401) / 100) - 2,
    [deck.slot.cycleKey],
  );
  const animation = transitionFor(deck.slot.cycleKey, deck.preferences.motion, Boolean(reducedMotion));

  return (
    <section className="slideshow-root" style={rootStyle} aria-label={`${event.coupleNames} slideshow`}>
      <div className="slideshow-stage" aria-live="polite">
        <AnimatePresence mode="wait">
          {deck.slot.kind === "empty" ? (
            <motion.div
              key={deck.slot.cycleKey}
              className="slideshow-empty"
              {...animation}
              transition={{ duration: reducedMotion ? 0.18 : 0.5 }}
            >
              {poster ? <img className="slideshow-poster" src={poster} alt={`Table sign for ${event.coupleNames}`} /> : null}
            </motion.div>
          ) : (
            <motion.article
              key={deck.slot.cycleKey}
              className="slideshow-slide"
              {...animation}
              transition={{ duration: reducedMotion ? 0.18 : 0.55 }}
            >
              {deck.slot.photoUrl ? (
                <button
                  className="slideshow-photo-button"
                  type="button"
                  onClick={openLightbox}
                  aria-label="View photo"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="slideshow-photo-frame">
                    <img
                      src={deck.slot.photoUrl}
                      className={deck.slot.dimensions && deck.slot.dimensions.height > deck.slot.dimensions.width
                        ? "slideshow-photo slideshow-photo-portrait"
                        : "slideshow-photo"}
                      alt=""
                    />
                  </div>
                </button>
              ) : null}
              <div className={`slideshow-quote-card${deck.slot.text ? "" : " slideshow-quote-card-empty"}`}>
                {deck.slot.text ? <p className="slideshow-quote">{deck.slot.text}</p> : null}
                <p className="slideshow-attribution">— {deck.slot.guestName || "A guest"}</p>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      {deck.slot.kind !== "empty" && qr ? (
        <aside className="slideshow-qr" aria-label="Scan to leave a toast">
          <img src={qr} alt="QR code to leave a toast" />
          <span>Scan to leave a toast</span>
        </aside>
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
      {settingsOpen ? (
        <SlideshowSettingsDialog
          preferences={deck.preferences}
          onChange={deck.setPreferences}
          onClose={() => setSettingsOpen(false)}
          restoreFocusRef={gearRef}
        />
      ) : null}
      {lightbox ? (
        <PhotoLightbox
          urls={lightbox.urls}
          index={lightbox.index}
          onIndexChange={(next) => setLightbox((current) => current ? { ...current, index: next } : current)}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </section>
  );
}
