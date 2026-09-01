import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MarketingShell } from "../components/MarketingShell.tsx";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import { PRICING_PAGE_METADATA } from "../lib/pageMetadata.ts";
import { kickerClass, ledeClass, marketingBtnClass, narrowClass } from "../lib/styles.ts";
import { applyTheme } from "../lib/theme.ts";

export function PricingPage() {
  usePageMetadata(PRICING_PAGE_METADATA);

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className={narrowClass}>
        <p className={kickerClass}>Pricing</p>
        <h1>No checkout today</h1>
        <p className={ledeClass}>
          Creating a Wishing Wall does not go through a payment form. There is no price list on this
          page because we are not collecting payment card details as part of ordinary use.
        </p>

        <section className="mt-8 space-y-4 text-ink-soft">
          <p>
            You can create a guestbook, share a QR code, and collect notes, photos, and one short
            video without signing up for an account. If that ever changes — if we introduce paid
            plans or a checkout — this page will say so plainly.
          </p>
          <p>
            Until then, the measure stays the same: simple to use, built to last, worth returning to.
          </p>
        </section>

        <div className="mt-8">
          <Link className={marketingBtnClass} to="/create">
            Create a guestbook
          </Link>
        </div>
      </article>
    </MarketingShell>
  );
}
