export const btnBase =
  "inline-flex appearance-none items-center justify-center gap-1.5 rounded-full border-0 px-[1.2rem] py-[0.85rem] font-sans text-[0.95rem] font-[650] leading-none no-underline cursor-pointer disabled:opacity-60 disabled:cursor-wait";

export const btnVariants = {
  primary: "bg-accent text-cream",
  ghost: "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--color-ink)_16%,transparent)]",
  danger: "bg-[color-mix(in_srgb,var(--color-warn)_12%,white)] text-warn",
} as const;

export const btnSmall = "mt-3 px-3.5 py-[0.45rem] text-[0.8rem]";

export function btnClass(variant: keyof typeof btnVariants = "primary", small = false) {
  return `${btnBase} ${btnVariants[variant]}${small ? ` ${btnSmall}` : ""}`;
}

export const kickerClass =
  "mb-3 flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-accent-deep";

export const ledeClass = "max-w-2xl text-[1.15rem] text-ink-soft";

export const btnRowClass = "mt-6 flex flex-wrap gap-3";

export const narrowClass = "max-w-[760px]";

/** Marketing CTAs — slightly rounded rectangle, oxblood (homepage mock). */
export const marketingBtnClass =
  "inline-flex appearance-none items-center justify-center rounded-md border-0 bg-oxblood px-5 py-3 font-serif text-[1rem] font-medium leading-none text-cream no-underline cursor-pointer hover:brightness-[0.95]";

export const marketingKickerClass =
  "mb-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-oxblood";

export const marketingLinkClass =
  "font-serif text-[1rem] text-oxblood no-underline hover:underline";
