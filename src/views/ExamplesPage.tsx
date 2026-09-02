"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MarketingShell } from "../components/MarketingShell";
import { HOME_OCCASION_YOU_PICK } from "../lib/homepageContent";
import { MARKETING_CONTENT, MARKETED_EVENT_TYPES } from "../lib/marketingContent";
import { eventGuestbookPath } from "../lib/eventRoutes";
import { ledeClass, marketingLinkClass, narrowClass } from "../lib/styles";
import { applyTheme } from "../lib/theme";

export function ExamplesPage() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className="mx-auto max-w-[900px]">
        <h1 className="mt-8">See a guestbook in the room</h1>
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
                className="min-w-0 rounded-xl border border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] bg-cream/70 px-5 py-5"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={content.iconSrc}
                    alt=""
                    className="h-12 w-12 shrink-0 object-contain"
                    width={48}
                    height={48}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
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
                  </div>
                </div>
              </li>
            );
          })}
          <li className="min-w-0 min-[700px]:col-span-2 min-[700px]:flex min-[700px]:justify-center">
            <div className="w-full min-[700px]:max-w-[calc((100%-1rem)/2)] rounded-xl border border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] bg-cream/70 px-5 py-5">
              <div className="flex items-start gap-4">
                <img
                  src={HOME_OCCASION_YOU_PICK.iconSrc}
                  alt=""
                  className="h-12 w-12 shrink-0 object-contain"
                  width={48}
                  height={48}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="mb-2 font-serif text-[1.3rem] font-medium">
                    {HOME_OCCASION_YOU_PICK.title}
                  </h2>
                  <p className="mb-4 text-[0.95rem] text-ink-soft">
                    {HOME_OCCASION_YOU_PICK.description}
                  </p>
                  <Link className={marketingLinkClass} href={HOME_OCCASION_YOU_PICK.path}>
                    {HOME_OCCASION_YOU_PICK.cta}
                  </Link>
                </div>
              </div>
            </div>
          </li>
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
