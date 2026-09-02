"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MarketingShell } from "../components/MarketingShell";
import { MARKETING_CONTENT, MARKETED_EVENT_TYPES } from "../lib/marketingContent";
import { eventGuestbookPath } from "../lib/eventRoutes";
import { kickerClass, ledeClass, marketingLinkClass, narrowClass } from "../lib/styles";
import { applyTheme } from "../lib/theme";

export function ExamplesPage() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className="mx-auto max-w-[900px]">
        <p className={kickerClass}>Examples</p>
        <h1>See a guestbook in the room</h1>
        <p className={`${ledeClass} max-w-[40rem]`}>
          Each occasion has a short landing page and a live demo guestbook you can open without creating
          anything. No accounts. No checkout.
        </p>

        <ul className="mt-10 grid list-none gap-4 p-0 min-[700px]:grid-cols-2">
          {MARKETED_EVENT_TYPES.map((eventType) => {
            const content = MARKETING_CONTENT[eventType];
            return (
              <li
                key={eventType}
                className="rounded-xl border border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] bg-cream/70 px-5 py-5"
              >
                <h2 className="mb-2 font-serif text-[1.3rem] font-medium">{content.hubTitle}</h2>
                <p className="mb-4 text-[0.95rem] text-ink-soft">{content.hubDescription}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <Link className={marketingLinkClass} href={content.path}>
                    Learn more →
                  </Link>
                  <a className={marketingLinkClass} href={eventGuestbookPath(content.demoSlug)}>
                    {content.demoCtaLabel} →
                  </a>
                </div>
              </li>
            );
          })}
        </ul>

        <p className={`${narrowClass} mt-10 text-ink-soft`}>
          Ready to make your own?{" "}
          <Link className={marketingLinkClass} href="/create/">
            Create a guestbook →
          </Link>
        </p>
      </article>
    </MarketingShell>
  );
}
