import { useEffect, useMemo, useState } from 'react';
import { getEventCopy, type EventType } from '../lib/eventTypes';
import {
  renderTableSignPdf,
  renderTableSignPng,
  type TableSignInput,
} from '../lib/tableSign';
import type { SignThemeId } from '../lib/signThemes';
import { DEFAULT_THEME } from '../lib/types';
import {
  copyText,
  downloadBytes,
  downloadDataUrl,
  guestUrl,
  qrDataUrl,
} from '../lib/urls';
import { Button, StatusNote } from './ui';

type TableSignCardProps = {
  slug: string;
  eventType: EventType;
  coupleNames: string;
  themeColor?: string | null;
  themeId?: SignThemeId | string | null;
  eventDateLabel?: string | null;
  welcomeMessage?: string | null;
};

export function TableSignCard({
  slug,
  eventType,
  coupleNames,
  themeColor,
  themeId,
  eventDateLabel,
  welcomeMessage,
}: TableSignCardProps) {
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState<'pdf' | 'png' | 'qr' | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guestLink = useMemo(() => guestUrl(slug), [slug]);
  const signCopy = getEventCopy(eventType);
  const input = useMemo<TableSignInput>(
    () => ({
      coupleNames,
      guestUrl: guestLink,
      themeColor: themeColor || DEFAULT_THEME,
      themeId,
      eventDateLabel,
      welcomeMessage,
      signKicker: signCopy.signKicker,
      signScanInstruction: signCopy.signScanInstruction,
      signTagline: signCopy.signTagline,
    }),
    [
      coupleNames,
      guestLink,
      themeColor,
      themeId,
      eventDateLabel,
      welcomeMessage,
      signCopy.signKicker,
      signCopy.signScanInstruction,
      signCopy.signTagline,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    renderTableSignPng(input, true)
      .then((src) => {
        if (!cancelled) setPreview(src);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Couldn’t draw the table sign.',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [input]);

  async function run(kind: 'pdf' | 'png' | 'qr', work: () => Promise<void>) {
    setBusy(kind);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Couldn’t prepare that download.',
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className='my-6'>
      <span className='text-[0.8rem] font-bold uppercase tracking-[0.04em]'>
        Table sign
      </span>
      <p className='mt-1.5 mb-3 text-[0.9rem] text-ink-soft'>
        Letter size, 8.5 × 11 in. Print on cardstock at your local copy service
        center and set one on each table.
      </p>
      {preview ? (
        <img
          className='block w-full rounded-2xl shadow-soft'
          src={preview}
          alt={`Table sign for ${coupleNames}`}
        />
      ) : (
        <div className='aspect-[8.5/11] rounded-2xl bg-paper-2' />
      )}
      {error ? <StatusNote tone='error'>{error}</StatusNote> : null}
      <div className='mt-6 flex flex-wrap gap-3 [&>*]:flex-1'>
        <Button
          disabled={busy !== null}
          onClick={() =>
            void run('pdf', async () => {
              downloadBytes(
                await renderTableSignPdf(input),
                `${slug}-table-sign.pdf`,
                'application/pdf',
              );
            })
          }
        >
          {busy === 'pdf' ? 'Preparing…' : 'Download sign PDF'}
        </Button>
        <Button
          variant='ghost'
          disabled={busy !== null}
          onClick={() =>
            void run('png', async () => {
              downloadDataUrl(
                await renderTableSignPng(input),
                `${slug}-table-sign.png`,
              );
            })
          }
        >
          {busy === 'png' ? 'Preparing…' : 'Download sign PNG'}
        </Button>
        <Button
          variant='ghost'
          disabled={busy !== null}
          onClick={() =>
            void run('qr', async () => {
              downloadDataUrl(
                await qrDataUrl(guestLink),
                `${slug}-guest-qr.png`,
              );
            })
          }
        >
          {busy === 'qr' ? 'Preparing…' : 'Download QR'}
        </Button>
        <Button
          variant='ghost'
          disabled={busy !== null}
          onClick={() => {
            void copyText(guestLink).then((ok) => {
              if (!ok) return;
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            });
          }}
        >
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </div>
    </div>
  );
}
