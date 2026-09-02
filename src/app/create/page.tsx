'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { HostKeepsafeCard } from '@/components/HostKeepsafeCard';
import { Button, Field, Shell, StatusNote } from '@/components/ui';
import { createEvent } from '@/lib/api';
import {
  EVENT_TYPE_OPTIONS,
  getEventCopy,
  isEventType,
  normalizeEventType,
  type EventType,
} from '@/lib/eventTypes';
import { clearKeepsafe, loadKeepsafe, saveKeepsafe } from '@/lib/session';
import { kickerClass, ledeClass, narrowClass } from '@/lib/styles';
import { applyTheme } from '@/lib/theme';
import { DEFAULT_THEME, THEME_SWATCHES } from '@/lib/types';
import type { HostKeepsafe } from '@/lib/types';

function eventTypeFromParams(searchParams: URLSearchParams): EventType {
  const raw = searchParams.get('type');
  return isEventType(raw) ? raw : normalizeEventType(raw);
}

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const forceNew = searchParams.get('new') === 'true';
  const eventType = eventTypeFromParams(searchParams);
  const [coupleNames, setCoupleNames] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [themeColor, setThemeColor] = useState(DEFAULT_THEME);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keepsafe, setKeepsafe] = useState<HostKeepsafe | null>(null);
  const copy = getEventCopy(eventType);

  useEffect(() => {
    setKeepsafe(forceNew ? null : loadKeepsafe());
  }, [forceNew]);

  useEffect(() => {
    applyTheme(themeColor);
  }, [themeColor]);

  useEffect(() => {
    if (!forceNew) return;
    clearKeepsafe();
    setKeepsafe(null);
    const next = new URLSearchParams(searchParams.toString());
    next.delete('new');
    const query = next.toString();
    router.replace(query ? `/create/?${query}` : '/create/');
  }, [forceNew, router, searchParams]);

  function onEventTypeChange(nextType: EventType) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('type', nextType);
    router.replace(`/create/?${next.toString()}`);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createEvent({
        eventType,
        coupleNames,
        eventDate,
        welcomeMessage,
        themeColor,
      });
      const next = {
        slug: created.slug,
        hostToken: created.hostToken,
        eventType,
        coupleNames: coupleNames.trim(),
        themeColor,
        eventDate: eventDate || undefined,
        welcomeMessage: welcomeMessage.trim() || undefined,
        signTheme: created.signTheme,
      };
      saveKeepsafe(next);
      setKeepsafe(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Couldn’t create the guestbook.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      {keepsafe ? (
        <HostKeepsafeCard keepsafe={keepsafe} />
      ) : (
        <section className={narrowClass}>
          <p className={kickerClass}>One-time setup</p>
          <h1>Create a guestbook</h1>
          <p className={ledeClass}>
            Sign in once. We’ll save your guestbook to your account and give you
            a host link as a spare key.
          </p>

          <form className='mt-6 grid gap-4' onSubmit={(e) => void onSubmit(e)}>
            <fieldset className='block border-0 p-0'>
              <legend className='mb-1.5 block text-[0.82rem] font-bold'>
                Event type
              </legend>
              <div className='grid gap-2 sm:grid-cols-2'>
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-[0.9rem] border px-3 py-2.5 text-[0.92rem] ${
                      eventType === option.id
                        ? 'border-ink bg-cream font-semibold'
                        : 'border-ink/15 bg-white'
                    }`}
                  >
                    <input
                      type='radio'
                      name='eventType'
                      value={option.id}
                      checked={eventType === option.id}
                      className='size-4 accent-ink'
                      onChange={() => onEventTypeChange(option.id)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label={copy.displayNameLabel} hint={copy.displayNameHint}>
              <input
                required
                maxLength={120}
                placeholder={copy.displayNamePlaceholder}
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
              />
            </Field>
            <Field label='Event date' hint='Optional'>
              <input
                type='date'
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </Field>
            <Field
              label='Welcome message'
              hint='Optional — a line guests see before they write.'
            >
              <textarea
                maxLength={500}
                rows={3}
                placeholder={copy.createWelcomePlaceholder}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
              />
            </Field>
            <fieldset className='block border-0 p-0'>
              <legend className='mb-1.5 block text-[0.82rem] font-bold'>
                Theme color
              </legend>
              <div className='flex items-center gap-2.5'>
                {THEME_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.value}
                    type='button'
                    className={`size-8 cursor-pointer rounded-full border-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]${
                      themeColor === swatch.value
                        ? ' outline outline-3 outline-offset-2 outline-ink'
                        : ''
                    }`}
                    style={{ background: swatch.value }}
                    aria-label={swatch.label}
                    onClick={() => setThemeColor(swatch.value)}
                  />
                ))}
                <input
                  type='color'
                  value={themeColor}
                  aria-label='Custom color'
                  onChange={(e) => setThemeColor(e.target.value)}
                />
              </div>
            </fieldset>
            {error ? <StatusNote tone='error'>{error}</StatusNote> : null}
            <Button type='submit' disabled={busy}>
              {busy ? 'Creating…' : 'Create guestbook'}
            </Button>
          </form>
        </section>
      )}
    </Shell>
  );
}
