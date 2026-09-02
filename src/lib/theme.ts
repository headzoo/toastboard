import { DEFAULT_THEME } from "./types";

export function applyTheme(color?: string | null) {
  document.documentElement.style.setProperty("--accent", color || DEFAULT_THEME);
}

export function formatEventDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const value = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  if (Number.isNaN(value.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
}
