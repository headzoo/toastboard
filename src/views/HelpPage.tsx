"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MarketingShell } from "../components/MarketingShell";
import { kickerClass, ledeClass, narrowClass } from "../lib/styles";
import { applyTheme } from "../lib/theme";

const FAQS = [
  {
    q: "Do guests need an account?",
    a: "No. Guests scan a QR code or open a guest link, leave an optional name, a note, photos, or one short video, and they’re done. There is no sign-up and no email.",
  },
  {
    q: "How does the host moderate the guestbook?",
    a: "When you create a guestbook, The Willow Book gives you a private host link. Anyone with that link can hide messages. Guests never see moderation tools.",
  },
  {
    q: "What if I lose the host link?",
    a: "We cannot recover a lost host link. Save it somewhere only you can find — print the keepsafe card, or store it with your other important papers.",
  },
  {
    q: "Can guests add photos or video?",
    a: "Yes. Guests can add up to three photos or one short video per message — not both in the same message. We compress photos before upload so venue wifi survives.",
  },
  {
    q: "Is there a cost?",
    a: "Creating a Willow Book does not go through a checkout today. We may introduce paid plans later; ordinary use does not require a payment card now.",
  },
] as const;

export function HelpPage() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className={narrowClass}>
        <p className={kickerClass}>Help Center</p>
        <h1>Short answers</h1>
        <p className={ledeClass}>
          A Willow Book is a live guestbook for personal events. Guests scan a QR code — no account, no
          app, no email.
        </p>

        <dl className="mt-10 space-y-8">
          {FAQS.map((item) => (
            <div key={item.q}>
              <dt className="mb-2 font-serif text-[1.15rem] font-medium text-ink">{item.q}</dt>
              <dd className="m-0 text-[0.98rem] leading-relaxed text-ink-soft">{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-[0.95rem] text-ink-soft">
          See also our{" "}
          <Link className="text-ink underline decoration-oxblood/50 underline-offset-4" href="/terms/">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link className="text-ink underline decoration-oxblood/50 underline-offset-4" href="/privacy/">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </MarketingShell>
  );
}
