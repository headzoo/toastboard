import { Shell } from "../components/ui.tsx";
import { btnClass, btnRowClass, kickerClass, ledeClass } from "../lib/styles.ts";
import { DEMO_SLUG } from "../lib/api.ts";
import { loadKeepsafe } from "../lib/session.ts";
import { applyTheme } from "../lib/theme.ts";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export function HomePage() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  const keepsafe = loadKeepsafe();

  return (
    <Shell>
      <section className="max-w-[760px] pb-16 pt-[7vh]">
        <p className={kickerClass}>Zero sign-up. Zero login. Zero email.</p>
        <h1>
          A guestbook that doesn’t
          <br />
          ask for an account.
        </h1>
        <p className={ledeClass}>
          Guests scan a QR code, leave a toast or a photo, and it appears on a live wall. The host link
          <em> is </em>
          the login — no passwords, for anyone.
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
          <Link className={btnClass("ghost")} to={`/e/${DEMO_SLUG}/wall`}>
            See a live wall
          </Link>
        </div>
      </section>

      <ol className="mt-8 grid list-none gap-4 p-0 min-[700px]:grid-cols-3">
        <li className="rounded-[1.4rem] bg-cream/80 px-5 pb-4 pt-5 shadow-soft">
          <span className="font-serif text-[1.4rem] text-accent">1</span>
          <h2>Create once</h2>
          <p>Enter the couple’s names. Toastboard gives you a guest URL, a host link, and a QR code.</p>
        </li>
        <li className="rounded-[1.4rem] bg-cream/80 px-5 pb-4 pt-5 shadow-soft">
          <span className="font-serif text-[1.4rem] text-accent">2</span>
          <h2>Share the QR</h2>
          <p>Guests never sign in. Optional name, a note, a photo from their camera. That’s the whole form.</p>
        </li>
        <li className="rounded-[1.4rem] bg-cream/80 px-5 pb-4 pt-5 shadow-soft">
          <span className="font-serif text-[1.4rem] text-accent">3</span>
          <h2>Watch the wall</h2>
          <p>The reception screen updates live. Hide a toast later with the host link — possession is permission.</p>
        </li>
      </ol>

      <section className="mt-16 pb-8" aria-label="Toastboard at the reception">
        <p className={kickerClass}>In the room</p>
        <h2 className="mb-6 max-w-[28rem] font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-medium tracking-[-0.03em]">
          The guestbook that sits with the party.
        </h2>

        <figure className="m-0">
          <img
            className="block w-full rounded-[1.4rem] object-cover shadow-soft"
            src="/branding/family-table-wall.jpg"
            alt="The bride, groom, and family sitting at the head table, with a TV to the left showing the Toastboard live guestbook, a dance floor in front, and guests at tables beyond"
            width={1920}
            height={1080}
          />
          <figcaption className="mt-3 font-serif text-[1.05rem] text-ink-soft">
            The family table watches the wall fill.
          </figcaption>
        </figure>

        <div className="mt-8 grid gap-6 min-[700px]:grid-cols-2">
          <figure className="m-0">
            <img
              className="block aspect-[3/4] w-full rounded-[1.4rem] object-cover shadow-soft"
              src="/branding/table-sign.jpg"
              alt="Printed cream Toastboard table sign with a rose border, Maya and James, and a large QR code standing on a guest table among candles and flowers"
              width={900}
              height={1200}
            />
            <figcaption className="mt-3 font-serif text-[1.05rem] text-ink-soft">
              Print one card per table.
            </figcaption>
          </figure>
          <figure className="m-0">
            <img
              className="block aspect-[4/3] w-full rounded-[1.4rem] object-cover shadow-soft min-[700px]:aspect-[3/4]"
              src="/branding/guest-scan.jpg"
              alt="A wedding guest holds a phone over a Toastboard table sign, scanning the QR code while the reception continues behind them"
              width={1200}
              height={900}
            />
            <figcaption className="mt-3 font-serif text-[1.05rem] text-ink-soft">
              Guests scan. No app.
            </figcaption>
          </figure>
        </div>

        <figure className="m-0 mt-8">
          <img
            className="block w-full rounded-[1.4rem] object-cover shadow-soft"
            src="/branding/reception-selfie.jpg"
            alt="Guests take a selfie at a wedding reception with a Toastboard table sign and QR code visible on a nearby table"
            width={1920}
            height={1080}
          />
          <figcaption className="mt-3 font-serif text-[1.05rem] text-ink-soft">
            The party keeps going.
          </figcaption>
        </figure>
      </section>
    </Shell>
  );
}
