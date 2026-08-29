import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { QrPanel } from "../components/QrPanel.tsx";
import { Shell, StatusNote } from "../components/ui.tsx";
import { WallFeed } from "../components/WallFeed.tsx";
import { useEvent } from "../hooks/useEvent.ts";
import { useMessages } from "../hooks/useMessages.ts";

export function ManagePage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { event, status } = useEvent(slug);
  const { messages, error } = useMessages(slug, status === "ready" && Boolean(token));

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  if (!token) {
    return (
      <Shell>
        <section className="narrow">
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
        <section className="narrow">
          <h1>Guestbook not found</h1>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="wall-header">
        <p className="kicker">Host tools — keep this URL private</p>
        <h1>{event.coupleNames}</h1>
        <p className="lede">Hide a toast if you need to. Guests never see these buttons.</p>
        <div className="btn-row">
          <Link className="btn btn-ghost" to={`/e/${slug}/wall`}>
            Public wall
          </Link>
          <Link className="btn btn-ghost" to={`/e/${slug}`}>
            Guest form
          </Link>
        </div>
      </section>

      <div className="manage-qr">
        <QrPanel slug={slug} />
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
