export type PageMetadata = {
  title: string;
  description: string;
};

export const DEFAULT_PAGE_METADATA: PageMetadata = {
  title: "Wishing Wall — a guestbook guests never log into",
  description:
    "A live guestbook for personal events. Guests scan a QR code and leave a note, photos, or short video — no account, no app, no email.",
};

export const HUB_PAGE_METADATA: PageMetadata = {
  title: "Wishing Wall — a guestbook guests never log into",
  description:
    "Live guestbooks for weddings, birthdays, graduations, religious milestones, and more. Guests scan a QR code — no account needed.",
};

export const TERMS_PAGE_METADATA: PageMetadata = {
  title: "Terms and Conditions — Wishing Wall",
  description:
    "Terms governing use of Wishing Wall, a personal event guestbook service with no accounts or passwords.",
};

export const PRIVACY_PAGE_METADATA: PageMetadata = {
  title: "Privacy Policy — Wishing Wall",
  description:
    "How Wishing Wall collects and uses information for personal event guestbooks without accounts or email.",
};

export const ABOUT_PAGE_METADATA: PageMetadata = {
  title: "About — Wishing Wall by Keepwell & Bell",
  description:
    "Our standards: simple to use, built to last, worth returning to. No accounts required to keep a kind word safe.",
};

export const HELP_PAGE_METADATA: PageMetadata = {
  title: "Help Center — Wishing Wall",
  description:
    "Short answers about guestbooks with no sign-up: QR codes, host links, photos, and short video.",
};

export const HOSTS_PAGE_METADATA: PageMetadata = {
  title: "For hosts — Wishing Wall",
  description:
    "The host link is the only key. How to create, save, and moderate a Wishing Wall guestbook.",
};

export const EXAMPLES_PAGE_METADATA: PageMetadata = {
  title: "Examples — Wishing Wall",
  description:
    "See wedding, birthday, graduation, and milestone guestbook demos — no account needed.",
};

export const PRICING_PAGE_METADATA: PageMetadata = {
  title: "Pricing — Wishing Wall",
  description:
    "Creating a Wishing Wall does not go through a checkout today. No payment card required for ordinary use.",
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
