import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MarketingShell } from "../components/MarketingShell.tsx";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import { HOSTS_PAGE_METADATA } from "../lib/pageMetadata.ts";
import { kickerClass, ledeClass, marketingBtnClass, narrowClass } from "../lib/styles.ts";
import { applyTheme } from "../lib/theme.ts";
import { loadKeepsafe } from "../lib/session.ts";

export function HostsPage() {
  usePageMetadata(HOSTS_PAGE_METADATA);

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  const keepsafe = loadKeepsafe();

  return (
    <MarketingShell>
      <article className={narrowClass}>
        <p className={kickerClass}>For hosts</p>
        <h1>Your link is the only key</h1>
        <p className={ledeClass}>
          The Willow Book does not ask for an email or a password. When you create a guestbook, we give
          you a host link once. Keep it safe — it’s the only key we’ll ever give you.
        </p>

        <section className="mt-8 space-y-4 text-ink-soft">
          <p>
            Anyone who has the host link can moderate the guestbook: hide a toast, change the table-sign
            look, or open the live display. Guests never see those tools.
          </p>
          <p>
            This browser may remember a keepsafe copy so you can return to your guestbook from{" "}
            <Link to="/create">Create</Link>. That local copy is a convenience, not a backup. Print
            the keepsafe card, or store the host link somewhere only you can find.
          </p>
          <p>
            We cannot recover a lost host link. Possession is permission — treat the link the way you
            would treat a spare key.
          </p>
        </section>

        <div className="mt-8">
          {keepsafe ? (
            <Link className={marketingBtnClass} to="/create">
              Open your guestbook
            </Link>
          ) : (
            <Link className={marketingBtnClass} to="/create">
              Create a guestbook
            </Link>
          )}
        </div>
      </article>
    </MarketingShell>
  );
}
