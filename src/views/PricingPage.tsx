"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MarketingShell } from "../components/MarketingShell";
import { kickerClass, ledeClass, marketingBtnClass, narrowClass } from "../lib/styles";
import { applyTheme } from "../lib/theme";

export function PricingPage() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className={narrowClass}>
        <p className={kickerClass}>Pricing</p>
        <h1>No checkout today</h1>
        <p className={ledeClass}>
          Creating a Willow Book does not go through a checkout today. No payment card required for
          ordinary use.
        </p>

        <section className="mt-8 space-y-4 font-serif text-[1.05rem] leading-relaxed text-ink-soft">
          <p>
            We may introduce paid plans later. If we do, we will say so plainly — and we will not charge
            you for something you did not agree to.
          </p>
          <p>
            For now, start a guestbook, share the link, and keep the words people say at your table.
          </p>
        </section>

        <div className="mt-10">
          <Link className={marketingBtnClass} href="/create/">
            Create a guestbook
          </Link>
        </div>
      </article>
    </MarketingShell>
  );
}
