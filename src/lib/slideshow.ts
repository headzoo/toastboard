import { getImageDimensionsEntry, type ImageDimensions } from "./imageDimensions.ts";
import { isSignThemeId, type SignThemeId } from "./signThemes.ts";
import type { MessageRecord } from "./types.ts";

export const SLIDESHOW_DURATIONS = [5000, 8000, 12000, 20000] as const;

export type SlideshowDuration = (typeof SLIDESHOW_DURATIONS)[number];
export type MotionStyle = "random" | "fade" | "zoom" | "lift" | "swing";

export const MOTION_STYLES = ["random", "fade", "zoom", "lift", "swing"] as const;

export type SlideshowPreferences = Readonly<{
  duration: SlideshowDuration;
  motion: MotionStyle;
  signTheme?: SignThemeId;
}>;

export type SlideImageDimensions = ImageDimensions;

export type ContentSlideSlot = Readonly<{
  kind: "content";
  cycleKey: string;
  messageId: string;
  photoIndex: number | null;
  text: string | null;
  guestName: string | null;
  photoUrl: string | null;
  dimensions?: SlideImageDimensions;
}>;

export type EmptySlideSlot = Readonly<{
  kind: "empty";
  cycleKey: string;
}>;

export type SlideSlot = ContentSlideSlot | EmptySlideSlot;

export type DeckEntry = Readonly<{
  id: string;
  guestName: string | null;
  text: string | null;
  photoUrls: readonly string[];
}>;

/**
 * Checks whether an in-flight candidate still represents the same live slide.
 * An absent entry is no longer eligible (for example, after moderation).
 */
export function isCurrentDeckCandidate(
  liveEntry: DeckEntry | undefined,
  candidate: DeckEntry,
  photoIndex: number | null,
  photoUrl: string | undefined,
): liveEntry is DeckEntry {
  if (!liveEntry || liveEntry.id !== candidate.id) return false;
  return photoIndex === null || liveEntry.photoUrls[photoIndex] === photoUrl;
}

export const DEFAULT_SLIDESHOW_PREFERENCES: SlideshowPreferences = {
  duration: 8000,
  motion: "random",
};

function preferenceKey(slug: string) {
  return `toastboard:slideshow:v1:${slug}`;
}

function isDuration(value: unknown): value is SlideshowDuration {
  return typeof value === "number" && SLIDESHOW_DURATIONS.includes(value as SlideshowDuration);
}

function isMotionStyle(value: unknown): value is MotionStyle {
  return typeof value === "string" && MOTION_STYLES.includes(value as MotionStyle);
}

export function validateSlideshowPreferences(value: unknown): SlideshowPreferences {
  if (!value || typeof value !== "object") return DEFAULT_SLIDESHOW_PREFERENCES;
  const candidate = value as Partial<SlideshowPreferences>;
  if (!isDuration(candidate.duration) || !isMotionStyle(candidate.motion)) {
    return DEFAULT_SLIDESHOW_PREFERENCES;
  }
  const preferences: SlideshowPreferences = {
    duration: candidate.duration,
    motion: candidate.motion,
  };
  if (isSignThemeId(candidate.signTheme)) {
    return { ...preferences, signTheme: candidate.signTheme };
  }
  return preferences;
}

export function loadSlideshowPreferences(slug: string): SlideshowPreferences {
  try {
    const saved = window.localStorage.getItem(preferenceKey(slug));
    return saved ? validateSlideshowPreferences(JSON.parse(saved)) : DEFAULT_SLIDESHOW_PREFERENCES;
  } catch {
    return DEFAULT_SLIDESHOW_PREFERENCES;
  }
}

export function saveSlideshowPreferences(slug: string, preferences: SlideshowPreferences) {
  try {
    window.localStorage.setItem(preferenceKey(slug), JSON.stringify(validateSlideshowPreferences(preferences)));
  } catch {
    // Display preferences are optional; a blocked or full storage must not affect playback.
  }
}

export function toDeckEntry(message: MessageRecord): DeckEntry {
  return {
    id: message.id,
    guestName: message.guestName,
    text: message.text,
    photoUrls: [...message.photoUrls],
  };
}

/** Fisher-Yates shuffle of entries, keeping a prior item away from the head when possible. */
export function shuffleEntries(entries: readonly DeckEntry[], avoidFirstId?: string): DeckEntry[] {
  const shuffled = [...entries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  if (avoidFirstId && shuffled.length > 1 && shuffled[0]?.id === avoidFirstId) {
    const alternative = shuffled.findIndex((entry) => entry.id !== avoidFirstId);
    if (alternative > 0) [shuffled[0], shuffled[alternative]] = [shuffled[alternative], shuffled[0]];
  }
  return shuffled;
}

export type ImageCacheEntry = Readonly<{
  status: "loading" | "loaded" | "failed";
  promise: Promise<SlideImageDimensions | null>;
  dimensions?: SlideImageDimensions;
}>;

/** Thin wrapper around the shared image-dimension cache (same URL keys as wall photos). */
export class SlideImageCache {
  preload(url: string): Promise<SlideImageDimensions | null> {
    return this.get(url).promise;
  }

  get(url: string): ImageCacheEntry {
    return getImageDimensionsEntry(url);
  }
}
