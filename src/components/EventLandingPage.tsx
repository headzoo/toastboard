"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MarketingContent, MarketingVisualFigure } from "../lib/marketingContent";
import { eventGuestbookPath } from "../lib/eventRoutes";
import { loadKeepsafe } from "../lib/session";
import type { HostKeepsafe } from "../lib/types";
import { btnClass, btnRowClass, kickerClass, ledeClass } from "../lib/styles";
import { applyTheme } from "../lib/theme";

type EventLandingPageProps = {
  content: MarketingContent;
};

function VisualFigure({ figure }: { figure: MarketingVisualFigure }) {
  const { image, caption } = figure;
  const imgClass = `block w-full rounded-[1.4rem] object-cover shadow-soft${image.aspectClass ? ` ${image.aspectClass}` : ""}`;

  return (
    <figure className="m-0">
      <img
        className={imgClass}
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
      />
      <figcaption className="mt-3 font-serif text-[1.05rem] text-ink-soft">{caption}</figcaption>
    </figure>
  );
}

function VisualStory({ story }: { story: NonNullable<MarketingContent["visualStory"]> }) {
  return (
    <section className="mt-16">
      <p className={kickerClass}>{story.kicker}</p>
      <h2 className="max-w-[28rem]">{story.headline}</h2>
      <div className="mt-8 grid gap-8">
        {story.figures.map((figure) => (
          <VisualFigure key={figure.caption} figure={figure} />
        ))}
      </div>
    </section>
  );
}

function Highlights({ highlights }: { highlights: NonNullable<MarketingContent["highlights"]> }) {
  return (
    <section className="mt-16">
      <div className="grid gap-4 min-[700px]:grid-cols-2">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-[1.4rem] border border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] bg-cream/70 px-5 py-5"
          >
            <h2 className="mb-2 font-serif text-[1.2rem] font-medium">{item.title}</h2>
            <p className="mb-0 text-[0.95rem] text-ink-soft">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EventLandingPage({ content }: EventLandingPageProps) {
  const [keepsafe, setKeepsafe] = useState<HostKeepsafe | null>(null);
  const createPath = `/create/?type=${content.eventType}`;

  useEffect(() => {
    setKeepsafe(loadKeepsafe());
  }, []);

  useEffect(() => {
    applyTheme(content.themeColor);
  }, [content.themeColor]);

  return (
    <>
      <section className="max-w-[760px] pb-16 pt-8">
        <p className={kickerClass}>{content.kicker}</p>
        <h1>{content.headline}</h1>
        <p className={ledeClass}>{content.lede}</p>
        <div className={btnRowClass}>
          {keepsafe ? (
            <>
              <Link className={btnClass("primary")} href="/create/">
                Edit guestbook
              </Link>
              <Link className={btnClass("ghost")} href={`${createPath}&new=true`}>
                Create another guestbook
              </Link>
            </>
          ) : (
            <Link className={btnClass("primary")} href={createPath}>
              {content.createCtaLabel}
            </Link>
          )}
          <a className={btnClass("ghost")} href={eventGuestbookPath(content.demoSlug)}>
            {content.demoCtaLabel}
          </a>
        </div>
      </section>

      <ol className="mt-8 grid list-none gap-4 p-0 min-[700px]:grid-cols-3">
        {content.steps.map((step, index) => (
          <li key={step.title} className="rounded-[1.4rem] bg-cream/80 px-5 pb-4 pt-5 shadow-soft">
            <span className="font-serif text-[1.4rem] text-accent">{index + 1}</span>
            <h2>{step.title}</h2>
            <p className="mb-0">{step.description}</p>
          </li>
        ))}
      </ol>

      {content.visualStory ? <VisualStory story={content.visualStory} /> : null}
      {content.highlights ? <Highlights highlights={content.highlights} /> : null}
    </>
  );
}
