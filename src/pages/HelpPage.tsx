import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MarketingShell } from "../components/MarketingShell.tsx";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import { HELP_PAGE_METADATA } from "../lib/pageMetadata.ts";
import { kickerClass, ledeClass, narrowClass } from "../lib/styles.ts";
import { applyTheme } from "../lib/theme.ts";

const FAQS = [
  {
    q: "Do guests need an account?",
    a: "No. Guests scan a QR code or open a guest link, leave an optional name, a note, photos, or one short video, and they’re done. There is no sign-up and no email.",
  },
  {
    q: "How does the host moderate the wall?",
    a: "When you create a guestbook, Wishing Wall gives you a private host link. Anyone with that link can hide messages. Guests never see moderation tools.",
  },
  {
    q: "What if I lose the host link?",
    a: "We cannot recover a lost host link. Save it somewhere only you can find — print the keepsafe card, or store it with your other important papers.",
  },
  {
    q: "What can guests upload?",
    a: "A note, up to ten photos, or one short video under 10 MiB. Video may show a processing state briefly while we prepare a display copy.",
  },
  {
    q: "Where can I read the fine print?",
    a: "See our Terms and Conditions and Privacy Policy. Both describe how the service works without accounts or passwords.",
  },
] as const;

export function HelpPage() {
  usePageMetadata(HELP_PAGE_METADATA);

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className={narrowClass}>
        <p className={kickerClass}>Help</p>
        <h1>Help Center</h1>
        <p className={ledeClass}>
          Short answers for hosts and guests. If something still feels unclear, the host link remains
          the only key we’ll ever give you.
        </p>

        <dl className="mt-8 space-y-6">
          {FAQS.map((item) => (
            <div key={item.q}>
              <dt className="font-serif text-[1.15rem] font-medium text-ink">{item.q}</dt>
              <dd className="m-0 mt-2 text-ink-soft">{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-ink-soft">
          Full details live in the{" "}
          <Link to="/terms">Terms and Conditions</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </article>
    </MarketingShell>
  );
}
