"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { PRICING_PAGE, PRICING_PLANS, type PricingPlanAccent } from "@/lib/pricingContent";
import { marketingBtnClass, marketingLinkClass } from "@/lib/styles";
import { applyTheme } from "@/lib/theme";

const ACCENT_WELL: Record<PricingPlanAccent, string> = {
  gold: "bg-gold",
  olive: "bg-ok",
  oxblood: "bg-oxblood",
};

export default function Page() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className="py-8 min-[900px]:py-10">
        <header className="mx-auto max-w-[40rem] text-center">
          <h1 className="text-balance font-serif text-[clamp(2.05rem,4.6vw,3.35rem)] font-medium tracking-[-0.03em]">
            {PRICING_PAGE.headline}
          </h1>
          <p className="mx-auto mb-0 max-w-[34rem] font-serif text-[1.08rem] italic leading-relaxed text-ink-soft">
            {PRICING_PAGE.lede}
          </p>
        </header>

        <ul className="m-0 mt-12 grid list-none gap-6 p-0 min-[900px]:grid-cols-3 min-[900px]:gap-5">
          {PRICING_PLANS.map((plan) => (
            <li
              key={plan.id}
              className="flex flex-col items-center rounded-[1.75rem] bg-cream px-6 py-9 text-center shadow-soft"
            >
              <h2 className="mb-5 font-serif text-[1.45rem] font-medium tracking-[-0.02em]">
                {plan.name}
              </h2>

              <span
                className={`mb-6 flex size-14 items-center justify-center rounded-full ${ACCENT_WELL[plan.accent]}`}
                aria-hidden="true"
              >
                <img
                  src={plan.iconSrc}
                  alt={plan.iconAlt}
                  className="h-8 w-8 object-contain brightness-0 invert"
                  width={32}
                  height={32}
                />
              </span>

              <p className="mb-1 flex items-baseline justify-center gap-2">
                <span className="font-serif text-[2.75rem] font-medium leading-none tracking-[-0.03em] text-ink">
                  {plan.price}
                </span>
                <span className="font-serif text-[0.95rem] text-ink-soft">{plan.priceNote}</span>
              </p>

              <ul className="m-0 mt-6 mb-8 flex w-full flex-col gap-3 p-0">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="list-none font-serif text-[0.98rem] leading-snug text-ink-soft"
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              <Link className={`${marketingBtnClass} mt-auto w-full max-w-[16rem]`} href={plan.ctaHref}>
                {plan.cta}
              </Link>
            </li>
          ))}
        </ul>

        <footer className="mx-auto mt-12 max-w-[36rem] text-center">
          <p className="mb-4 font-serif text-[1.02rem] leading-relaxed text-ink-soft">
            {PRICING_PAGE.footnote}
          </p>
          <Link className={marketingLinkClass} href={PRICING_PAGE.helpHref}>
            {PRICING_PAGE.helpLinkLabel}
          </Link>
        </footer>
      </article>
    </MarketingShell>
  );
}
