import { DEFAULT_THEME } from "./types.ts";

export function applyTheme(color?: string | null) {
  document.documentElement.style.setProperty("--accent", color || DEFAULT_THEME);
}

export function formatEventDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
