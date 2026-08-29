import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TableSignCard } from "./TableSignCard.tsx";
import { renderKeepsafePng } from "../lib/keepsafe.ts";
import { saveKeepsafe } from "../lib/session.ts";
import {
  DEFAULT_SIGN_THEME,
  getSignTheme,
  SIGN_THEMES,
  type SignThemeId,
} from "../lib/signThemes.ts";
import { btnRowClass, ledeClass, narrowClass } from "../lib/styles.ts";
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
  const hostLink = useMemo(
    () => manageUrl(keepsafe.slug, keepsafe.hostToken),
    [keepsafe.slug, keepsafe.hostToken],
  );
  const guestLink = useMemo(() => guestUrl(keepsafe.slug), [keepsafe.slug]);
  const accent = keepsafe.themeColor || DEFAULT_THEME;

  function selectSignTheme(id: SignThemeId) {
    setSignTheme(id);
    saveKeepsafe({ ...keepsafe, signTheme: id });
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
      <StatusNote tone="warn">
        This host link is the only way to moderate the guestbook. It cannot be recovered if you lose it — there is no email, no account, no reset.
      </StatusNote>

      <h1 className="mt-2.5">Save your host link</h1>
      <p className={ledeClass}>
        {keepsafe.coupleNames}’s guestbook is live. Print the table sign for your venue. Keep the host link somewhere only you can find.
      </p>

      <div className="my-5 grid gap-2.5 rounded-[1.2rem] bg-cream p-4">
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.04em]">Private host link</span>
        <code className="break-all text-[0.82rem] text-ink-soft">{hostLink}</code>
        <Button variant="primary" onClick={() => void copy("host")}>
          {copied === "host" ? "Copied" : "Copy host link"}
        </Button>
      </div>

      <fieldset className="my-6 block border-0 p-0">
        <legend className="mb-1.5 block text-[0.82rem] font-bold">Table sign design</legend>
        <p className="mb-3 mt-0 text-[0.9rem] text-ink-soft">
          Pick a look for the printables. Your accent color still carries through.
        </p>
        <div className="grid grid-cols-2 gap-2.5 min-[520px]:grid-cols-3">
          {SIGN_THEMES.map((theme) => {
            const selected = signTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                aria-pressed={selected}
                aria-label={`${theme.label}: ${theme.description}`}
                onClick={() => selectSignTheme(theme.id)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-[1rem] border-0 bg-cream px-3 py-2.5 text-left${selected ? " outline outline-3 outline-offset-2 outline-ink" : ""
                  }`}
              >
                <span
                  className="size-8 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                  style={{
                    background: `linear-gradient(135deg, ${theme.paper} 55%, ${accent} 55%)`,
                  }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block text-[0.88rem] font-bold leading-tight">{theme.label}</span>
                  <span className="block text-[0.75rem] leading-snug text-ink-soft">
                    {theme.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

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
          {copied === "guest" ? "Copied" : "Copy guest link"}
        </Button>
      </div>

      <div className={btnRowClass}>
        <Button variant="ghost" onClick={() => void downloadKeepsafe()}>
          Download host backup (private)
        </Button>
        <Button variant="ghost" href={wallUrl(keepsafe.slug)}>
          Open the wall
        </Button>
        <Button variant="ghost" href={hostLink}>
          Open host tools
        </Button>
      </div>

      <p className="mt-8 text-[0.9rem]">
        <Link to="/create?new=true">
          Create another guestbook
        </Link>
      </p>
    </section>
  );
}
