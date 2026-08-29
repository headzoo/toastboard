export function DemoBanner() {
  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex h-5 items-center justify-center gap-1.5 bg-[color-mix(in_srgb,#B0894F_18%,var(--color-cream))] px-3 text-[11px] leading-none text-ink print:hidden"
    >
      <svg
        className="size-3.5 shrink-0 text-[color-mix(in_srgb,#B0894F_85%,var(--color-ink))]"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7.25V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.85" fill="currentColor" />
      </svg>
      <span>In demo mode this app deletes guestbooks and images after 15 minutes.</span>
    </div>
  );
}
