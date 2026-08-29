import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Shell, StatusNote } from "../components/ui.tsx";
import { WallFeed } from "../components/WallFeed.tsx";
import { useEvent } from "../hooks/useEvent.ts";
import { useMessages } from "../hooks/useMessages.ts";
import { btnClass, btnRowClass, kickerClass, ledeClass, narrowClass } from "../lib/styles.ts";
import { formatEventDate } from "../lib/theme.ts";

export function WallPage() {
  const { slug } = useParams();
  const { event, status } = useEvent(slug);
  const { messages, error, live } = useMessages(slug, status === "ready");
  const [present, setPresent] = useState(false);

  if (status === "loading") {
    return (
      <Shell>
        <StatusNote>Gathering toasts…</StatusNote>
      </Shell>
    );
  }

  if (status !== "ready" || !event || !slug) {
    return (
      <Shell>
        <section className={narrowClass}>
          <h1>This wall isn’t here yet</h1>
          <p>Create a guestbook first, then share the guest QR.</p>
        </section>
      </Shell>
    );
  }

  return (
    <Shell present={present}>
      <section className="mb-8 max-w-[760px]">
        <p className={kickerClass}>
          {live ? (
            <span className="size-2.5 animate-live rounded-full bg-ok shadow-[0_0_0_0_color-mix(in_srgb,var(--color-ok)_60%,transparent)]" />
          ) : null}
          Live guestbook
        </p>
        <h1>{event.coupleNames}</h1>
        {event.eventDate ? <p className={ledeClass}>{formatEventDate(event.eventDate)}</p> : null}
        {present ? null : (
          <div className={`${btnRowClass} print:hidden`}>
            <Link className={btnClass("ghost")} to={`/e/${slug}`}>
              Leave a toast
            </Link>
            <button className={btnClass("ghost")} type="button" onClick={() => setPresent(true)}>
              Present on a screen
            </button>
          </div>
        )}
      </section>
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      <WallFeed
        messages={messages}
        emptyLabel="The first toast hasn’t been written yet. Scan the QR and be the first."
      />
    </Shell>
  );
}
