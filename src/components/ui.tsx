import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { btnClass, btnVariants } from "../lib/styles.ts";

type ShellProps = {
  children: ReactNode;
  eyebrow?: string;
};

export function Shell({ children, eyebrow = "Toastboard" }: ShellProps) {
  return (
    <div className="relative min-h-svh">
      <div className="paper-grain" aria-hidden="true" />
      <header className="px-[6vw] pt-5 print:hidden">
        <Link
          className="inline-flex items-center gap-2.5 font-serif text-[1.15rem] text-ink no-underline"
          to="/"
        >
          <span
            className="size-[0.85rem] -rotate-45 rounded-[50%_50%_50%_0] border-2 border-accent"
            aria-hidden="true"
          />
          <span>{eyebrow}</span>
        </Link>
      </header>
      <main className="mx-auto max-w-[1180px] px-[6vw] pb-20 pt-8">
        {children}
      </main>
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
  muted: "text-ink-soft",
  warn: "rounded-2xl bg-[color-mix(in_srgb,var(--color-warn)_12%,white)] px-4 py-3.5 text-warn print:hidden",
  ok: "text-ok",
  error: "rounded-2xl bg-[color-mix(in_srgb,var(--color-warn)_12%,white)] px-4 py-3.5 text-warn",
} as const;

export function StatusNote({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: keyof typeof statusTones;
}) {
  return <p className={`px-4 py-3.5 ${statusTones[tone]} mb-1`}>{children}</p>;
}
