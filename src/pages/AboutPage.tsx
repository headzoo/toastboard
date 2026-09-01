import { useEffect } from "react";
import { MarketingShell } from "../components/MarketingShell.tsx";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import { ABOUT_PAGE_METADATA } from "../lib/pageMetadata.ts";
import { kickerClass, ledeClass, narrowClass } from "../lib/styles.ts";
import { applyTheme } from "../lib/theme.ts";

export function AboutPage() {
  usePageMetadata(ABOUT_PAGE_METADATA);

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className={narrowClass}>
        <p className={kickerClass}>Our standards</p>
        <h1>About Keepwell &amp; Bell</h1>
        <p className={ledeClass}>
          At Keepwell &amp; Bell, we set high standards. Every wall we build is meant to be read again
          — at the gathering, the next morning, years later.
        </p>

        <section className="mt-8 space-y-4 font-serif text-[1.05rem] leading-relaxed text-ink-soft">
          <p>
            We hold every detail, from a single toast to a full celebration, to one measure: simple to
            use, built to last, worth returning to.
          </p>
          <p>
            Keepwell &amp; Bell seeks fine craftsmanship in the smallest details — a card, a wall, a
            keepsake. We believe no memory should need a password to be kept safe.
          </p>
          <p>
            Wishing Wall is our answer to a simple question: how do you keep the words people say at
            your table, without asking them to sign in to say them?
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
