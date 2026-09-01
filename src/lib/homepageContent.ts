export const HOME_HERO = {
  kicker: "Zero sign-up for your guests",
  headline: "A guestbook your guests never log into.",
  lede: "Guests scan a QR code to leave a note, photo, or short video. You create your guestbook once, and it’s yours to keep.",
  primaryCta: "14-day Free Trial",
  trialNote: "Start a 14-day free trial — no credit card required",
} as const;

export type HomeHeroAccent = "gold" | "olive" | "oxblood";

export type HomeHeroGuestbookEntry = {
  quote: string;
  attribution: string;
  accent: HomeHeroAccent;
  photo?: {
    src: string;
    alt: string;
  };
};

export const HOME_HERO_GUESTBOOK = {
  heading: "Maya & James — The Willow Book",
  cycles: [
    [
      {
        quote: "Wishing you a lifetime of laughter and love.",
        attribution: "Aunt June",
        accent: "gold",
      },
      {
        quote: "So happy for you two. Cheers!",
        attribution: "Sam",
        accent: "olive",
      },
      {
        quote: "What a beautiful day — so much love all around us.",
        attribution: "Priya",
        accent: "oxblood",
        photo: {
          src: "/branding/guestbook-lena-neighbors.jpg",
          alt: "Two guests arriving with champagne, smiling in a doorway",
        },
      },
    ],
    [
      {
        quote: "Look after each other. That’s the whole job.",
        attribution: "Grandad",
        accent: "gold",
      },
      {
        quote: "Still can’t believe you two met over the last samosa.",
        attribution: "Priya",
        accent: "olive",
        photo: {
          src: "/branding/guestbook-priya-1.jpg",
          alt: "A wedding guest smiling at an evening reception",
        },
      },
      {
        quote: "The guestbook is already prettier than our Slack channel.",
        attribution: "Sam",
        accent: "oxblood",
        photo: {
          src: "/branding/guestbook-sam.jpg",
          alt: "A guest raising a glass at the reception",
        },
      },
    ],
  ] satisfies readonly HomeHeroGuestbookEntry[][],
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
    description: "Guests never create an account. They scan, write, add pictures and video and they're done.",
    iconSrc: "/mock/feature_lock_icon_transparent.png",
    iconAlt: "",
  },
  {
    title: "Photos and videos",
    description: "Collect notes, photos, and one short video on a live guestbook. Watch for just about anywhere.",
    iconSrc: "/mock/feature_media_icon_transparent.png",
    iconAlt: "",
  },
  {
    title: "Yours to keep",
    description: "Create your guestbook once. Keep every word by revisiting your guestbook over and over.",
    iconSrc: "/mock/feature_shield_icon_transparent.png",
    iconAlt: "",
  },
  {
    title: "Money back guarantee",
    description: "If you're not satisfied for any reason, we'll return your money. No questions asked.",
    iconSrc: "/mock/feature_seal_icon_transparent.png",
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

export const HOME_CHOOSE_OCCASION = {
  heading: "Choose your occasion",
  lede: "A guestbook shaped for the day you’re marking.",
} as const;

export const HOME_OCCASIONS: HomeOccasion[] = [
  {
    title: "Weddings",
    description: "Collect messages from your ceremony, reception, or bridal shower.",
    cta: "Create a wedding guestbook →",
    path: "/weddings",
    iconSrc: "/mock/wedding_rings_icon_transparent.png",
  },
  {
    title: "Birthdays",
    description: "Gather birthday wishes, photos, and videos in one beautiful place.",
    cta: "Create a birthday guestbook →",
    path: "/birthdays",
    iconSrc: "/mock/birthday_cake_icon_transparent.png",
  },
  {
    title: "Graduations",
    description: "Celebrate the milestone with advice, memories, and words of encouragement.",
    cta: "Create a graduation guestbook →",
    path: "/graduations",
    iconSrc: "/mock/graduation_cap_icon_transparent.png",
  },
  {
    title: "Religious milestones",
    description: "Bar mitzvah, bat mitzvah, confirmation, and similar celebrations.",
    cta: "Create a milestone guestbook →",
    path: "/religious-milestones",
    iconSrc: "/mock/anniversary_sprig_icon_transparent.png",
  },
];

export const HOME_OCCASION_YOU_PICK: HomeOccasion = {
  title: "You pick",
  description: "Reunion, farewell, baby shower, or anything else — name it yourself.",
  cta: "Create your guestbook →",
  path: "/create?type=other",
  iconSrc: "/mock/you_pick_question_marks_icon_transparent.png",
};

export type HomeStep = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
};

export const HOME_HOW_IT_WORKS = {
  heading: "How it works",
  lede: "Set it up once. Guests do the rest.",
} as const;

export const HOME_STEPS: HomeStep[] = [
  {
    title: "Create your guestbook",
    description:
      "Name your event, choose a few settings, and we’ll generate your QR code and link — plus images and PDFs you can print.",
    imageSrc: "/branding/how-it-works-create.jpg",
    imageAlt:
      "A couple fills in a cream Willow Book with names and date, surrounded by stationery and botanical sprigs",
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
      "Watch messages appear in real time in your private guestbook — or as a slideshow on your phone, tablet, or even a TV.",
    imageSrc: "/branding/how-it-works-collect.jpg",
    imageAlt:
      "A simplified Willow Book guestbook showing stacked guest message cards with gold, olive, and oxblood accent bars",
    width: 1536,
    height: 1024,
  },
];

export type HomeBigDaySpan = "full" | "half";

export type HomeBigDayScene = {
  kind: "scene";
  span: HomeBigDaySpan;
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectClass?: string;
};

export type HomeBigDayGuestbook = {
  kind: "guestbook";
  span: HomeBigDaySpan;
  quote: string;
  attribution: string;
  photo?: {
    src: string;
    alt: string;
  };
};

export type HomeBigDayItem = HomeBigDayScene | HomeBigDayGuestbook;

/** Mixed scene photos and guestbook cards for the homepage “On the big day” gallery. */
export const HOME_ON_THE_BIG_DAY = {
  heading: "On the big day",
  lede: "Guests write. The wall fills.",
  items: [
    {
      kind: "guestbook",
      span: "full",
      quote: "Still can’t believe you two met over the last samosa. Please never stop telling that story.",
      attribution: "Priya",
      photo: {
        src: "/branding/guestbook-priya-1.jpg",
        alt: "A wedding guest smiling at an evening reception",
      },
    },
    {
      kind: "scene",
      span: "full",
      src: "/branding/family-table-wall.jpg",
      alt: "The bride, groom, and family sitting at the head table, with a TV to the left showing the Willow Book live guestbook, a dance floor in front, and guests at tables beyond",
      width: 1920,
      height: 1080,
    },
    {
      kind: "scene",
      span: "half",
      src: "/branding/family-table-guestbook-tv.jpg",
      alt: "A closer view of the family table, with a TV beside it showing the live Willow Book guestbook wall of guest photos and notes",
      width: 1024,
      height: 1536,
      aspectClass: "aspect-[3/4]",
    },
    {
      kind: "scene",
      span: "half",
      src: "/branding/table-sign.jpg",
      alt: "Printed cream Willow Book table sign with a rose border, Maya and James, and a large QR code standing on a guest table among candles and flowers",
      width: 900,
      height: 1200,
      aspectClass: "aspect-[3/4]",
    },
    {
      kind: "guestbook",
      span: "half",
      quote: "Look after each other. That’s the whole job.",
      attribution: "Grandad",
    },
    {
      kind: "scene",
      span: "half",
      src: "/branding/guest-scan.jpg",
      alt: "A wedding guest holds a phone over a Willow Book table sign, scanning the QR code while the reception continues behind them",
      width: 1200,
      height: 900,
      aspectClass: "aspect-[4/3] min-[700px]:aspect-[3/4]",
    },
    {
      kind: "guestbook",
      span: "half",
      quote: "The guestbook is already prettier than our Slack channel. Congratulations, you two.",
      attribution: "Sam from work",
      photo: {
        src: "/branding/guestbook-sam.jpg",
        alt: "A guest raising a glass at the reception",
      },
    },
    {
      kind: "guestbook",
      span: "half",
      quote: "Left a toast without making an account, which feels like the most 2026 thing we could have done for you.",
      attribution: "A guest who forgot their name tag",
    },
    {
      kind: "guestbook",
      span: "half",
      quote: "I was asked to be profound. Instead: don’t forget to eat cake. Also I love you both.",
      attribution: "Best man, theoretically",
      photo: {
        src: "/branding/guestbook-best-man-3.jpg",
        alt: "The best man smiling at the reception",
      },
    },
    {
      kind: "scene",
      span: "full",
      src: "/branding/reception-selfie.jpg",
      alt: "Guests take a selfie at a wedding reception with a Willow Book table sign and QR code visible on a nearby table",
      width: 1920,
      height: 1080,
    },
  ] satisfies readonly HomeBigDayItem[],
} as const;

export type HomeComeBackMoment = {
  caption: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
  aspectClass?: string;
  layout: "full" | "half";
};

export const HOME_GETTING_STARTED = {
  heading: "Getting started",
} as const;

export const HOME_COME_BACK_AGAIN = {
  heading: "Come back again and again",
  lede: "The day ends. The guestbook doesn’t.",
  moments: [
    {
      layout: "full",
      caption: "The next morning",
      imageSrc: "/branding/come-back-next-morning.jpg",
      imageAlt:
        "Maya and James in casual clothes at a kitchen table the morning after their wedding, scrolling through their Willow Book guestbook on a tablet beside a mason jar of leftover flowers",
      width: 1920,
      height: 1080,
    },
    {
      layout: "half",
      caption: "A year later",
      imageSrc: "/branding/come-back-year-later.jpg",
      imageAlt:
        "Maya and James at home on their first anniversary, looking at the same Willow Book guestbook on a tablet beside a small cake and a few flowers",
      width: 1024,
      height: 1536,
      aspectClass: "aspect-[3/4]",
    },
    {
      layout: "half",
      caption: "Years later",
      imageSrc: "/branding/come-back-years-later.jpg",
      imageAlt:
        "Maya and James on a sofa with a small child, all three looking at the Willow Book guestbook on a tablet together",
      width: 1024,
      height: 1536,
      aspectClass: "aspect-[3/4]",
    },
  ] satisfies readonly HomeComeBackMoment[],
} as const;
