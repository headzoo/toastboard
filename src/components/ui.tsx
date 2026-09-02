"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { btnClass, btnVariants } from "../lib/styles";

type ShellProps = {
  children: ReactNode;
  footer?: boolean;
  headerLogo?: boolean;
  footerLogo?: boolean;
  wide?: boolean;
};

function SiteFooter({ showLogo = false, wide = false }: { showLogo?: boolean; wide?: boolean }) {
  const year = new Date().getFullYear();
  const maxWidthClass = wide ? "max-w-[2000px]" : "max-w-[1180px]";
  return (
    <footer className="mt-auto border-t border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] px-[6vw] py-8 print:hidden">
      <div className={`mx-auto flex ${maxWidthClass} flex-col gap-5 text-[0.85rem] text-ink-soft`}>
        {showLogo ? (
          <Link className="mx-auto inline-flex items-center no-underline" href="/">
            <img
              src="/images/logo.png"
              alt="The Willow Book by Keepwell & Bell"
              className="h-auto w-[min(8.5rem,42vw)] opacity-90"
            />
          </Link>
        ) : null}
        <div className="flex flex-col gap-3 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between">
          <p className="m-0">© {year} The Willow Book. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
            <Link className="text-ink-soft no-underline hover:text-ink" href="/terms/">
              Terms and Conditions
            </Link>
            <Link className="text-ink-soft no-underline hover:text-ink" href="/privacy/">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function Shell({
  children,
  footer = true,
  headerLogo = true,
  footerLogo = false,
  wide = false,
}: ShellProps) {
  const maxWidthClass = wide ? "max-w-[2000px]" : "max-w-[1180px]";
  return (
    <div className="relative flex min-h-svh flex-col">
      <div className="paper-grain" aria-hidden="true" />
      {headerLogo ? (
        <header className="flex justify-center px-[6vw] pt-5 print:hidden">
          <Link className="inline-flex items-center no-underline" href="/">
            <img
              src="/images/logo.png"
              alt="The Willow Book by Keepwell & Bell"
              className="h-auto w-[min(16.94rem,66.55vw)] sm:w-[min(19.36rem,48.4vw)]"
            />
          </Link>
        </header>
      ) : null}
      <main
        className={`mx-auto w-full ${maxWidthClass} flex-1 px-[6vw] pb-20 ${headerLogo ? "pt-4" : "pt-8"}`}
      >
        {children}
      </main>
      {footer ? <SiteFooter showLogo={footerLogo} wide={wide} /> : null}
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: keyof typeof btnVariants;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  small?: boolean;
};

export function Button({
  children,
  type = "button",
  variant = "primary",
  disabled,
  onClick,
  href,
  small = false,
}: ButtonProps) {
  const className = btnClass(variant, small);
  if (href) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.82rem] font-bold">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-[0.85rem] text-ink-soft">{hint}</span> : null}
    </label>
  );
}

const statusTones = {
  muted: "mb-1 px-4 py-3.5 text-ink-soft",
  ok: "mb-1 px-4 py-3.5 text-ok",
  warn: "print:hidden",
  error: "",
} as const;

const boxedNoteClass =
  "relative mb-1 overflow-hidden rounded-[0.4rem] border border-[color-mix(in_srgb,var(--color-ink)_11%,transparent)] bg-[color-mix(in_srgb,var(--color-paper)_70%,white)] px-3.5 py-8 pl-4 font-serif text-[16px] italic leading-snug text-ink";

export function StatusNote({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: keyof typeof statusTones;
}) {
  if (tone === "error" || tone === "warn") {
    return (
      <p
        className={`${boxedNoteClass} ${statusTones[tone]}`}
        role={tone === "error" ? "alert" : undefined}
      >
        <span
          className={`absolute inset-y-0 left-0 w-1 ${tone === "error" ? "bg-oxblood" : "bg-gold"}`}
          aria-hidden="true"
        />
        {children}
      </p>
    );
  }

  return <p className={statusTones[tone]}>{children}</p>;
}
