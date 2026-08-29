import { useCallback, useRef, useState } from "react";

type PhotoGalleryProps = {
  urls: string[];
};

export function PhotoGallery({ urls }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    setIndex(Math.min(Math.max(next, 0), urls.length - 1));
  }, [urls.length]);

  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return <img className="toast-photo" src={urls[0]} alt="" />;
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
            <img className="toast-photo" src={url} alt="" />
          </div>
        ))}
      </div>
      <span className="photo-gallery-counter" aria-live="polite">
        {index + 1} / {urls.length}
      </span>
    </div>
  );
}
