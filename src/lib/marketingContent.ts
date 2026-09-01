import demoCatalog from "../content/demoCatalog.json";
import type { EventType } from "./eventTypes.ts";

export const MARKETED_EVENT_TYPES = [
  "wedding",
  "birthday",
  "graduation",
  "religious-milestone",
] as const;

export type MarketedEventType = (typeof MARKETED_EVENT_TYPES)[number];

export type MarketingStep = {
  title: string;
  description: string;
};

export type MarketingImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectClass?: string;
};

export type MarketingVisualFigure = {
  image: MarketingImage;
  caption: string;
  layout: "full" | "half" | "grid-pair";
};

export type MarketingVisualStory = {
  kicker: string;
  headline: string;
  figures: MarketingVisualFigure[];
};

export type MarketingHighlight = {
  title: string;
  description: string;
};

export type MarketingContent = {
  eventType: MarketedEventType;
  path: string;
  themeColor: string;
  hubTitle: string;
  hubDescription: string;
  kicker: string;
  headline: string;
  lede: string;
  steps: [MarketingStep, MarketingStep, MarketingStep];
  createCtaLabel: string;
  demoCtaLabel: string;
  demoSlug: string;
  visualStory?: MarketingVisualStory;
  highlights?: MarketingHighlight[];
};

function demoSlugFor(eventType: MarketedEventType): string {
  const entry = demoCatalog.demos.find((demo) => demo.eventType === eventType);
  if (!entry) {
    throw new Error(`demoCatalog.json is missing a demo for event type "${eventType}"`);
  }
  return entry.slug;
}

function demoThemeFor(eventType: MarketedEventType): string {
  const entry = demoCatalog.demos.find((demo) => demo.eventType === eventType);
  if (!entry) {
    throw new Error(`demoCatalog.json is missing a demo for event type "${eventType}"`);
  }
  return entry.themeColor;
}

const WEDDING_MARKETING: MarketingContent = {
  eventType: "wedding",
  path: "/weddings",
  themeColor: demoThemeFor("wedding"),
  hubTitle: "Weddings",
  hubDescription:
    "A live guestbook for the reception — guests leave toasts, photos, or one short video without signing in.",
  kicker: "Zero sign-up. Zero login. Zero email.",
  headline: "A wedding guestbook that doesn’t ask for an account.",
  lede: "Guests scan a QR code, leave a toast, photos, or one short video, and it appears on a live wall. The host link is the login — no passwords, for anyone.",
  steps: [
    {
      title: "Create once",
      description:
        "Enter the couple’s names. Wishing Wall gives you a guest URL, a host link, and a QR code.",
    },
    {
      title: "Share the QR",
      description:
        "Guests never sign in. Optional name, a note, photos or one short video from their camera. That’s the whole form.",
    },
    {
      title: "Watch the wall",
      description:
        "The reception screen updates live. Hide a toast later with the host link — possession is permission.",
    },
  ],
  createCtaLabel: "Create a wedding guestbook",
  demoCtaLabel: "See Maya & James live wall",
  demoSlug: demoSlugFor("wedding"),
  visualStory: {
    kicker: "In the room",
    headline: "The guestbook that sits with the party.",
    figures: [
      {
        layout: "full",
        image: {
          src: "/branding/family-table-wall.jpg",
          alt: "The bride, groom, and family sitting at the head table, with a TV to the left showing the Wishing Wall live guestbook, a dance floor in front, and guests at tables beyond",
          width: 1920,
          height: 1080,
        },
        caption: "The family table watches the wall fill.",
      },
      {
        layout: "grid-pair",
        image: {
          src: "/branding/table-sign.jpg",
          alt: "Printed cream Wishing Wall table sign with a rose border, Maya and James, and a large QR code standing on a guest table among candles and flowers",
          width: 900,
          height: 1200,
          aspectClass: "aspect-[3/4]",
        },
        caption: "Print one card per table.",
      },
      {
        layout: "grid-pair",
        image: {
          src: "/branding/guest-scan.jpg",
          alt: "A wedding guest holds a phone over a Wishing Wall table sign, scanning the QR code while the reception continues behind them",
          width: 1200,
          height: 900,
          aspectClass: "aspect-[4/3] min-[700px]:aspect-[3/4]",
        },
        caption: "Guests scan. No app.",
      },
      {
        layout: "full",
        image: {
          src: "/branding/reception-selfie.jpg",
          alt: "Guests take a selfie at a wedding reception with a Wishing Wall table sign and QR code visible on a nearby table",
          width: 1920,
          height: 1080,
        },
        caption: "The party keeps going.",
      },
    ],
  },
};

const BIRTHDAY_MARKETING: MarketingContent = {
  eventType: "birthday",
  path: "/birthdays",
  themeColor: demoThemeFor("birthday"),
  hubTitle: "Birthdays",
  hubDescription:
    "Collect wishes, party photos, or one short video on a live wall — no app, no login, just a QR code on the table.",
  kicker: "Zero sign-up. Zero login. Zero email.",
  headline: "A birthday guestbook that doesn’t ask for an account.",
  lede: "Party guests scan a QR code, leave a wish, photos, or one short video, and it appears on a live wall. You keep the host link — that’s the only key you need.",
  steps: [
    {
      title: "Create once",
      description:
        "Add the celebrant’s name and party details. Wishing Wall gives you a guest URL, a host link, and a QR code.",
    },
    {
      title: "Share the QR",
      description:
        "Guests never sign in. Optional name, a wish, photos or one short video from their camera. That’s the whole form.",
    },
    {
      title: "Watch the wall",
      description:
        "The party screen updates live. Hide a wish later with the host link — possession is permission.",
    },
  ],
  createCtaLabel: "Create a birthday guestbook",
  demoCtaLabel: "See Lena’s live wall",
  demoSlug: demoSlugFor("birthday"),
  highlights: [
    {
      title: "Built for the room",
      description:
        "Put the QR on a table sign or project the wall on a TV. Guests contribute from their phones without downloading anything.",
    },
    {
      title: "Wishes that last",
      description:
        "Every note lands on a scrollable wall you can revisit after the candles are out.",
    },
    {
      title: "You stay in control",
      description:
        "The host link lets you hide anything that shouldn’t stay up. Guests never see moderation tools.",
    },
  ],
};

const GRADUATION_MARKETING: MarketingContent = {
  eventType: "graduation",
  path: "/graduations",
  themeColor: demoThemeFor("graduation"),
  hubTitle: "Graduations",
  hubDescription:
    "Gather congratulations, advice, and memories from family and friends on a live wall.",
  kicker: "Zero sign-up. Zero login. Zero email.",
  headline: "A graduation guestbook that doesn’t ask for an account.",
  lede: "Guests scan a QR code, leave a wish, photos, or one short video, and it appears on a live wall. The host link is the login — no passwords, for anyone.",
  steps: [
    {
      title: "Create once",
      description:
        "Add the graduate’s name and celebration date. Wishing Wall gives you a guest URL, a host link, and a QR code.",
    },
    {
      title: "Share the QR",
      description:
        "Family and friends never sign in. Optional name, a wish, photos or one short video from the day. That’s the whole form.",
    },
    {
      title: "Watch the wall",
      description:
        "The celebration screen updates live. Hide a wish later with the host link — possession is permission.",
    },
  ],
  createCtaLabel: "Create a graduation guestbook",
  demoCtaLabel: "See Jordan’s live wall",
  demoSlug: demoSlugFor("graduation"),
  highlights: [
    {
      title: "From ceremony to party",
      description:
        "One QR works at the reception, the backyard barbecue, or the open house — wherever people gather to celebrate.",
    },
    {
      title: "Advice worth keeping",
      description:
        "Professors, coaches, grandparents, and classmates can all leave words the graduate can read again later.",
    },
    {
      title: "Simple for every guest",
      description:
        "No accounts, no app store, no “check your email.” Scan, write, done.",
    },
  ],
};

const RELIGIOUS_MILESTONE_MARKETING: MarketingContent = {
  eventType: "religious-milestone",
  path: "/religious-milestones",
  themeColor: demoThemeFor("religious-milestone"),
  hubTitle: "Religious milestones",
  hubDescription:
    "Bar mitzvah, bat mitzvah, confirmation, and similar celebrations — guests leave blessings on a live wall.",
  kicker: "Zero sign-up. Zero login. Zero email.",
  headline: "A milestone guestbook that doesn’t ask for an account.",
  lede: "For bar mitzvah, bat mitzvah, confirmation, and similar milestones — guests scan a QR code, leave a blessing, note, photos, or one short video, and it appears on a live wall. The host link is the login — no passwords, for anyone.",
  steps: [
    {
      title: "Create once",
      description:
        "Add the honoree’s name and celebration date. Wishing Wall gives you a guest URL, a host link, and a QR code.",
    },
    {
      title: "Share the QR",
      description:
        "Guests never sign in. Optional name, a note, photos or one short video from the day. That’s the whole form.",
    },
    {
      title: "Watch the wall",
      description:
        "The celebration screen updates live. Hide a note later with the host link — possession is permission.",
    },
  ],
  createCtaLabel: "Create a milestone guestbook",
  demoCtaLabel: "See Noah’s live wall",
  demoSlug: demoSlugFor("religious-milestone"),
  highlights: [
    {
      title: "Honest and inclusive",
      description:
        "Works for bar mitzvah, bat mitzvah, confirmation, and other faith milestones — you choose the language that fits your tradition.",
    },
    {
      title: "Blessings from every table",
      description:
        "Family, friends, and community members contribute from their seats without leaving the celebration.",
    },
    {
      title: "A keepsake after the day",
      description:
        "Every note stays on the wall for the family to revisit long after the celebration ends.",
    },
  ],
};

export const MARKETING_CONTENT: Record<MarketedEventType, MarketingContent> = {
  wedding: WEDDING_MARKETING,
  birthday: BIRTHDAY_MARKETING,
  graduation: GRADUATION_MARKETING,
  "religious-milestone": RELIGIOUS_MILESTONE_MARKETING,
};

export const MARKETING_BY_PATH: Record<string, MarketingContent> = Object.fromEntries(
  MARKETED_EVENT_TYPES.map((eventType) => [MARKETING_CONTENT[eventType].path, MARKETING_CONTENT[eventType]]),
);

export const HUB_USE_CASES = MARKETED_EVENT_TYPES.map((eventType) => {
  const content = MARKETING_CONTENT[eventType];
  return {
    eventType,
    path: content.path,
    title: content.hubTitle,
    description: content.hubDescription,
  };
});

export function isMarketedEventType(value: EventType): value is MarketedEventType {
  return (MARKETED_EVENT_TYPES as readonly EventType[]).includes(value);
}
