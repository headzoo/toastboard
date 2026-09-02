import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadRemoteUrl } from '../lib/urls';

const SWIPE_THRESHOLD = 80;
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  urls: readonly string[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function downloadFilename(index: number) {
  return `toast-${index + 1}.jpg`;
}

export function PhotoLightbox({ urls, index, onIndexChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const reducedMotion = useReducedMotion();
  const count = urls.length;
  const safeIndex = wrapIndex(index, count);
  const currentUrl = urls[safeIndex] ?? '';
  const multi = count > 1;

  const goPrev = useCallback(() => {
    if (!multi) return;
    onIndexChange(wrapIndex(safeIndex - 1, count));
  }, [count, multi, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (!multi) return;
    onIndexChange(wrapIndex(safeIndex + 1, count));
  }, [count, multi, onIndexChange, safeIndex]);

  useEffect(() => {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = [
        ...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      ];
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
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [goNext, goPrev, onClose]);

  async function onDownload() {
    if (!currentUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadRemoteUrl(currentUrl, downloadFilename(safeIndex));
    } finally {
      setDownloading(false);
    }
  }

  if (count === 0 || !currentUrl) return null;

  return (
    <div
      className='photo-lightbox-backdrop'
      role='presentation'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className='photo-lightbox'
        role='dialog'
        aria-modal='true'
        aria-label={`Photo ${safeIndex + 1} of ${count}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className='photo-lightbox-toolbar'>
          <span className='photo-lightbox-counter' aria-live='polite'>
            {safeIndex + 1} / {count}
          </span>
          <div className='photo-lightbox-actions'>
            <button
              className='photo-lightbox-button'
              type='button'
              onClick={() => void onDownload()}
              disabled={downloading}
              aria-label='Download photo'
            >
              Download
            </button>
            <button
              ref={closeRef}
              className='photo-lightbox-button photo-lightbox-close'
              type='button'
              onClick={onClose}
              aria-label='Close photo'
            >
              ×
            </button>
          </div>
        </div>

        <div className='photo-lightbox-stage'>
          {multi ? (
            <button
              className='photo-lightbox-nav photo-lightbox-prev'
              type='button'
              onClick={goPrev}
              aria-label='Previous photo'
            >
              ‹
            </button>
          ) : null}

          <motion.img
            key={currentUrl}
            className='photo-lightbox-image'
            src={currentUrl}
            alt=''
            drag={multi && !reducedMotion ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_event, info) => {
              if (!multi) return;
              if (info.offset.x <= -SWIPE_THRESHOLD) goNext();
              else if (info.offset.x >= SWIPE_THRESHOLD) goPrev();
            }}
            initial={reducedMotion ? false : { opacity: 0.65 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          />

          {multi ? (
            <button
              className='photo-lightbox-nav photo-lightbox-next'
              type='button'
              onClick={goNext}
              aria-label='Next photo'
            >
              ›
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
