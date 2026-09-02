export type ImageDimensions = Readonly<{
  width: number;
  height: number;
}>;

type CacheEntry = Readonly<{
  status: 'loading' | 'loaded' | 'failed';
  promise: Promise<ImageDimensions | null>;
  dimensions?: ImageDimensions;
}>;

const entries = new Map<string, CacheEntry>();

/** Off-DOM preload that resolves natural width/height (or null on failure). Cached by URL. */
export function preloadImageDimensions(
  url: string,
): Promise<ImageDimensions | null> {
  return getImageDimensionsEntry(url).promise;
}

export function getImageDimensionsEntry(url: string): CacheEntry {
  const existing = entries.get(url);
  if (existing) return existing;

  let resolve!: (dimensions: ImageDimensions | null) => void;
  const promise = new Promise<ImageDimensions | null>((done) => {
    resolve = done;
  });
  const loading: CacheEntry = { status: 'loading', promise };
  entries.set(url, loading);

  if (typeof Image === 'undefined') {
    entries.set(url, { status: 'failed', promise });
    resolve(null);
    return entries.get(url)!;
  }

  const image = new Image();
  image.onload = () => {
    const dimensions = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    entries.set(url, { status: 'loaded', promise, dimensions });
    resolve(dimensions);
  };
  image.onerror = () => {
    entries.set(url, { status: 'failed', promise });
    resolve(null);
  };
  image.src = url;
  return loading;
}
