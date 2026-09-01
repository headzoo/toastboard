import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  HOME_HERO_GUESTBOOK,
  type HomeHeroAccent,
  type HomeHeroGuestbookEntry,
} from "../lib/homepageContent.ts";

const ACCENT_CLASS: Record<HomeHeroAccent, string> = {
  gold: "bg-gold",
  olive: "bg-ok",
  oxblood: "bg-oxblood",
};

const CHAR_MS = 45;
const BEFORE_ATTRIBUTION_MS = 400;
const BETWEEN_ENTRIES_MS = 350;
const NEXT_FADE_LEAD_MS = 150;
const HOLD_COMPLETE_MS = 3000;
const FADE_MS = 450;
/** Tallest hero guestbook cycle (two photo rows) — used to reserve list height. */
const SIZING_CYCLE_INDEX = 1;

type EntryProgress = {
  quoteLen: number;
  attrLen: number;
  revealed: boolean;
};

function emptyProgress(count: number): EntryProgress[] {
  return Array.from({ length: count }, () => ({
    quoteLen: 0,
    attrLen: 0,
    revealed: false,
  }));
}

function attributionLabel(attribution: string) {
  return `— ${attribution}`;
}

function delay(ms: number, signal: { cancelled: boolean; timeouts: number[] }) {
  return new Promise<void>((resolve) => {
    const id = window.setTimeout(() => {
      if (!signal.cancelled) resolve();
    }, ms);
    signal.timeouts.push(id);
  });
}

function useHeroGuestbookSequence(
  cycles: readonly (readonly HomeHeroGuestbookEntry[])[],
  reducedMotion: boolean | null,
) {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [progress, setProgress] = useState<EntryProgress[]>(() =>
    emptyProgress(cycles[0]?.length ?? 0),
  );
  const [setOpacity, setSetOpacity] = useState(1);

  useEffect(() => {
    if (reducedMotion) return;

    const signal = { cancelled: false, timeouts: [] as number[] };

    const patchEntry = (index: number, patch: Partial<EntryProgress>) => {
      setProgress((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    };

    (async () => {
      let idx = 0;

      while (!signal.cancelled) {
        const entries = cycles[idx];
        if (!entries?.length) return;

        setCycleIndex(idx);
        setSetOpacity(1);
        setProgress(emptyProgress(entries.length));

        for (let i = 0; i < entries.length; i += 1) {
          if (signal.cancelled) return;

          patchEntry(i, { revealed: true });

          const { quote, attribution } = entries[i];
          for (let c = 1; c <= quote.length; c += 1) {
            patchEntry(i, { quoteLen: c });
            await delay(CHAR_MS, signal);
          }

          await delay(BEFORE_ATTRIBUTION_MS, signal);
          if (signal.cancelled) return;

          const attr = attributionLabel(attribution);
          const attrMs = attr.length * CHAR_MS;
          const previewNextAt = i < entries.length - 1 ? Math.max(0, attrMs - NEXT_FADE_LEAD_MS) : null;
          let typedMs = 0;
          let nextFading = false;

          for (let c = 1; c <= attr.length; c += 1) {
            patchEntry(i, { attrLen: c });
            const stepEnd = typedMs + CHAR_MS;
            if (previewNextAt != null && !nextFading && stepEnd >= previewNextAt) {
              await delay(previewNextAt - typedMs, signal);
              if (signal.cancelled) return;
              patchEntry(i + 1, { revealed: true });
              nextFading = true;
              await delay(stepEnd - previewNextAt, signal);
            } else {
              await delay(CHAR_MS, signal);
            }
            typedMs = stepEnd;
            if (signal.cancelled) return;
          }

          if (previewNextAt != null && !nextFading) {
            patchEntry(i + 1, { revealed: true });
          }

          if (i < entries.length - 1) {
            await delay(BETWEEN_ENTRIES_MS, signal);
          }
        }

        await delay(HOLD_COMPLETE_MS, signal);
        if (signal.cancelled) return;

        setSetOpacity(0);
        await delay(FADE_MS, signal);
        if (signal.cancelled) return;

        idx = (idx + 1) % cycles.length;
      }
    })();

    return () => {
      signal.cancelled = true;
      for (const id of signal.timeouts) window.clearTimeout(id);
    };
  }, [cycles, reducedMotion]);

  return { cycleIndex, progress, setOpacity, reducedMotion: !!reducedMotion };
}

export function CornerSprig({ className }: { className?: string }) {
  return (
    <img
      src="/images/anniversary_sprig_icon_transparent.png"
      alt=""
      className={className}
      aria-hidden="true"
    />
  );
}

function HeartMark() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22.25" fill="var(--color-cream)" stroke="var(--color-gold)" strokeWidth="1.15" />
      <circle cx="24" cy="24" r="18.6" fill="none" stroke="var(--color-gold)" strokeWidth="0.7" opacity="0.55" />
      <path
        d="M24 33.2s-8.4-5.3-8.4-10.4A4.3 4.3 0 0 1 24 20.2a4.3 4.3 0 0 1 8.4 2.6C32.4 27.9 24 33.2 24 33.2Z"
        fill="var(--color-gold)"
      />
    </svg>
  );
}

type TypedEntryProps = {
  entry: HomeHeroGuestbookEntry;
  index: number;
  quoteLen: number;
  attrLen: number;
  revealed: boolean;
  staticMode: boolean;
  sizingGhost?: boolean;
};

function TypedEntry({
  entry,
  index,
  quoteLen,
  attrLen,
  revealed,
  staticMode,
  sizingGhost = false,
}: TypedEntryProps) {
  const photo = entry.photo;
  const attr = attributionLabel(entry.attribution);
  const isStatic = staticMode || sizingGhost;
  const isVisible = sizingGhost || staticMode || revealed;
  const quoteText = isStatic ? entry.quote : entry.quote.slice(0, quoteLen);
  const attrText = isStatic ? attr : attr.slice(0, attrLen);
  const showAttr = isStatic || attrLen > 0;

  const quoteClass = photo
    ? "mb-1 font-serif text-[0.92rem] italic leading-snug text-ink"
    : "mb-1 font-serif text-[0.98rem] italic leading-snug text-ink";
  const footerClass = "font-serif text-[0.74rem] text-ink-soft";

  const liClassName = `relative overflow-hidden rounded-[0.4rem] border border-[color-mix(in_srgb,var(--color-ink)_11%,transparent)] bg-[color-mix(in_srgb,var(--color-paper)_70%,white)] ${index === 1 ? "ml-3" : ""
    }`;

  const body = (
    <>
      <span
        className={`absolute inset-y-0 left-0 w-1 ${ACCENT_CLASS[entry.accent]}`}
        aria-hidden="true"
      />
      {photo ? (
        <div className="flex items-start gap-3 py-2.5 pl-3.5 pr-3">
          <img
            src={photo.src}
            alt={photo.alt}
            width={1024}
            height={1536}
            className="size-[4.85rem] shrink-0 rounded-[0.28rem] object-cover object-[center_18%]"
          />
          <blockquote className="relative m-0 min-w-0 pt-0.5">
            <div className="invisible" aria-hidden="true">
              <p className={quoteClass}>{entry.quote}</p>
              <footer className={footerClass}>{attr}</footer>
            </div>
            <div className="absolute inset-0 pt-0.5">
              <p className={quoteClass}>{quoteText}</p>
              {showAttr ? <footer className={footerClass}>{attrText}</footer> : null}
            </div>
          </blockquote>
        </div>
      ) : (
        <blockquote className="relative m-0 px-3.5 py-2.5 pl-4">
          <div className="invisible" aria-hidden="true">
            <p className={quoteClass}>{entry.quote}</p>
            <footer className={footerClass}>{attr}</footer>
          </div>
          <div className="absolute inset-0 px-3.5 py-2.5 pl-4">
            <p className={quoteClass}>{quoteText}</p>
            {showAttr ? <footer className={footerClass}>{attrText}</footer> : null}
          </div>
        </blockquote>
      )}
    </>
  );

  if (sizingGhost) {
    return <li className={liClassName}>{body}</li>;
  }

  return (
    <motion.li
      className={liClassName}
      initial={staticMode ? false : { opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: staticMode ? 0 : FADE_MS / 1000, ease: "easeOut" }}
      style={{ pointerEvents: isVisible ? undefined : "none" }}
    >
      {body}
    </motion.li>
  );
}

export function HeroGuestbookPreview() {
  const prefersReducedMotion = useReducedMotion();
  const { cycleIndex, progress, setOpacity, reducedMotion } = useHeroGuestbookSequence(
    HOME_HERO_GUESTBOOK.cycles,
    prefersReducedMotion,
  );

  const entries = HOME_HERO_GUESTBOOK.cycles[reducedMotion ? 0 : cycleIndex] ?? HOME_HERO_GUESTBOOK.cycles[0];
  const sizingEntries = HOME_HERO_GUESTBOOK.cycles[SIZING_CYCLE_INDEX] ?? HOME_HERO_GUESTBOOK.cycles[0];

  return (
    <div className="relative mx-auto w-full max-w-[26rem] min-[900px]:max-w-none">
      <CornerSprig className="pointer-events-none absolute -left-10 -top-9 w-[8.5rem] min-[900px]:-left-14 min-[900px]:-top-11 min-[900px]:w-[10.5rem]" />
      <CornerSprig className="pointer-events-none absolute -bottom-9 -right-10 w-[8.5rem] rotate-180 min-[900px]:-bottom-11 min-[900px]:-right-14 min-[900px]:w-[10.5rem]" />

      <figure className="relative m-0">
        <div className="rounded-[1.25rem] border border-[color-mix(in_srgb,var(--color-ink)_16%,transparent)] bg-cream p-[0.35rem] shadow-soft">
          <div className="rounded-[1rem] border border-[color-mix(in_srgb,var(--color-ink)_9%,transparent)] px-3.5 pb-4 pt-3.5 min-[900px]:px-4 min-[900px]:pb-4 min-[900px]:pt-4">
            <p className="mb-3.5 text-center font-serif text-[0.66rem] font-medium uppercase tracking-[0.18em] text-ink-soft min-[900px]:text-[0.7rem]">
              {HOME_HERO_GUESTBOOK.heading}
            </p>

            <div className="relative">
              <ul
                className="invisible pointer-events-none m-0 flex list-none flex-col gap-2 p-0"
                aria-hidden="true"
              >
                {sizingEntries.map((entry, index) => (
                  <TypedEntry
                    key={`ghost-${entry.attribution}-${index}`}
                    entry={entry}
                    index={index}
                    quoteLen={0}
                    attrLen={0}
                    revealed
                    staticMode
                    sizingGhost
                  />
                ))}
              </ul>

              <motion.ul
                className="absolute inset-0 m-0 flex list-none flex-col gap-2 p-0"
                animate={{ opacity: reducedMotion ? 1 : setOpacity }}
                transition={{ duration: reducedMotion ? 0 : FADE_MS / 1000, ease: "easeOut" }}
                aria-hidden="true"
              >
                {entries.map((entry, index) => {
                  const state = progress[index] ?? { quoteLen: 0, attrLen: 0, revealed: false };
                  return (
                    <TypedEntry
                      key={`${cycleIndex}-${entry.attribution}-${index}`}
                      entry={entry}
                      index={index}
                      quoteLen={state.quoteLen}
                      attrLen={state.attrLen}
                      revealed={reducedMotion ? true : state.revealed}
                      staticMode={reducedMotion}
                    />
                  );
                })}
              </motion.ul>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1.5 -right-1.5">
          <HeartMark />
        </div>
        <figcaption className="sr-only">A sample Willow Book guestbook with notes and a guest photo.</figcaption>
      </figure>
    </div>
  );
}
