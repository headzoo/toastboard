'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CornerSprig,
  HeroGuestbookPreview,
} from '@/components/HeroGuestbookPreview';
import {
  HOME_COME_BACK_AGAIN,
  HOME_FEATURES,
  HOME_GETTING_STARTED,
  HOME_HERO,
  HOME_HOW_IT_WORKS,
  HOME_ON_THE_BIG_DAY,
  HOME_CHOOSE_OCCASION,
  HOME_OCCASION_YOU_PICK,
  HOME_OCCASIONS,
  HOME_STEPS,
  type HomeBigDayGuestbook,
  type HomeBigDayItem,
  type HomeBigDayScene,
  type HomeComeBackMoment,
  type HomeOccasion,
} from '@/lib/homepageContent';
import { loadKeepsafe } from '@/lib/session';
import type { HostKeepsafe } from '@/lib/types';
import {
  marketingBtnClass,
  marketingKickerClass,
  marketingLinkClass,
} from '@/lib/styles';
import { applyTheme } from '@/lib/theme';

function SectionHeading({ children }: { children: string }) {
  return (
    <div className='mb-8 flex items-center gap-3'>
      <span
        className='h-px flex-1 bg-[color-mix(in_srgb,var(--color-ink)_18%,transparent)]'
        aria-hidden='true'
      />
      <img
        src='/images/botanical_sprig_left.png'
        alt=''
        className='h-5 w-auto shrink-0 opacity-80'
        aria-hidden='true'
      />
      <h2 className='m-0 max-w-[min(32rem,72vw)] shrink text-balance text-center font-serif text-[clamp(1.7rem,3.5vw,2.3rem)] font-medium tracking-[-0.03em]'>
        {children}
      </h2>
      <img
        src='/images/botanical_sprig_right.png'
        alt=''
        className='h-5 w-auto shrink-0 opacity-80'
        aria-hidden='true'
      />
      <span
        className='h-px flex-1 bg-[color-mix(in_srgb,var(--color-ink)_18%,transparent)]'
        aria-hidden='true'
      />
    </div>
  );
}

function SceneFigure({ item }: { item: HomeBigDayScene }) {
  return (
    <img
      className={`block w-full rounded-[1.4rem] object-cover shadow-soft${
        item.aspectClass ? ` ${item.aspectClass}` : ''
      }`}
      src={item.src}
      alt={item.alt}
      width={item.width}
      height={item.height}
      loading='lazy'
    />
  );
}

function GuestbookCard({ item }: { item: HomeBigDayGuestbook }) {
  const hasPhoto = Boolean(item.photo);

  return (
    <figure className='home-guestbook-stack m-0'>
      {item.photo ? (
        <div className='home-guestbook-polaroid'>
          <img
            src={item.photo.src}
            alt={item.photo.alt}
            width={1024}
            height={1536}
            loading='lazy'
          />
        </div>
      ) : null}
      <blockquote
        className={`home-guestbook-card${hasPhoto ? ' home-guestbook-card-has-photo' : ''}`}
      >
        <p className='home-guestbook-quote'>{item.quote}</p>
        <footer className='home-guestbook-attribution'>
          — {item.attribution}
        </footer>
      </blockquote>
    </figure>
  );
}

function bigDayItemKey(item: HomeBigDayItem, index: number) {
  if (item.kind === 'scene') return `scene-${item.src}`;
  return `guestbook-${item.attribution}-${index}`;
}

function OnTheBigDayGallery() {
  return (
    <div className='home-big-day-mosaic mx-auto max-w-[1480px]'>
      {HOME_ON_THE_BIG_DAY.items.map((item, index) => (
        <div
          key={bigDayItemKey(item, index)}
          className={`home-big-day-item${item.span === 'full' ? ' home-big-day-item-wide' : ''}`}
        >
          {item.kind === 'scene' ? (
            <SceneFigure item={item} />
          ) : (
            <GuestbookCard item={item} />
          )}
        </div>
      ))}
    </div>
  );
}

function ComeBackMomentFigure({ moment }: { moment: HomeComeBackMoment }) {
  const imgClass = `block w-full rounded-[1.4rem] object-cover shadow-soft${moment.aspectClass ? ` ${moment.aspectClass}` : ''}`;

  return (
    <figure className='m-0'>
      <img
        className={imgClass}
        src={moment.imageSrc}
        alt={moment.imageAlt}
        width={moment.width}
        height={moment.height}
        loading='lazy'
      />
      <figcaption className='mt-3 font-serif text-[1.05rem] text-ink-soft'>
        {moment.caption}
      </figcaption>
    </figure>
  );
}

function ComeBackAgainGallery() {
  const [first, ...rest] = HOME_COME_BACK_AGAIN.moments;
  const pair = rest.filter((moment) => moment.layout === 'half');

  return (
    <div className='mx-auto max-w-[900px]'>
      {first ? <ComeBackMomentFigure moment={first} /> : null}
      {pair.length > 0 ? (
        <div className='mt-8 grid gap-6 min-[700px]:grid-cols-2'>
          {pair.map((moment) => (
            <ComeBackMomentFigure key={moment.caption} moment={moment} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WhatYouGetFeatures({
  titleAs: Title = 'h2',
}: {
  titleAs?: 'h2' | 'h3';
}) {
  return (
    <ul className='m-0 grid list-none gap-8 p-0 min-[720px]:grid-cols-2 min-[720px]:gap-x-0 min-[720px]:gap-y-8 min-[1100px]:grid-cols-4 min-[1100px]:gap-0'>
      {HOME_FEATURES.map((feature, index) => (
        <li
          key={feature.title}
          className={`flex gap-4 px-1 min-[720px]:px-4 min-[1100px]:px-5 ${
            index % 2 === 1
              ? 'min-[720px]:border-l min-[720px]:border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)]'
              : ''
          } ${
            index > 0
              ? 'min-[1100px]:border-l min-[1100px]:border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)]'
              : ''
          }`}
        >
          <img
            src={feature.iconSrc}
            alt={feature.iconAlt}
            className='mt-1 h-12 w-12 shrink-0 object-contain'
            width={48}
            height={48}
            aria-hidden={feature.iconAlt ? undefined : true}
          />
          <div>
            <Title className='mb-1 font-serif text-[1.2rem] font-medium tracking-[-0.02em]'>
              {feature.title}
            </Title>
            <p className='mb-0 font-serif text-[0.95rem] leading-relaxed text-ink-soft'>
              {feature.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FreeTrialCta({ align = 'start' }: { align?: 'start' | 'center' }) {
  return (
    <div
      className={`flex flex-col gap-2 ${align === 'center' ? 'items-center text-center' : 'items-start'}`}
    >
      <Link className={marketingBtnClass} href='/create/'>
        {HOME_HERO.primaryCta}
      </Link>
      <p className='mb-0 font-serif text-[0.95rem] text-ink-soft'>
        {HOME_HERO.trialNote}
      </p>
    </div>
  );
}

function OccasionCard({
  occasion,
  className,
}: {
  occasion: HomeOccasion;
  className?: string;
}) {
  return (
    <Link
      className={`relative z-0 flex items-start gap-4 rounded-lg border border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] px-5 py-3.5 text-ink no-underline transition-[transform,border-color] duration-500 ease-out hover:z-10 hover:scale-[1.03] hover:border-ink/25 motion-reduce:transition-none motion-reduce:hover:scale-100${className ? ` ${className}` : ''}`}
      href={occasion.path}
    >
      <img
        src={occasion.iconSrc}
        alt=''
        className='h-12 w-12 shrink-0 object-contain'
        width={48}
        height={48}
        aria-hidden='true'
      />
      <div className='min-w-0 flex-1'>
        <h3 className='mb-1 font-serif text-[1.15rem] font-medium leading-tight'>
          {occasion.title}
        </h3>
        <p className='mb-2 font-serif text-[0.9rem] leading-snug text-ink-soft'>
          {occasion.description}
        </p>
        <span className='block font-serif text-[0.9rem] leading-none text-oxblood'>
          {occasion.cta}
        </span>
      </div>
    </Link>
  );
}

export default function Page() {
  const pathname = usePathname();
  const [keepsafe, setKeepsafe] = useState<HostKeepsafe | null>(null);

  useEffect(() => {
    applyTheme('#C45C67');
  }, []);

  useEffect(() => {
    setKeepsafe(loadKeepsafe());
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const id = hash.replace(/^#/, '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [pathname]);

  return (
    <>
      {/* Hero */}
      <section className='grid items-center gap-10 py-8 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(17.5rem,24rem)] min-[900px]:gap-12 min-[900px]:py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(19rem,26rem)] lg:gap-16'>
        <div className='relative max-w-[34rem]'>
          <p className={`${marketingKickerClass} font-serif`}>
            {HOME_HERO.kicker}
          </p>
          <h1 className='max-w-[16ch] text-balance font-serif text-[clamp(2.05rem,4.6vw,3.35rem)] font-medium tracking-[-0.03em]'>
            {HOME_HERO.headline}
          </h1>

          <p className='relative mb-0 max-w-[34rem] font-serif text-[1.08rem] italic leading-relaxed text-ink-soft'>
            <CornerSprig className='pointer-events-none absolute -left-4 -top-5 z-0 w-[6.75rem] min-[900px]:-left-5 min-[900px]:-top-6 min-[900px]:w-[7.5rem]' />
            <span className='relative z-10'>{HOME_HERO.lede}</span>
          </p>
          <div className='mt-7 flex flex-wrap items-start gap-x-6 gap-y-3'>
            {keepsafe ? (
              <>
                <Link className={marketingBtnClass} href='/create/'>
                  Edit Guestbook
                </Link>
                <Link
                  className={`${marketingLinkClass} underline decoration-oxblood/70 underline-offset-4`}
                  href='/create/?new=true'
                >
                  Create Another Guestbook
                </Link>
              </>
            ) : (
              <FreeTrialCta />
            )}
          </div>
        </div>

        <HeroGuestbookPreview />
      </section>

      {/* What you get */}
      <section
        className='relative left-1/2 w-[100cqw] max-w-none -translate-x-1/2 '
        aria-label='What you get'
      >
        <div className='px-[4vw] py-10 lg:px-[5vw]'>
          <WhatYouGetFeatures />
        </div>
      </section>

      {/* How it works */}
      <section
        id='how-it-works'
        className='relative left-1/2 w-[100cqw] max-w-none -translate-x-1/2 scroll-mt-8 py-12'
        aria-label={HOME_HOW_IT_WORKS.heading}
      >
        <div className='px-[4vw] lg:px-[5vw]'>
          <SectionHeading>{HOME_HOW_IT_WORKS.heading}</SectionHeading>
          <p className='mx-auto mb-10 max-w-[34rem] text-balance text-center font-serif text-[1.08rem] italic leading-relaxed text-ink-soft'>
            {HOME_HOW_IT_WORKS.lede}
          </p>

          <ol className='m-0 -mt-4 grid list-none gap-10 p-0 min-[900px]:grid-cols-3 min-[900px]:gap-0'>
            {HOME_STEPS.map((step, index) => (
              <li
                key={step.title}
                className={`flex flex-col gap-5 min-[900px]:px-8 ${
                  index > 0
                    ? 'min-[900px]:border-l min-[900px]:border-dotted min-[900px]:border-[color-mix(in_srgb,var(--color-ink)_28%,transparent)]'
                    : ''
                }`}
              >
                <img
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  width={step.width}
                  height={step.height}
                  className='aspect-[4/3] w-full rounded-[1.2rem] object-contain'
                  loading='lazy'
                />
                <div className='flex items-start gap-4'>
                  <span className='flex size-11 shrink-0 items-center justify-center rounded-full bg-gold font-serif text-[1.15rem] font-medium text-cream'>
                    {index + 1}
                  </span>
                  <div className='min-w-0 pt-0.5'>
                    <h3 className='mb-1.5 font-serif text-[1.2rem] font-medium leading-tight'>
                      {step.title}
                    </h3>
                    <p className='mb-0 font-serif text-[0.95rem] leading-snug text-ink-soft'>
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Choose occasion */}
      <section
        id='occasions'
        className='relative left-1/2 w-[100cqw] max-w-none -translate-x-1/2 scroll-mt-8 py-12'
        aria-label={HOME_CHOOSE_OCCASION.heading}
      >
        <div className='px-[4vw] lg:px-[5vw]'>
          <SectionHeading>{HOME_CHOOSE_OCCASION.heading}</SectionHeading>
          <p className='mx-auto mb-10 max-w-[34rem] text-balance text-center font-serif text-[1.08rem] italic leading-relaxed text-ink-soft'>
            {HOME_CHOOSE_OCCASION.lede}
          </p>
          <ul className='m-0 grid list-none grid-cols-1 gap-4 p-0 min-[720px]:grid-cols-2 min-[1200px]:grid-cols-4'>
            {HOME_OCCASIONS.map((occasion) => (
              <li key={occasion.path} className='min-w-0'>
                <OccasionCard occasion={occasion} className='w-full' />
              </li>
            ))}
            <li className='min-w-0 min-[1200px]:col-span-4 min-[1200px]:flex min-[1200px]:justify-center'>
              <OccasionCard
                occasion={HOME_OCCASION_YOU_PICK}
                className='w-full min-[1200px]:max-w-[calc((100%-3*1rem)/4)]'
              />
            </li>
          </ul>
        </div>
      </section>

      <section
        className='relative left-1/2 w-[100cqw] max-w-none -translate-x-1/2 py-12'
        aria-label={HOME_ON_THE_BIG_DAY.heading}
      >
        <div className='px-[4vw] lg:px-[5vw]'>
          <SectionHeading>{HOME_ON_THE_BIG_DAY.heading}</SectionHeading>
          <p className='mx-auto mb-10 max-w-[34rem] text-balance text-center font-serif text-[1.08rem] italic leading-relaxed text-ink-soft'>
            {HOME_ON_THE_BIG_DAY.lede}
          </p>
          <OnTheBigDayGallery />
        </div>
      </section>

      <section
        className='relative left-1/2 w-[100cqw] max-w-none -translate-x-1/2 py-12'
        aria-label='Come back again and again'
      >
        <div className='px-[4vw] lg:px-[5vw]'>
          <SectionHeading>{HOME_COME_BACK_AGAIN.heading}</SectionHeading>
          <p className='mx-auto mb-10 max-w-[34rem] text-balance text-center font-serif text-[1.08rem] italic leading-relaxed text-ink-soft'>
            {HOME_COME_BACK_AGAIN.lede}
          </p>
          <ComeBackAgainGallery />
        </div>
      </section>

      <section
        id='getting-started'
        className='relative left-1/2 w-[100cqw] max-w-none -translate-x-1/2 scroll-mt-8 pt-12 pb-0'
        aria-label={HOME_GETTING_STARTED.heading}
      >
        <div className='px-[4vw] lg:px-[5vw]'>
          <SectionHeading>{HOME_GETTING_STARTED.heading}</SectionHeading>
          <WhatYouGetFeatures titleAs='h3' />
          <div className='mt-10 flex justify-center'>
            <FreeTrialCta align='center' />
          </div>
        </div>
      </section>
    </>
  );
}
