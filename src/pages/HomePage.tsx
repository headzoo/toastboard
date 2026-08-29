import { Link } from "react-router-dom";
import { DEMO_SLUG } from "../lib/api.ts";
import { applyTheme } from "../lib/theme.ts";
import { useEffect } from "react";
import { Shell } from "../components/ui.tsx";

export function HomePage() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <Shell>
      <section className="hero">
        <p className="kicker">Zero sign-up. Zero login. Zero email.</p>
        <h1>
          A guestbook that doesn’t
          <br />
          ask for an account.
        </h1>
        <p className="lede">
          Guests scan a QR code, leave a toast or a photo, and it appears on a live wall. The host link
          <em> is </em>
          the login — no passwords, for anyone.
        </p>
        <div className="btn-row">
          <Link className="btn btn-primary" to="/create">
            Create a guestbook
          </Link>
          <Link className="btn btn-ghost" to={`/e/${DEMO_SLUG}/wall`}>
            See a live wall
          </Link>
        </div>
      </section>

      <ol className="steps">
        <li>
          <span>1</span>
          <h2>Create once</h2>
          <p>Enter the couple’s names. Toastboard gives you a guest URL, a host link, and a QR code.</p>
        </li>
        <li>
          <span>2</span>
          <h2>Share the QR</h2>
          <p>Guests never sign in. Optional name, a note, a photo from their camera. That’s the whole form.</p>
        </li>
        <li>
          <span>3</span>
          <h2>Watch the wall</h2>
          <p>The reception screen updates live. Hide a toast later with the host link — possession is permission.</p>
        </li>
      </ol>
    </Shell>
  );
}
