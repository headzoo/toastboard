export const HOME_HERO = {
  kicker: "Zero sign-up for your guests. That’s the whole point.",
  headline: "A guestbook your guests never have to log into.",
  lede: "Guests scan a QR code to leave a note, photo, or short video — no account, no app, no email, ever. You create your guestbook once, and it’s yours to keep.",
  primaryCta: "Create your guestbook",
  secondaryCta: "See how it works",
} as const;

export type HomeFeature = {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
};

export const HOME_FEATURES: HomeFeature[] = [
  {
    title: "No guest login",
    description: "Guests never create an account. They scan, write, and they’re done.",
    iconSrc: "/mock/feature_lock_icon_transparent.png",
    iconAlt: "",
  },
  {
    title: "Photos and one short video",
    description: "Collect notes, photos, and one short video on a live wall.",
    iconSrc: "/mock/feature_media_icon_transparent.png",
    iconAlt: "",
  },
  {
    title: "Yours to keep",
    description: "Create your guestbook once. Moderate it, revisit it, and keep every word.",
    iconSrc: "/mock/feature_shield_icon_transparent.png",
    iconAlt: "",
  },
];

export type HomeOccasion = {
  title: string;
  description: string;
  cta: string;
  path: string;
  iconSrc: string;
};

export const HOME_OCCASIONS: HomeOccasion[] = [
  {
    title: "Weddings",
    description: "Collect messages from your ceremony, reception, or bridal shower.",
    cta: "Create a wedding wall →",
    path: "/weddings",
    iconSrc: "/mock/wedding_rings_icon_transparent.png",
  },
  {
    title: "Birthdays",
    description: "Gather birthday wishes, photos, and videos in one beautiful place.",
    cta: "Create a birthday wall →",
    path: "/birthdays",
    iconSrc: "/mock/birthday_cake_icon_transparent.png",
  },
  {
    title: "Graduations",
    description: "Celebrate the milestone with advice, memories, and words of encouragement.",
    cta: "Create a graduation wall →",
    path: "/graduations",
    iconSrc: "/mock/graduation_cap_icon_transparent.png",
  },
  {
    title: "Religious milestones",
    description: "Bar mitzvah, bat mitzvah, confirmation, and similar celebrations.",
    cta: "Create a milestone wall →",
    path: "/religious-milestones",
    iconSrc: "/mock/anniversary_sprig_icon_transparent.png",
  },
];

export type HomeStep = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
};

export const HOME_STEPS: HomeStep[] = [
  {
    title: "Create your guestbook",
    description:
      "Name your event, choose a few settings, and we’ll generate your QR code and link — plus images and PDFs you can print.",
    imageSrc: "/branding/how-it-works-create.jpg",
    imageAlt:
      "A couple fills in a cream Wishing Wall form with names and date, surrounded by stationery and botanical sprigs",
    width: 1536,
    height: 1024,
  },
  {
    title: "Share your QR code or link",
    description:
      "Put QR codes on the tables, display them anywhere, or share your link with guests.",
    imageSrc: "/branding/how-it-works-share.jpg",
    imageAlt:
      "A guest holds a phone to scan a printed cream QR code card standing on a reception table",
    width: 1536,
    height: 1024,
  },
  {
    title: "Collect messages",
    description:
      "Watch messages appear in real time on your private wall — or as a slideshow on your phone, tablet, or even a TV.",
    imageSrc: "/branding/how-it-works-collect.jpg",
    imageAlt:
      "A simplified Wishing Wall showing stacked guest message cards with gold, olive, and oxblood accent bars",
    width: 1536,
    height: 1024,
  },
];

export type HomeStoryFigure = {
  layout: "full" | "grid-pair";
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectClass?: string;
  caption: string;
};

export type HomeStory = {
  figures: HomeStoryFigure[];
};

/** Photo story inside How it works — same shape as the live “In the room” gallery. */
export const HOME_IN_THE_ROOM: HomeStory = {
  figures: [
    {
      layout: "full",
      src: "/branding/family-table-wall.jpg",
      alt: "The bride, groom, and family sitting at the head table, with a TV to the left showing the Wishing Wall live guestbook, a dance floor in front, and guests at tables beyond",
      width: 1920,
      height: 1080,
      caption: "The family table watches the wall fill.",
    },
    {
      layout: "grid-pair",
      src: "/branding/table-sign.jpg",
      alt: "Printed cream Wishing Wall table sign with a rose border, Maya and James, and a large QR code standing on a guest table among candles and flowers",
      width: 900,
      height: 1200,
      aspectClass: "aspect-[3/4]",
      caption: "Print one card per table.",
    },
    {
      layout: "grid-pair",
      src: "/branding/guest-scan.jpg",
      alt: "A wedding guest holds a phone over a Wishing Wall table sign, scanning the QR code while the reception continues behind them",
      width: 1200,
      height: 900,
      aspectClass: "aspect-[4/3] min-[700px]:aspect-[3/4]",
      caption: "Guests scan. No app.",
    },
  ],
};
