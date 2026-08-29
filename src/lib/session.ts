import type { HostKeepsafe } from "./types.ts";

const KEY = "toastboard:host-keepsafe";

export function saveKeepsafe(value: HostKeepsafe) {
  sessionStorage.setItem(KEY, JSON.stringify(value));
}

export function loadKeepsafe(): HostKeepsafe | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as HostKeepsafe;
    if (!parsed.slug || !parsed.hostToken || !parsed.coupleNames) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearKeepsafe() {
  sessionStorage.removeItem(KEY);
}
