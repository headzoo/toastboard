import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MarketingShell } from "../components/MarketingShell.tsx";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import {
  HOME_FEATURES,
  HOME_HERO,
  HOME_IN_THE_ROOM,
  HOME_OCCASIONS,
  HOME_STEPS,
  type HomeStoryFigure,
} from "../lib/homepageContent.ts";
import { HUB_PAGE_METADATA } from "../lib/pageMetadata.ts";
import { loadKeepsafe } from "../lib/session.ts";
import {
  marketingBtnClass,
  marketingKickerClass,
  marketingLinkClass,
} from "../lib/styles.ts";
import { applyTheme } from "../lib/theme.ts";

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="mb-12 flex items-center gap-3">
      <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--color-ink)_18%,transparent)]" aria-hidden="true" />
      <img
        src="/mock/botanical_sprig_left.png"
        alt=""
        className="h-5 w-auto shrink-0 opacity-80"
        aria-hidden="true"
      />
      <h2 className="m-0 max-w-[min(32rem,72vw)] shrink text-balance text-center font-serif text-[clamp(1.7rem,3.5vw,2.3rem)] font-medium tracking-[-0.03em]">
        {children}
      </h2>
      <img
        src="/mock/botanical_sprig_right.png"
        alt=""
        className="h-5 w-auto shrink-0 opacity-80"
        aria-hidden="true"
      />
      <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--color-ink)_18%,transparent)]" aria-hidden="true" />
    </div>
  );
}

function HeartRule() {
  return (
    <div className="my-5 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-16 bg-gold/70 sm:w-24" />
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none" className="text-gold">
        <path
          d="M7 11.2S1.2 7.6 1.2 4.1A2.95 2.95 0 0 1 7 2.6a2.95 2.95 0 0 1 5.8 1.5C12.8 7.6 7 11.2 7 11.2Z"
          fill="currentColor"
        />
      </svg>
      <span className="h-px w-16 bg-gold/70 sm:w-24" />
    </div>
  );
}

function StoryFigure({ figure }: { figure: HomeStoryFigure }) {
  return (
    <figure className="m-0">
      <img
        className={`block w-full rounded-[1.4rem] object-cover shadow-soft${figure.aspectClass ? ` ${figure.aspectClass}` : ""
          }`}
        src={figure.src}
        alt={figure.alt}
        width={figure.width}
        height={figure.height}
        loading="lazy"
      />
      <figcaption className="mt-3 font-serif text-[1.05rem] text-ink-soft">{figure.caption}</figcaption>
    </figure>
  );
}

function HowItWorksFigures() {
  const [first, ...rest] = HOME_IN_THE_ROOM.figures;
  const pair = rest.filter((figure) => figure.layout === "grid-pair");
  const trailing = rest.filter((figure) => figure.layout === "full");

  return (
    <div className="mx-auto max-w-[900px]">
      {first ? <StoryFigure figure={first} /> : null}

      {pair.length > 0 ? (
        <div className="mt-8 grid gap-6 min-[700px]:grid-cols-2">
          {pair.map((figure) => (
            <StoryFigure key={figure.src} figure={figure} />
          ))}
        </div>
      ) : null}

      {trailing.map((figure) => (
        <div key={figure.src} className="mt-8">
          <StoryFigure figure={figure} />
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  usePageMetadata(HUB_PAGE_METADATA);
  const location = useLocation();

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace(/^#/, "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const keepsafe = loadKeepsafe();

  return (
    <MarketingShell>
      <section className="flex min-h-[calc(100svh-8.5rem)] flex-col items-center justify-center py-10 text-center">
        <p className={marketingKickerClass}>{HOME_HERO.kicker}</p>
        <h1 className="max-w-[18ch] text-balance font-serif text-[clamp(2.1rem,5.5vw,3.6rem)] font-medium tracking-[-0.03em]">
          {HOME_HERO.headline}
        </h1>
        <HeartRule />
        <p className="mx-auto mb-0 max-w-[36rem] font-serif text-[1.08rem] leading-relaxed text-ink-soft">
          {HOME_HERO.lede}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {keepsafe ? (
            <>
              <Link className={marketingBtnClass} to="/create">
                Edit guestbook
              </Link>
              <Link className={marketingLinkClass} to="/create?new=true">
                Create another guestbook →
              </Link>
            </>
          ) : (
            <>
              <Link className={marketingBtnClass} to="/create">
                {HOME_HERO.primaryCta}
              </Link>
              <a className={marketingLinkClass} href="#how-it-works">
                {HOME_HERO.secondaryCta} →
              </a>
            </>
          )}
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative left-1/2 w-screen max-w-none -translate-x-1/2 scroll-mt-8 py-12"
        aria-label="How it works"
      >
        <div className="px-[4vw] lg:px-[5vw]">
          <SectionHeading>How it works</SectionHeading>

          <ol className="m-0 grid list-none gap-10 p-0 min-[900px]:grid-cols-3 min-[900px]:gap-0">
            {HOME_STEPS.map((step, index) => (
              <li
                key={step.title}
                className={`flex flex-col gap-5 min-[900px]:px-8 ${index > 0
                  ? "min-[900px]:border-l min-[900px]:border-dotted min-[900px]:border-[color-mix(in_srgb,var(--color-ink)_28%,transparent)]"
                  : ""
                  }`}
              >
                <img
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  width={step.width}
                  height={step.height}
                  className="aspect-[4/3] w-full rounded-[1.2rem] object-contain"
                  loading="lazy"
                />
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold font-serif text-[1.15rem] font-medium text-cream">
                    {index + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="mb-1.5 font-serif text-[1.2rem] font-medium leading-tight">{step.title}</h3>
                    <p className="mb-0 font-serif text-[0.95rem] leading-snug text-ink-soft">{step.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-14">
            <SectionHeading>In the room</SectionHeading>
            <HowItWorksFigures />
          </div>
        </div>
      </section>

      <section
        id="occasions"
        className="relative left-1/2 w-screen max-w-none -translate-x-1/2 scroll-mt-8 py-12"
        aria-label="Choose your occasion"
      >
        <div className="px-[4vw] lg:px-[5vw]">
          <SectionHeading>Choose your occasion</SectionHeading>
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 min-[720px]:grid-cols-2 min-[1200px]:grid-cols-4">
            {HOME_OCCASIONS.map((occasion) => (
              <li key={occasion.path} className="min-w-0">
                <Link
                  className="flex items-start gap-4 rounded-lg border border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] px-5 py-3.5 text-ink no-underline transition-colors hover:border-ink/25"
                  to={occasion.path}
                >
                  <img
                    src={occasion.iconSrc}
                    alt=""
                    className="h-12 w-12 shrink-0 object-contain"
                    width={48}
                    height={48}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-serif text-[1.15rem] font-medium leading-tight">
                      {occasion.title}
                    </h3>
                    <p className="mb-2 font-serif text-[0.9rem] leading-snug text-ink-soft">
                      {occasion.description}
                    </p>
                    <span className="block font-serif text-[0.9rem] leading-none text-oxblood">
                      {occasion.cta}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="relative left-1/2 w-screen max-w-none -translate-x-1/2 "
        aria-label="What you get"
      >
        <div className="mx-auto max-w-[1180px] px-[4vw] py-10">
          <ul className="m-0 grid list-none gap-8 p-0 min-[800px]:grid-cols-3 min-[800px]:gap-0">
            {HOME_FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className={`flex gap-4 px-1 min-[800px]:px-6 ${index > 0
                  ? "min-[800px]:border-l min-[800px]:border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)]"
                  : ""
                  }`}
              >
                <img
                  src={feature.iconSrc}
                  alt={feature.iconAlt}
                  className="mt-1 h-12 w-12 shrink-0 object-contain"
                  width={48}
                  height={48}
                  aria-hidden={feature.iconAlt ? undefined : true}
                />
                <div>
                  <h2 className="mb-1 font-serif text-[1.2rem] font-medium tracking-[-0.02em]">
                    {feature.title}
                  </h2>
                  <p className="mb-0 font-serif text-[0.95rem] leading-relaxed text-ink-soft">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
