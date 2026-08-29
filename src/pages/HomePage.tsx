import { Shell } from "../components/ui.tsx";
import { btnClass, btnRowClass, kickerClass, ledeClass } from "../lib/styles.ts";
import { DEMO_SLUG } from "../lib/api.ts";
import { applyTheme } from "../lib/theme.ts";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export function HomePage() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

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
          <Link className={btnClass("primary")} to="/create">
            Create a guestbook
          </Link>
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
    </Shell>
  );
}
