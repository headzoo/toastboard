import { useEffect, useState } from "react";
import {
  getImageDimensionsEntry,
  preloadImageDimensions,
  type ImageDimensions,
} from "../lib/imageDimensions";

function readCached(url: string | undefined): ImageDimensions | null {
  if (!url) return null;
  return getImageDimensionsEntry(url).dimensions ?? null;
}

/**
 * Resolves natural image dimensions via off-DOM preload.
 * Cache hits are read during render; async loads bump a version to re-read.
 */
export function useImageDimensions(url: string | undefined): ImageDimensions | null {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!url) return;
    if (getImageDimensionsEntry(url).dimensions) return;

    let cancelled = false;
    void preloadImageDimensions(url).then(() => {
      if (!cancelled) setVersion((current) => current + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  void version;
  return readCached(url);
}
