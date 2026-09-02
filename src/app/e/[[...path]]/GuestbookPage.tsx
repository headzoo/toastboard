'use client';

import { useEffect, useRef, useState } from 'react';
import { Shell, StatusNote } from '../../../components/ui';
import { GuestbookFeed } from '../../../components/GuestbookFeed';
import { GuestbookSlideshow } from '../../../components/GuestbookSlideshow';
import { useEvent } from '../../../hooks/useEvent';
import { useMessages } from '../../../hooks/useMessages';
import { eventGuestPath } from '../../../lib/eventRoutes';
import {
  btnClass,
  btnRowClass,
  narrowClass,
  ledeClass,
} from '../../../lib/styles';
import { getSignTheme } from '../../../lib/signThemes';
import { getEventCopy } from '../../../lib/eventTypes';
import { formatEventDate } from '../../../lib/theme';

export function GuestbookPage({ slug }: { slug: string }) {
  const { event, status } = useEvent(slug);
  const { messages, error, live } = useMessages(slug, status === 'ready');
  const fullscreenRootRef = useRef<HTMLDivElement>(null);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement !== fullscreenRootRef.current) {
        setSlideshowActive(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (status === 'loading') {
    return (
      <Shell headerLogo={false} footerLogo wide>
        <StatusNote>Loading the guestbook…</StatusNote>
      </Shell>
    );
  }

  if (status !== 'ready' || !event || !slug) {
    return (
      <Shell headerLogo={false} footerLogo wide>
        <section className={narrowClass}>
          <h1>This guestbook isn’t here yet</h1>
          <p>Create a guestbook first, then share the guest QR.</p>
        </section>
      </Shell>
    );
  }

  const startSlideshow = async () => {
    const root = fullscreenRootRef.current;
    if (!root?.requestFullscreen) {
      setFullscreenError('Fullscreen isn’t available in this browser.');
      return;
    }
    setFullscreenError(null);
    try {
      await root.requestFullscreen();
      if (document.fullscreenElement === root) setSlideshowActive(true);
    } catch {
      setFullscreenError(
        'Couldn’t start fullscreen. Please allow fullscreen and try again.',
      );
    }
  };

  const exitSlideshow = () => {
    setSlideshowActive(false);
    if (document.fullscreenElement === fullscreenRootRef.current) {
      void document.exitFullscreen().catch(() => {});
    }
  };

  const palette = getSignTheme(event.signTheme);
  const copy = getEventCopy(event.eventType);

  return (
    <div ref={fullscreenRootRef}>
      {slideshowActive ? (
        <GuestbookSlideshow
          event={event}
          messages={messages}
          ready={live}
          slug={slug}
          onExit={exitSlideshow}
        />
      ) : (
        <Shell headerLogo={false} footerLogo wide>
          <section className='mb-8'>
            <h1 className='mb-0'>{event.coupleNames}</h1>
            {event.eventDate ? (
              <p className={ledeClass}>{formatEventDate(event.eventDate)}</p>
            ) : null}
            <div className={`${btnRowClass} print:hidden`}>
              <a className={btnClass('ghost')} href={eventGuestPath(slug)}>
                {copy.guestbookCtaLabel}
              </a>
              <button
                className={btnClass('ghost')}
                type='button'
                onClick={() => void startSlideshow()}
                style={{
                  borderColor: palette.inkSoft,
                  color: palette.ink,
                  backgroundColor: palette.cream,
                }}
              >
                Start slideshow
              </button>
            </div>
          </section>
          {error || fullscreenError ? (
            <StatusNote tone='error'>{error ?? fullscreenError}</StatusNote>
          ) : null}
          <GuestbookFeed
            messages={messages}
            emptyLabel={copy.guestbookEmptyLabel}
          />
        </Shell>
      )}
    </div>
  );
}
