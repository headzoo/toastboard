import type { RefObject } from 'react';

type VideoPlayerProps = {
  src: string;
  className?: string;
  label?: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
};

export function VideoPlayer({
  src,
  className,
  label = 'Guest video',
  videoRef,
}: VideoPlayerProps) {
  if (!src) return null;

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      controls
      playsInline
      preload='metadata'
      aria-label={label}
    />
  );
}
