import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TableSignCard } from "./TableSignCard.tsx";
import { SignThemePicker } from "./SignThemePicker.tsx";
import { updateEventSignTheme } from "../lib/api.ts";
import { renderKeepsafePng } from "../lib/keepsafe.ts";
import { saveKeepsafe } from "../lib/session.ts";
import {
  DEFAULT_SIGN_THEME,
  getSignTheme,
  type SignThemeId,
} from "../lib/signThemes.ts";
import { btnClass, btnRowClass, ledeClass, narrowClass } from "../lib/styles.ts";
import { formatEventDate } from "../lib/theme.ts";
import { DEFAULT_THEME } from "../lib/types.ts";
import { copyText, downloadDataUrl, guestUrl, manageUrl, wallUrl } from "../lib/urls.ts";
import type { HostKeepsafe } from "../lib/types.ts";
import { Button, StatusNote } from "./ui.tsx";

export function HostKeepsafeCard({ keepsafe }: { keepsafe: HostKeepsafe }) {
  const [copied, setCopied] = useState<"host" | "guest" | null>(null);
  const [signTheme, setSignTheme] = useState<SignThemeId>(
    () => getSignTheme(keepsafe.signTheme).id,
  );
  const [themeBusy, setThemeBusy] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const themeRequestRef = useRef<SignThemeId | null>(null);
  const hostLink = useMemo(
    () => manageUrl(keepsafe.slug, keepsafe.hostToken),
    [keepsafe.slug, keepsafe.hostToken],
  );
  const guestLink = useMemo(() => guestUrl(keepsafe.slug), [keepsafe.slug]);
  const accent = keepsafe.themeColor || DEFAULT_THEME;

  async function selectSignTheme(id: SignThemeId) {
    if (themeBusy || id === signTheme) return;

    const prior = signTheme;
    themeRequestRef.current = id;
    setThemeError(null);
    setSignTheme(id);
    setThemeBusy(true);

    try {
      const saved = await updateEventSignTheme(keepsafe.slug, id, keepsafe.hostToken);
      if (themeRequestRef.current !== id) return;
      setSignTheme(saved);
      saveKeepsafe({ ...keepsafe, signTheme: saved });
    } catch (err) {
      if (themeRequestRef.current !== id) return;
      setSignTheme(prior);
      setThemeError(err instanceof Error ? err.message : "Couldn't save that design.");
    } finally {
      if (themeRequestRef.current === id) {
        setThemeBusy(false);
        themeRequestRef.current = null;
      }
    }
  }

  async function copy(kind: "host" | "guest") {
    const ok = await copyText(kind === "host" ? hostLink : guestLink);
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    }
  }

  async function downloadKeepsafe() {
    const png = await renderKeepsafePng({
      coupleNames: keepsafe.coupleNames,
      guestUrl: guestLink,
      manageUrl: hostLink,
      themeColor: accent,
      themeId: signTheme,
    });
    downloadDataUrl(png, `${keepsafe.slug}-host-keepsafe.png`);
  }

  return (
    <section className={narrowClass}>


      <h1 className="mt-2.5 mb-1">Save your host link</h1>

      <p className={ledeClass}>
        {keepsafe.coupleNames}’s guestbook is live. Print the table sign for your venue. Keep the host link somewhere only you can find.
      </p>



      <div className="my-5 grid gap-2.5 rounded-[1.2rem] bg-cream p-4">
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.04em]">Private host link</span>
        <StatusNote tone="warn">
          This host link is the only way to moderate the guestbook. It cannot be recovered if you lose it — there is no email, no account, no reset.
        </StatusNote>
        <code className="break-all text-[0.82rem] text-ink-soft">{hostLink}</code>
        <Button variant="ghost" href={hostLink}>
          Open host tools
        </Button>
        <Button variant="primary" onClick={() => void copy("host")}>
          {copied === "host" ? "Copied" : "Copy host link"}
        </Button>
      </div>

      <div className="my-5 grid gap-2.5 rounded-[1.2rem] bg-cream p-4">
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.04em]">Host backup</span>
        <p className="text-[0.92rem] leading-snug text-ink-soft">
          A private printable card with your guest QR code, host link, and guest page. Save it somewhere only you can find — like a wedding folder or password manager — so you can recover access if you lose this page.
        </p>
        <Button variant="ghost" onClick={() => void downloadKeepsafe()}>
          Download host backup
        </Button>
      </div>

      <SignThemePicker
        selected={signTheme}
        accent={accent}
        busy={themeBusy}
        onChange={(id) => void selectSignTheme(id)}
      />
      {themeError ? <StatusNote tone="error">{themeError}</StatusNote> : null}

      <TableSignCard
        slug={keepsafe.slug}
        coupleNames={keepsafe.coupleNames}
        themeColor={keepsafe.themeColor}
        themeId={signTheme || DEFAULT_SIGN_THEME}
        eventDateLabel={formatEventDate(keepsafe.eventDate)}
        welcomeMessage={keepsafe.welcomeMessage}
      />

      <div className="my-5 grid gap-2.5 rounded-[1.2rem] bg-cream p-4">
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.04em]">Guest page</span>
        <code className="break-all text-[0.82rem] text-ink-soft">{guestLink}</code>
        <Button variant="ghost" onClick={() => void copy("guest")}>
          {copied === "guest" ? "Copied" : "Copy wall link"}
        </Button>
      </div>

      <div className={btnRowClass}>
        <Button variant="ghost" href={wallUrl(keepsafe.slug)}>
          Open the wall
        </Button>
      </div>

      <div className="mt-8 flex justify-center">
        <Link className={btnClass("primary")} to="/create?new=true">
          Create another guestbook
        </Link>
      </div>
    </section>
  );
}
