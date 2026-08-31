import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Shell, StatusNote } from "../components/ui.tsx";
import { WallFeed } from "../components/WallFeed.tsx";
import { WallSlideshow } from "../components/WallSlideshow.tsx";
import { useEvent } from "../hooks/useEvent.ts";
import { useMessages } from "../hooks/useMessages.ts";
import { btnClass, btnRowClass, kickerClass, ledeClass, narrowClass } from "../lib/styles.ts";
import { getSignTheme } from "../lib/signThemes.ts";
import { getEventCopy } from "../lib/eventTypes.ts";
import { formatEventDate } from "../lib/theme.ts";

export function WallPage() {
  const { slug } = useParams();
  const { event, status } = useEvent(slug);
  const { messages, error, live } = useMessages(slug, status === "ready");
  const fullscreenRootRef = useRef<HTMLDivElement>(null);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement !== fullscreenRootRef.current) {
        setSlideshowActive(false);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  if (status === "loading") {
    return (
      <Shell footer={false}>
        <StatusNote>Loading the wall…</StatusNote>
      </Shell>
    );
  }

  if (status !== "ready" || !event || !slug) {
    return (
      <Shell footer={false}>
        <section className={narrowClass}>
          <h1>This wall isn’t here yet</h1>
          <p>Create a guestbook first, then share the guest QR.</p>
        </section>
      </Shell>
    );
  }

  const startSlideshow = async () => {
    const root = fullscreenRootRef.current;
    if (!root?.requestFullscreen) {
      setFullscreenError("Fullscreen isn’t available in this browser.");
      return;
    }
    setFullscreenError(null);
    try {
      await root.requestFullscreen();
      if (document.fullscreenElement === root) setSlideshowActive(true);
    } catch {
      setFullscreenError("Couldn’t start fullscreen. Please allow fullscreen and try again.");
    }
  };

  const exitSlideshow = () => {
    setSlideshowActive(false);
    if (document.fullscreenElement === fullscreenRootRef.current) {
      void document.exitFullscreen().catch(() => { });
    }
  };

  const palette = getSignTheme(event.signTheme);
  const copy = getEventCopy(event.eventType);

  return (
    <div ref={fullscreenRootRef}>
      {slideshowActive ? (
        <WallSlideshow
          event={event}
          messages={messages}
          ready={live}
          slug={slug}
          onExit={exitSlideshow}
        />
      ) : (
        <Shell footer={false}>
          <section className="mb-8 max-w-[760px]">
            <p className={kickerClass}>
              {live ? (
                <span className="size-2.5 animate-live rounded-full bg-ok shadow-[0_0_0_0_color-mix(in_srgb,var(--color-ok)_60%,transparent)]" />
              ) : null}
              Live guestbook
            </p>
            <h1>{event.coupleNames}</h1>
            {event.eventDate ? <p className={ledeClass}>{formatEventDate(event.eventDate)}</p> : null}
            <div className={`${btnRowClass} print:hidden`}>
              <Link className={btnClass("ghost")} to={`/e/${slug}`}>
                {copy.wallCtaLabel}
              </Link>
              <button
                className={btnClass("ghost")}
                type="button"
                onClick={() => void startSlideshow()}
                style={{ borderColor: palette.inkSoft, color: palette.ink, backgroundColor: palette.cream }}
              >
                Start slideshow
              </button>
            </div>
          </section>
          {error || fullscreenError ? <StatusNote tone="error">{error ?? fullscreenError}</StatusNote> : null}
          <WallFeed
            messages={messages}
            emptyLabel={copy.wallEmptyLabel}
          />
        </Shell>
      )}
    </div>
  );
}
