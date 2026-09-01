import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MarketingShell } from "../components/MarketingShell.tsx";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import { MARKETING_CONTENT, MARKETED_EVENT_TYPES } from "../lib/marketingContent.ts";
import { EXAMPLES_PAGE_METADATA } from "../lib/pageMetadata.ts";
import { kickerClass, ledeClass, marketingLinkClass, narrowClass } from "../lib/styles.ts";
import { applyTheme } from "../lib/theme.ts";

export function ExamplesPage() {
  usePageMetadata(EXAMPLES_PAGE_METADATA);

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
                  <Link className={marketingLinkClass} to={content.path}>
                    Learn more →
                  </Link>
                  <Link className={marketingLinkClass} to={`/e/${content.demoSlug}/guestbook`}>
                    {content.demoCtaLabel} →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <p className={`${narrowClass} mt-10 text-ink-soft`}>
          Ready to make your own?{" "}
          <Link className={marketingLinkClass} to="/create">
            Create a guestbook →
          </Link>
        </p>
      </article>
    </MarketingShell>
  );
}
