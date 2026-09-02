export type PricingPlanAccent = "gold" | "olive" | "oxblood";

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  accent: PricingPlanAccent;
  iconSrc: string;
  iconAlt: string;
  features: readonly string[];
  cta: string;
  ctaHref: string;
};

export const PRICING_PAGE = {
  kicker: "Pricing",
  headline: "Pay once. Keep the words.",
  lede: "Choose how long the guestbook is kept, and how much room there is for photos and video. Start with a 14-day trial — no card needed.",
  footnote:
    "Every plan begins with a 14-day free trial — no credit card required. If you’re not satisfied, we’ll return your money. No questions asked.",
  helpLinkLabel: "Questions? See the Help Center →",
  helpHref: "/help/",
} as const;

const SHARED_FEATURES = [
  "No guest login",
  "QR code and shareable link",
  "Guest notes, kept safely",
] as const;

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "keepsake",
    name: "Keepsake",
    price: "$29",
    priceNote: "paid once",
    accent: "gold",
    iconSrc: "/images/anniversary_sprig_icon_transparent.png",
    iconAlt: "",
    features: [...SHARED_FEATURES, "250MB for photos", "Kept for 1 year"],
    cta: "Start a 14-day trial",
    ctaHref: "/create/",
  },
  {
    id: "heirloom",
    name: "Heirloom",
    price: "$79",
    priceNote: "paid once",
    accent: "olive",
    iconSrc: "/images/feature_seal_icon_transparent.png",
    iconAlt: "",
    features: [...SHARED_FEATURES, "500MB for photos and videos", "Kept for 5 years"],
    cta: "Start a 14-day trial",
    ctaHref: "/create/",
  },
  {
    id: "legacy",
    name: "Legacy",
    price: "$149",
    priceNote: "paid once",
    accent: "oxblood",
    iconSrc: "/images/feature_shield_icon_transparent.png",
    iconAlt: "",
    features: [...SHARED_FEATURES, "2GB for photos and videos", "Kept for 10 years"],
    cta: "Start a 14-day trial",
    ctaHref: "/create/",
  },
] as const;
