export type PageMetadata = {
  title: string;
  description: string;
};

export const DEFAULT_PAGE_METADATA: PageMetadata = {
  title: "Toastboard — event guestbook with no login",
  description:
    "A live guestbook for personal events with no sign-up, no login, and no email. Guests scan a QR code and leave a note, photos, or one short video.",
};

export const HUB_PAGE_METADATA: PageMetadata = {
  title: "Toastboard — event guestbook with no login",
  description:
    "Live guestbooks for weddings, birthdays, graduations, religious milestones, and more. Guests scan a QR code — no account needed.",
};

export const TERMS_PAGE_METADATA: PageMetadata = {
  title: "Terms and Conditions — Toastboard",
  description:
    "Terms governing use of Toastboard, a personal event guestbook service with no accounts or passwords.",
};

export const PRIVACY_PAGE_METADATA: PageMetadata = {
  title: "Privacy Policy — Toastboard",
  description:
    "How Toastboard collects and uses information for personal event guestbooks without accounts or email.",
};

export function setPageMetadata(metadata: PageMetadata) {
  document.title = metadata.title;

  const existing = document.querySelectorAll('meta[name="description"]');
  let meta = existing[0] ?? null;
  for (let index = 1; index < existing.length; index += 1) {
    existing[index].remove();
  }

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", metadata.description);
}
