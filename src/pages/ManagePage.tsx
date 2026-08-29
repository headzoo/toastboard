import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { TableSignCard } from "../components/TableSignCard.tsx";
import { SignThemePicker } from "../components/SignThemePicker.tsx";
import { Shell, StatusNote } from "../components/ui.tsx";
import { WallFeed } from "../components/WallFeed.tsx";
import { useEvent } from "../hooks/useEvent.ts";
import { useMessages } from "../hooks/useMessages.ts";
import { updateEventSignTheme } from "../lib/api.ts";
import { getSignTheme, type SignThemeId } from "../lib/signThemes.ts";
import { btnClass, btnRowClass, kickerClass, ledeClass, narrowClass } from "../lib/styles.ts";
import { formatEventDate } from "../lib/theme.ts";
import { DEFAULT_THEME } from "../lib/types.ts";

export function ManagePage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
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
            Toastboard doesn’t have accounts. If you still have the original “save this link” page, that’s the
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

  return (
    <Shell>
      <section className="mb-8 max-w-[760px]">
        <p className={kickerClass}>Host tools — keep this URL private</p>
        <h1>{event.coupleNames}</h1>
        <p className={ledeClass}>Hide a toast if you need to. Guests never see these buttons.</p>
        <div className={btnRowClass}>
          <Link className={btnClass("ghost")} to={`/e/${slug}/wall`}>
            Public wall
          </Link>
          <Link className={btnClass("ghost")} to={`/e/${slug}`}>
            Guest form
          </Link>
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
          coupleNames={event.coupleNames}
          themeColor={event.themeColor}
          themeId={signTheme}
          eventDateLabel={formatEventDate(event.eventDate)}
          welcomeMessage={event.welcomeMessage}
        />
      </div>

      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      <WallFeed
        messages={messages}
        slug={slug}
        hostToken={token}
        emptyLabel="No toasts yet. Share the guest QR and they’ll land here."
      />
    </Shell>
  );
}
