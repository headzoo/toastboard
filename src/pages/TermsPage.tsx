import { MarketingShell } from "../components/MarketingShell.tsx";
import { kickerClass, ledeClass, narrowClass } from "../lib/styles.ts";
import { TERMS_PAGE_METADATA } from "../lib/pageMetadata.ts";
import { applyTheme } from "../lib/theme.ts";
import { usePageMetadata } from "../hooks/usePageMetadata.ts";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export function TermsPage() {
  usePageMetadata(TERMS_PAGE_METADATA);

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <MarketingShell>
      <article className={narrowClass}>
        <p className={kickerClass}>Legal</p>
        <h1>Terms and Conditions</h1>
        <p className={ledeClass}>Effective date: 31 August 2026</p>

        <section className="mt-8 space-y-4">
          <h2>1. Agreement</h2>
          <p>
            These Terms and Conditions (“Terms”) govern your use of Wishing Wall, a personal event
            guestbook service available at toastboard.web.app (the “Service”). By creating a guestbook,
            submitting Guest Content, viewing a wall, or otherwise using the Service, you agree to these
            Terms. If you do not agree, do not use the Service.
          </p>

          <h2>2. The Service</h2>
          <p>
            Wishing Wall lets hosts create a digital guestbook without signing up for an account. Guests
            scan a QR code or open a guest link, leave an optional name, a note, photos (up to ten),
            or one short video (under 10 MiB), and that content appears on a live wall. Video uploads
            may show a processing state until Cloud Functions prepare a browser-compatible display copy.
            Hosts moderate with a private host link rather than a username and password. There is no
            email-based account, login, or password reset.
          </p>

          <h2>3. Host credentials</h2>
          <p>
            When you create a guestbook, Wishing Wall gives you a host link that acts as the credential
            for that event. Anyone who has the host link can moderate the guestbook. Wishing Wall cannot
            recover a lost host link. You are responsible for saving and protecting it.
          </p>

          <h2>4. Guest content</h2>
          <p>
            Guests may submit text, photos, and short videos (“Guest Content”). Guest Content posted
            to a guestbook may be shown on a public wall and in a slideshow for that event. You retain
            ownership of content you submit, and you grant Wishing Wall a worldwide, non-exclusive
            license to host, store, display, transcode or remux video as needed, and transmit content
            as needed to operate the Service.
          </p>
          <p>
            You must only submit content you have the right to share. Do not submit unlawful, abusive,
            harassing, defamatory, infringing, or otherwise inappropriate material. Hosts may hide or
            remove Guest Content. Wishing Wall may remove content or disable access that violates these
            Terms or harms the Service.
          </p>

          <h2>5. Acceptable use</h2>
          <p>
            You agree not to misuse the Service, including by attempting unauthorized access,
            interfering with operation, scraping at abusive rates, uploading malware, or using the
            Service for spam or commercial solicitation unrelated to a personal event guestbook.
          </p>

          <h2>6. Intellectual property</h2>
          <p>
            Wishing Wall’s name, branding, design, and software are owned by Wishing Wall or its licensors.
            These Terms do not grant you rights to copy, modify, or redistribute the Service except as
            needed for ordinary use.
          </p>

          <h2>7. Availability and changes</h2>
          <p>
            The Service is provided as-is. Features may change, and Wishing Wall may suspend or
            discontinue parts of the Service. We may update these Terms by posting a revised version
            with an updated effective date. Continued use after changes means you accept the revised
            Terms.
          </p>

          <h2>8. Disclaimers</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”
            WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. Wishing Wall does not warrant that
            the Service will be uninterrupted, secure, or error-free, or that Guest Content will be
            preserved indefinitely.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WISHING WALL AND ITS OPERATORS WILL NOT BE LIABLE FOR
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF DATA,
            PROFITS, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY
            CLAIM RELATED TO THE SERVICE WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS (US $100) OR THE
            AMOUNT YOU PAID TO USE THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM, WHICHEVER IS
            GREATER. Some jurisdictions do not allow certain limitations; in those places, liability is
            limited to the fullest extent permitted.
          </p>

          <h2>10. Privacy</h2>
          <p>
            How we handle information is described in our{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <h2>11. Governing law</h2>
          <p>
            These Terms are governed by the laws applicable where Wishing Wall operates, without regard
            to conflict-of-law principles. Courts in that jurisdiction will have exclusive venue for
            disputes that cannot be resolved informally, except where mandatory consumer protections
            require otherwise.
          </p>

          <h2>12. Contact</h2>
          <p>
            Questions about these Terms may be directed to Wishing Wall through the site at
            toastboard.web.app.
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
