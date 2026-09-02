import type { EventType } from "./eventTypes";
import type { SignThemeId } from "./signThemes";

export const DEFAULT_THEME = "#C45C67";

export const THEME_SWATCHES = [
  { label: "Rose", value: "#C45C67" },
  { label: "Sage", value: "#6E7F63" },
  { label: "Champagne", value: "#B0894F" },
  { label: "Slate", value: "#6B7C8A" },
  { label: "Plum", value: "#7A4E6D" },
] as const;

export type EventRecord = {
  eventType: EventType;
  coupleNames: string;
  eventDate: Date | null;
  welcomeMessage: string | null;
  themeColor: string | null;
  signTheme: SignThemeId;
  ownerUid: string | null;
};

export type VideoStatus = "processing" | "ready" | "failed";

export type MessageRecord = {
  id: string;
  guestName: string | null;
  text: string | null;
  photoUrls: string[];
  videoUrl: string | null;
  videoStatus: VideoStatus | null;
  createdAt: Date | null;
};

export type HostKeepsafe = {
  slug: string;
  hostToken: string;
  eventType: EventType;
  coupleNames: string;
  themeColor: string;
  eventDate?: string;
  welcomeMessage?: string;
  signTheme?: SignThemeId;
};
