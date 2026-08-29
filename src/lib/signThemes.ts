export const DEFAULT_SIGN_THEME = "classic" as const;

export const SIGN_THEMES = [
  {
    id: "classic",
    label: "Classic",
    description: "Soft frame and flourishes",
    paper: "#F7F0E6",
    cream: "#FFFCF7",
    ink: "#2A2118",
    inkSoft: "#5C5146",
    shadow: "#2A2118",
    frameBorder: "#FFFFFF",
    frameHighlight: "#FFFFFF",
  },
  {
    id: "botanical",
    label: "Botanical",
    description: "Vines and leaf accents",
    paper: "#F4F1E8",
    cream: "#FFFEF8",
    ink: "#2A2E24",
    inkSoft: "#5A6352",
    shadow: "#2A2E24",
    frameBorder: "#FFFFFF",
    frameHighlight: "#FFFFFF",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Clean lines, open space",
    paper: "#FAF8F4",
    cream: "#FFFFFF",
    ink: "#1C1A17",
    inkSoft: "#6B6560",
    shadow: "#1C1A17",
    frameBorder: "#FFFFFF",
    frameHighlight: "#FFFFFF",
  },
  {
    id: "art-deco",
    label: "Art Deco",
    description: "Stepped corners and sunburst",
    paper: "#F3EBDD",
    cream: "#FFF9F0",
    ink: "#1F1A14",
    inkSoft: "#5C5246",
    shadow: "#1F1A14",
    frameBorder: "#FFFFFF",
    frameHighlight: "#FFFFFF",
  },
  {
    id: "coastal",
    label: "Coastal",
    description: "Airy oval frame",
    paper: "#F5F7F8",
    cream: "#FFFFFF",
    ink: "#243038",
    inkSoft: "#5A6B74",
    shadow: "#243038",
    frameBorder: "#FFFFFF",
    frameHighlight: "#FFFFFF",
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Dark paper, light type",
    paper: "#1A1714",
    cream: "#2A241E",
    ink: "#F5EDE2",
    inkSoft: "#B8A99A",
    shadow: "#000000",
    frameBorder: "#3D342C",
    frameHighlight: "#B8A99A",
  },
] as const;

export type SignThemeId = (typeof SIGN_THEMES)[number]["id"];

export type SignTheme = (typeof SIGN_THEMES)[number];

export function getSignTheme(id?: string | null): SignTheme {
  const found = SIGN_THEMES.find((theme) => theme.id === id);
  return found ?? SIGN_THEMES[0];
}

export function isSignThemeId(value: unknown): value is SignThemeId {
  return typeof value === "string" && SIGN_THEMES.some((theme) => theme.id === value);
}
