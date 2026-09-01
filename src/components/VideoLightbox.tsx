import { useEffect, useRef } from "react";
import { VideoPlayer } from "./VideoPlayer.tsx";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  url: string;
  onClose: () => void;
};

export function VideoLightbox({ url, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const video = videoRef.current;

    return () => {
      video?.pause();
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
      if (!controls.length) return;
      const first = controls[0]!;
      const last = controls[controls.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  if (!url) return null;

  return (
    <div
      className="photo-lightbox-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="photo-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Guest video"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="photo-lightbox-toolbar">
          <span className="photo-lightbox-counter" aria-hidden="true">
            Video
          </span>
          <div className="photo-lightbox-actions">
            <button
              ref={closeRef}
              className="photo-lightbox-button photo-lightbox-close"
              type="button"
              onClick={onClose}
              aria-label="Close video"
            >
              ×
            </button>
          </div>
        </div>

        <div className="photo-lightbox-stage">
          <VideoPlayer
            src={url}
            className="video-lightbox-player"
            label="Guest video"
            videoRef={videoRef}
          />
        </div>
      </div>
    </div>
  );
}
