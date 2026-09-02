import { useEffect, useState } from 'react';
import { getEvent } from '../lib/api';
import { applyTheme } from '../lib/theme';
import type { EventRecord } from '../lib/types';

export function useEvent(slug: string | undefined) {
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'missing' | 'error'
  >('loading');

  useEffect(() => {
    if (!slug) {
      setStatus('missing');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    getEvent(slug)
      .then((record) => {
        if (cancelled) return;
        if (!record) {
          setEvent(null);
          setStatus('missing');
          return;
        }
        applyTheme(record.themeColor);
        setEvent(record);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { event, status };
}
