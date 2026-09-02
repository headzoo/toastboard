"use client";

import Link from "next/link";
import { useEffect } from "react";
import { kickerClass, ledeClass, narrowClass } from "@/lib/styles";
import { applyTheme } from "@/lib/theme";

export default function Page() {
  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  return (
    <article className={narrowClass}>
      <p className={kickerClass}>Legal</p>
      <h1>Privacy Policy</h1>
      <p className={ledeClass}>Effective date: 31 August 2026</p>

      <section className="mt-8 space-y-4">
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains how The Willow Book (“we,” “us”) collects, uses, and shares
          information when you use the personal event guestbook service at toastboard.web.app (the
          “Service”). Guests do not create accounts. Hosts sign in with Google or email to create and
          keep guestbooks; the host link remains a spare credential for moderation.
        </p>

        <h2>2. Information we collect</h2>
        <p>Depending on how you use the Service, we may process:</p>
        <ul className="mb-4 list-disc space-y-2 pl-5">
          <li>
            <strong>Event details</strong> you provide when creating a guestbook, such as the event
            or host display name (for example couple names, a celebrant name, or an honoree name),
            optional event date, welcome message, theme color, and sign design.
          </li>
          <li>
            <strong>Guest Content</strong> submitted to a guestbook: optional guest name, note text,
            photos, and short videos (under 10 MiB).
          </li>
          <li>
            <strong>Host account data</strong> when you sign in: email address and authentication
            identifiers from Google or email/password sign-in, used to tie guestbooks to your account.
          </li>
          <li>
            <strong>Host credentials</strong>: a host token associated with your guestbook. We store
            a cryptographic hash of the host token so we can verify the host link; we do not store
            the raw token on our servers after creation.
          </li>
          <li>
            <strong>Technical data</strong> typical of web services, such as IP address, browser
            type, and request logs processed by our hosting and infrastructure providers.
          </li>
          <li>
            <strong>Browser storage</strong> on your device: a local “keepsafe” copy of host details
            and optional slideshow preferences for a guestbook. This stays in your browser unless you
            clear site data.
          </li>
        </ul>
        <p>
          We do not ask guests for email, phone number, or payment card details as part of ordinary
          guestbook use. Hosts provide an email address (or use Google) when signing in.
        </p>

        <h2>3. How we use information</h2>
        <p>We use information to:</p>
        <ul className="mb-4 list-disc space-y-2 pl-5">
          <li>Operate guestbooks, guest forms, live guestbooks, and slideshows</li>
          <li>
            Process uploaded videos into a browser-compatible display copy using Firebase Cloud
            Functions (including transcoding or remuxing as needed)
          </li>
          <li>Verify host links and signed-in host access, and allow hosts to hide or remove Guest Content</li>
          <li>Secure, maintain, and improve the Service</li>
          <li>Comply with law and enforce our Terms</li>
        </ul>

        <h2>4. Public guestbook content</h2>
        <p>
          Guest Content posted to a guestbook is intended to appear on that event’s public guestbook and
          may appear in a slideshow. Anyone with the guest or guestbook link can view it. Do not submit
          information you do not want shown publicly for that event.
        </p>

        <h2>5. Sharing and processors</h2>
        <p>
          We use Google Firebase (including Hosting, Firestore, Storage, and Cloud Functions) to
          host and run the Service. Video uploads are stored temporarily in Firebase Storage and
          processed by Cloud Functions on Google’s infrastructure. We also load fonts from Google
          Fonts. These providers process data on our behalf to deliver the Service. We do not sell
          your personal information.
        </p>

        <h2>6. Retention and deletion</h2>
        <p>
          Event and Guest Content remain available while the guestbook exists, subject to host
          moderation and Service availability. When a host hides Guest Content, we mark it hidden and,
          when possible, delete associated photos, processed videos, and raw upload files from
          storage. After a video is processed, we delete the original raw upload when possible and
          keep the display copy needed to show the message in the guestbook. Browser keepsafe and
          slideshow settings remain until you clear them. We may retain limited technical logs for
          security and operations for a reasonable period.
        </p>

        <h2>7. Security</h2>
        <p>
          We use reasonable technical measures appropriate to a guestbook service, including hashed
          host tokens and access rules on our data stores. No method of transmission or storage is
          completely secure. Protect your host link; anyone who has it can moderate that guestbook.
        </p>

        <h2>8. Children’s privacy</h2>
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect personal
          information from children under 13. If you believe a child has provided information, stop
          using the guestbook and remove Guest Content via the host link where possible.
        </p>

        <h2>9. International processing</h2>
        <p>
          The Service is hosted on infrastructure that may process data in the United States or other
          countries where our providers operate. By using The Willow Book, you understand that information
          may be transferred to and processed in those locations.
        </p>

        <h2>10. Your choices</h2>
        <p>
          Guests choose what name, text, photos, and videos to submit. Hosts can hide Guest Content
          with the host link or from their signed-in account. You can clear local keepsafe and slideshow
          data in your browser. Hosts can sign out and request account deletion through ordinary Service
          features as we make them available.
        </p>

        <h2>11. Changes</h2>
        <p>
          We may update this Privacy Policy by posting a revised version with a new effective date.
          Continued use of the Service after changes means you accept the updated policy.
        </p>

        <h2>12. Related terms</h2>
        <p>
          Use of the Service is also governed by our{" "}
          <Link href="/terms/">Terms and Conditions</Link>.
        </p>

        <h2>13. Contact</h2>
        <p>
          Privacy questions may be directed to The Willow Book through the site at toastboard.web.app.
        </p>
      </section>
    </article>
  );
}
