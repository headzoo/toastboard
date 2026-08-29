export const DEFAULT_THEME = "#C45C67";

export const THEME_SWATCHES = [
  { label: "Rose", value: "#C45C67" },
  { label: "Sage", value: "#6E7F63" },
  { label: "Champagne", value: "#B0894F" },
  { label: "Slate", value: "#6B7C8A" },
  { label: "Plum", value: "#7A4E6D" },
] as const;

export type EventRecord = {
  coupleNames: string;
  eventDate: Date | null;
  welcomeMessage: string | null;
  themeColor: string | null;
};

export type MessageRecord = {
  id: string;
  guestName: string | null;
  text: string | null;
  photoUrl: string | null;
  tableNumber: string | null;
  createdAt: Date | null;
};

export type HostKeepsafe = {
  slug: string;
  hostToken: string;
  coupleNames: string;
  themeColor: string;
};
