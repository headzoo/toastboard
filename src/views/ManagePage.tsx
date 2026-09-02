"use client";

import { useEffect, useRef, useState } from "react";
import { TableSignCard } from "../components/TableSignCard";
import { SignThemePicker } from "../components/SignThemePicker";
import { Shell, StatusNote } from "../components/ui";
import { GuestbookFeed } from "../components/GuestbookFeed";
import { useEvent } from "../hooks/useEvent";
import { useMessages } from "../hooks/useMessages";
import { updateEventSignTheme } from "../lib/api";
import { eventGuestPath, eventGuestbookPath } from "../lib/eventRoutes";
import { getEventCopy } from "../lib/eventTypes";
import { getSignTheme, type SignThemeId } from "../lib/signThemes";
import { btnClass, btnRowClass, kickerClass, ledeClass, narrowClass } from "../lib/styles";
import { formatEventDate } from "../lib/theme";
import { DEFAULT_THEME } from "../lib/types";

export function ManagePage({ slug, token }: { slug: string; token: string }) {
  const { event, status } = useEvent(slug);
  const { messages, error } = useMessages(slug, status === "ready" && Boolean(token));
  const [signTheme, setSignTheme] = useState<SignThemeId>("classic");
  const [themeBusy, setThemeBusy] = useState(false);
  const [themePendingId, setThemePendingId] = useState<SignThemeId | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
  const themeRequestRef = useRef<SignThemeId | null>(null);

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  useEffect(() => {
    if (event) {
      setSignTheme(getSignTheme(event.signTheme).id);
    }
  }, [event]);

  async function selectSignTheme(id: SignThemeId) {
    if (!slug || !token || themeBusy || id === signTheme) return;

    themeRequestRef.current = id;
    setThemeError(null);
    setThemePendingId(id);
    setThemeBusy(true);

    try {
      const saved = await updateEventSignTheme(slug, id, token);
      if (themeRequestRef.current !== id) return;
      setSignTheme(saved);
    } catch (err) {
      if (themeRequestRef.current !== id) return;
      setThemeError(err instanceof Error ? err.message : "Couldn't save that design.");
    } finally {
      if (themeRequestRef.current === id) {
        setThemeBusy(false);
        setThemePendingId(null);
        themeRequestRef.current = null;
      }
    }
  }

  if (!token) {
    return (
      <Shell>
        <section className={narrowClass}>
          <h1>This page needs the host link</h1>
          <p>
            The Willow Book doesn’t have accounts. If you still have the original “save this link” page, that’s the
            credential.
          </p>
        </section>
      </Shell>
    );
  }

  if (status === "loading") {
    return (
      <Shell>
        <StatusNote>Opening host tools…</StatusNote>
      </Shell>
    );
  }

  if (status !== "ready" || !event || !slug) {
    return (
      <Shell>
        <section className={narrowClass}>
          <h1>Guestbook not found</h1>
        </section>
      </Shell>
    );
  }

  const accent = event.themeColor || DEFAULT_THEME;
  const copy = getEventCopy(event.eventType);
  const moderation = {
    hideConfirmLabel: copy.hideConfirmLabel,
    hideButtonLabel: copy.hideButtonLabel,
    hideErrorFallback: copy.hideErrorFallback,
  };

  return (
    <Shell>
      <section className="mb-8 max-w-[760px]">
        <p className={kickerClass}>Host tools — keep this URL private</p>
        <h1>{event.coupleNames}</h1>
        <p className={ledeClass}>{copy.moderationIntro}</p>
        <div className={btnRowClass}>
          <a className={btnClass("ghost")} href={eventGuestbookPath(slug)}>
            Public guestbook
          </a>
          <a className={btnClass("ghost")} href={eventGuestPath(slug)}>
            Guest form
          </a>
        </div>
      </section>

      <div className="mt-3 max-w-[760px]">
        <SignThemePicker
          selected={signTheme}
          accent={accent}
          busy={themeBusy}
          pendingId={themePendingId}
          onChange={(id) => void selectSignTheme(id)}
        />
        {themeError ? <StatusNote tone="error">{themeError}</StatusNote> : null}
        <TableSignCard
          slug={slug}
          eventType={event.eventType}
          coupleNames={event.coupleNames}
          themeColor={event.themeColor}
          themeId={signTheme}
          eventDateLabel={formatEventDate(event.eventDate)}
          welcomeMessage={event.welcomeMessage}
        />
      </div>

      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      <GuestbookFeed
        messages={messages}
        slug={slug}
        hostToken={token}
        emptyLabel={copy.moderationEmptyLabel}
        moderation={moderation}
      />
    </Shell>
  );
}
