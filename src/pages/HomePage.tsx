import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Shell } from "../components/ui.tsx";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import { HUB_USE_CASES } from "../lib/marketingContent.ts";
import { HUB_PAGE_METADATA } from "../lib/pageMetadata.ts";
import { loadKeepsafe } from "../lib/session.ts";
import { btnClass, btnRowClass, kickerClass, ledeClass } from "../lib/styles.ts";
import { applyTheme } from "../lib/theme.ts";

export function HomePage() {
  usePageMetadata(HUB_PAGE_METADATA);

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  const keepsafe = loadKeepsafe();

  return (
    <Shell>
      <section className="max-w-[760px] pb-10 pt-4">
        <p className={kickerClass}>Zero sign-up. Zero login. Zero email.</p>
        <h1>
          A guestbook that doesn’t
          <br />
          ask for an account.
        </h1>
        <p className={ledeClass}>
          Wishing Wall is a live event guestbook for weddings, birthdays, graduations, religious
          milestones, and more. Guests scan a QR code, leave a note, photos, or one short video, and it appears on a
          wall. The host link is the login — no passwords, for anyone.
        </p>
        <div className={btnRowClass}>
          {keepsafe ? (
            <>
              <Link className={btnClass("primary")} to="/create">
                Edit guestbook
              </Link>
              <Link className={btnClass("ghost")} to="/create?new=true">
                Create another guestbook
              </Link>
            </>
          ) : (
            <Link className={btnClass("primary")} to="/create">
              Create a guestbook
            </Link>
          )}
        </div>
      </section>

      <section className="mt-10 pb-16" aria-label="Event types">
        <p className={kickerClass}>For every celebration</p>
        <h2 className="mb-6 max-w-[28rem] font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-medium tracking-[-0.03em]">
          Pick the guestbook that fits your event.
        </h2>
        <ul className="m-0 grid list-none gap-4 p-0 min-[700px]:grid-cols-2">
          {HUB_USE_CASES.map((useCase) => (
            <li key={useCase.eventType}>
              <Link
                className="block h-full rounded-[1.4rem] bg-cream/80 px-5 pb-5 pt-5 text-ink no-underline shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(42,33,24,0.12)]"
                to={useCase.path}
              >
                <h3 className="text-[1.25rem]">{useCase.title}</h3>
                <p className="mb-0 text-[0.95rem] text-ink-soft">{useCase.description}</p>
                <span className="mt-4 inline-block text-[0.9rem] font-[650] text-accent-deep">
                  Learn more →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
