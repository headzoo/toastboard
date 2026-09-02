"use client";

import { useEffect } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { ledeClass, narrowClass } from "@/lib/styles";
import { applyTheme } from "@/lib/theme";

export default function Page() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className={narrowClass}>
        <h1 className="mt-8">About The Willow Book</h1>
        <p className={ledeClass}>
          The Willow Book is a live guestbook for a gathering. Guests leave a note, a photo, or a short
          video — without making an account to do it.
        </p>

        <section className="mt-8 space-y-4 font-serif text-[1.05rem] leading-relaxed text-ink-soft">
          <p>
            The Willow Book is our answer to a simple question: how do you keep the words people say at
            your table, without asking them to sign in to say them?
          </p>
          <p>
            Guests scan a QR code or open a link, write a note, and may add a picture or a short video.
            There is no app to download, no email to give, and no password to remember. The guestbook
            fills in the room — on a phone, a tablet, or a screen at the gathering.
          </p>
          <p>
            You create the guestbook once. The words stay yours to return to — the next morning, a year
            later, years after that.
          </p>
          <p>
            A wedding, a birthday, a graduation, a milestone, or any table worth remembering: we hold
            every detail to one measure — simple to use, built to last, worth returning to.
          </p>
          <p>
            The Willow Book is made the{" "}
            <a
              className="text-ink underline decoration-oxblood/50 underline-offset-4"
              href="https://keepwellandbell.com"
            >
              Keepwell &amp; Bell
            </a>{" "}
            way — quietly, carefully, as a keepsake rather than a login.
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
