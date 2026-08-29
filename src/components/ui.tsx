import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type ShellProps = {
  children: ReactNode;
  eyebrow?: string;
  present?: boolean;
};

export function Shell({ children, eyebrow = "Toastboard", present = false }: ShellProps) {
  return (
    <div className={`app${present ? " is-present" : ""}`}>
      <div className="paper-grain" aria-hidden="true" />
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true" />
          <span>{eyebrow}</span>
        </Link>
      </header>
      <main className="site-main">{children}</main>
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
};

export function Button({
  children,
  type = "button",
  variant = "primary",
  disabled,
  onClick,
  href,
}: ButtonProps) {
  if (href) {
    return (
      <a className={`btn btn-${variant}`} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button className={`btn btn-${variant}`} type={type} disabled={disabled} onClick={onClick}>
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
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export function StatusNote({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "warn" | "ok" | "error";
}) {
  return <p className={`status status-${tone}`}>{children}</p>;
}
