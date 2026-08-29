import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Shell, StatusNote } from "../components/ui.tsx";
import { WallFeed } from "../components/WallFeed.tsx";
import { useEvent } from "../hooks/useEvent.ts";
import { useMessages } from "../hooks/useMessages.ts";
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
        <section className="narrow">
          <h1>This wall isn’t here yet</h1>
          <p>Create a guestbook first, then share the guest QR.</p>
        </section>
      </Shell>
    );
  }

  return (
    <Shell present={present}>
      <section className="wall-header">
        <p className="kicker">
          {live ? <span className="live-dot" /> : null}
          Live guestbook
        </p>
        <h1>{event.coupleNames}</h1>
        {event.eventDate ? <p className="lede">{formatEventDate(event.eventDate)}</p> : null}
        <div className="btn-row no-print">
          <Link className="btn btn-ghost" to={`/e/${slug}`}>
            Leave a toast
          </Link>
          <button className="btn btn-ghost" type="button" onClick={() => setPresent((value) => !value)}>
            {present ? "Exit presentation" : "Present on a screen"}
          </button>
        </div>
      </section>
      {error ? <StatusNote tone="error">{error}</StatusNote> : null}
      <WallFeed
        messages={messages}
        emptyLabel="The first toast hasn’t been written yet. Scan the QR and be the first."
      />
    </Shell>
  );
}
