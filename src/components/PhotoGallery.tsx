import { useCallback, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { useImageDimensions } from "../hooks/useImageDimensions";
import { PhotoLightbox } from "./PhotoLightbox";

const CLICK_MOVE_THRESHOLD = 10;

type PhotoGalleryProps = {
  urls: string[];
};

export function PhotoGallery({ urls }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const singleUrl = urls.length === 1 ? urls[0] : undefined;
  const dimensions = useImageDimensions(singleUrl);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    setIndex(Math.min(Math.max(next, 0), urls.length - 1));
  }, [urls.length]);

  const onPointerDown = (event: PointerEvent) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const openIfClick = (photoIndex: number, event: PointerEvent | MouseEvent) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (start) {
      const dx = Math.abs(event.clientX - start.x);
      const dy = Math.abs(event.clientY - start.y);
      if (dx > CLICK_MOVE_THRESHOLD || dy > CLICK_MOVE_THRESHOLD) return;
    }
    setLightboxIndex(photoIndex);
  };

  if (urls.length === 0) return null;

  const lightbox = lightboxIndex !== null ? (
    <PhotoLightbox
      urls={urls}
      index={lightboxIndex}
      onIndexChange={setLightboxIndex}
      onClose={() => setLightboxIndex(null)}
    />
  ) : null;

  if (urls.length === 1) {
    const url = urls[0];
    return (
      <>
        <div
          className="toast-photo-frame"
          style={dimensions
            ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` }
            : undefined}
        >
          {dimensions ? (
            <button
              className="toast-photo-button"
              type="button"
              onPointerDown={onPointerDown}
              onClick={(event) => openIfClick(0, event)}
              aria-label="View photo"
            >
              <img
                className="toast-photo"
                src={url}
                alt=""
                width={dimensions.width}
                height={dimensions.height}
              />
            </button>
          ) : null}
        </div>
        {lightbox}
      </>
    );
  }

  return (
    <div className="photo-gallery">
      <div
        className="photo-gallery-track"
        ref={trackRef}
        onScroll={onScroll}
        role="region"
        aria-label="Photo gallery"
      >
        {urls.map((url, i) => (
          <div className="photo-gallery-slide" key={`${url}-${i}`}>
            <button
              className="toast-photo-button"
              type="button"
              onPointerDown={onPointerDown}
              onClick={(event) => openIfClick(i, event)}
              aria-label={`View photo ${i + 1} of ${urls.length}`}
            >
              <img className="toast-photo" src={url} alt="" />
            </button>
          </div>
        ))}
      </div>
      <span className="photo-gallery-counter" aria-live="polite">
        {index + 1} / {urls.length}
      </span>
      {lightbox}
    </div>
  );
}
