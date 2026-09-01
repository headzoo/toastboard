import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { btnClass, btnVariants } from "../lib/styles.ts";

type ShellProps = {
  children: ReactNode;
  footer?: boolean;
  headerLogo?: boolean;
  footerLogo?: boolean;
};

function SiteFooter({ showLogo = false }: { showLogo?: boolean }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] px-[6vw] py-8 print:hidden">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 text-[0.85rem] text-ink-soft">
        {showLogo ? (
          <Link className="mx-auto inline-flex items-center no-underline" to="/">
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
            <Link className="text-ink-soft no-underline hover:text-ink" to="/terms">
              Terms and Conditions
            </Link>
            <Link className="text-ink-soft no-underline hover:text-ink" to="/privacy">
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
}: ShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div className="paper-grain" aria-hidden="true" />
      {headerLogo ? (
        <header className="flex justify-center px-[6vw] pt-5 print:hidden">
          <Link className="inline-flex items-center no-underline" to="/">
            <img
              src="/images/logo.png"
              alt="The Willow Book by Keepwell & Bell"
              className="h-auto w-[min(16.94rem,66.55vw)] sm:w-[min(19.36rem,48.4vw)]"
            />
          </Link>
        </header>
      ) : null}
      <main
        className={`mx-auto w-full max-w-[1180px] flex-1 px-[6vw] pb-20 ${headerLogo ? "pt-4" : "pt-8"}`}
      >
        {children}
      </main>
      {footer ? <SiteFooter showLogo={footerLogo} /> : null}
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
