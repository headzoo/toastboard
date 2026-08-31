import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Shell } from "../components/ui.tsx";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import type { MarketingContent, MarketingVisualFigure } from "../lib/marketingContent.ts";
import { loadKeepsafe } from "../lib/session.ts";
import { btnClass, btnRowClass, kickerClass, ledeClass } from "../lib/styles.ts";
import { applyTheme } from "../lib/theme.ts";

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
  const figures = story.figures;
  const [first, ...rest] = figures;
  const gridPair = rest.filter((figure) => figure.layout === "grid-pair");
  const trailingFull = rest.filter((figure) => figure.layout === "full");

  return (
    <section className="mt-16 pb-8" aria-label={story.headline}>
      <p className={kickerClass}>{story.kicker}</p>
      <h2 className="mb-6 max-w-[28rem] font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-medium tracking-[-0.03em]">
        {story.headline}
      </h2>

      {first ? <VisualFigure figure={first} /> : null}

      {gridPair.length > 0 ? (
        <div className="mt-8 grid gap-6 min-[700px]:grid-cols-2">
          {gridPair.map((figure, index) => (
            <VisualFigure key={index} figure={figure} />
          ))}
        </div>
      ) : null}

      {trailingFull.map((figure, index) => (
        <div key={index} className="mt-8">
          <VisualFigure figure={figure} />
        </div>
      ))}
    </section>
  );
}

function Highlights({ highlights }: { highlights: NonNullable<MarketingContent["highlights"]> }) {
  return (
    <section className="mt-16 pb-8" aria-label="Why Toastboard works">
      <p className={kickerClass}>Why it works</p>
      <h2 className="mb-6 max-w-[28rem] font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-medium tracking-[-0.03em]">
        Built for the celebration, not the signup form.
      </h2>
      <div className="grid gap-4 min-[700px]:grid-cols-3">
        {highlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-[1.4rem] bg-cream/80 px-5 pb-4 pt-5 shadow-soft"
          >
            <h3 className="text-[1.15rem]">{highlight.title}</h3>
            <p className="mb-0 text-[0.95rem] text-ink-soft">{highlight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EventLandingPage({ content }: EventLandingPageProps) {
  const keepsafe = loadKeepsafe();
  const createPath = `/create?type=${content.eventType}`;

  usePageMetadata({
    title: `${content.hubTitle} guestbook — Toastboard`,
    description: content.hubDescription,
  });

  useEffect(() => {
    applyTheme(content.themeColor);
  }, [content.themeColor]);

  return (
    <Shell>
      <section className="max-w-[760px] pb-16 pt-[7vh]">
        <p className={kickerClass}>{content.kicker}</p>
        <h1>{content.headline}</h1>
        <p className={ledeClass}>{content.lede}</p>
        <div className={btnRowClass}>
          {keepsafe ? (
            <>
              <Link className={btnClass("primary")} to="/create">
                Edit guestbook
              </Link>
              <Link className={btnClass("ghost")} to={`${createPath}&new=true`}>
                Create another guestbook
              </Link>
            </>
          ) : (
            <Link className={btnClass("primary")} to={createPath}>
              {content.createCtaLabel}
            </Link>
          )}
          <Link className={btnClass("ghost")} to={`/e/${content.demoSlug}/wall`}>
            {content.demoCtaLabel}
          </Link>
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
    </Shell>
  );
}
