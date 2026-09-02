"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { pathsMatch } from "../lib/eventRoutes";
import { MarketingAuthLinks } from "./MarketingAuthLinks";

type SiteLayoutProps = {
  children: ReactNode;
};

const LEFT_NAV = [
  { label: "How it works", href: "/#how-it-works", hash: "how-it-works" },
  { label: "Occasions", href: "/#occasions", hash: "occasions" },
  { label: "Examples", href: "/examples/" },
  { label: "Pricing", href: "/pricing/" },
] as const;

const FOOTER_LINKS = [
  { label: "About", href: "/about/" },
  { label: "Help Center", href: "/help/" },
  { label: "Privacy", href: "/privacy/" },
  { label: "Terms", href: "/terms/" },
] as const;

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `text-[0.82rem] tracking-[0.02em] no-underline transition-colors ${
    isActive ? "text-ink" : "text-ink-soft hover:text-ink"
  }`;
}

function HashNavLink({
  href,
  hash,
  label,
  onNavigate,
}: {
  href: string;
  hash: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => {
      setActive(pathsMatch(pathname, "/") && window.location.hash === `#${hash}`);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname, hash]);

  return (
    <Link className={navLinkClass({ isActive: active })} href={href} onClick={onNavigate}>
      {label}
    </Link>
  );
}

function LeftNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {LEFT_NAV.map((item) =>
        "hash" in item && item.hash ? (
          <HashNavLink
            key={item.label}
            href={item.href}
            hash={item.hash}
            label={item.label}
            onNavigate={onNavigate}
          />
        ) : (
          <Link
            key={item.label}
            className={navLinkClass({ isActive: pathsMatch(pathname, item.href) })}
            href={item.href}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        ),
      )}
    </>
  );
}

function SiteLayoutFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[color-mix(in_srgb,var(--color-ink)_12%,transparent)] px-[4vw] py-10 print:hidden">
      <div className="mx-auto grid max-w-[1180px] gap-8 text-[0.85rem] text-ink-soft min-[900px]:grid-cols-[1fr_auto_1fr] min-[900px]:items-center">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 min-[900px]:justify-start" aria-label="Site">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} className="text-ink-soft no-underline hover:text-ink" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          className="flex items-center justify-center gap-3 font-serif text-[0.95rem] leading-none text-ink no-underline hover:text-oxblood"
          href="https://keepwellandbell.com"
        >
          <img
            src="/images/botanical_sprig_left.png"
            alt=""
            className="h-5 w-auto shrink-0 opacity-80"
            aria-hidden="true"
          />
          <span>The Willow Book is a product by Keepwell &amp; Bell</span>
          <img
            src="/images/botanical_sprig_right.png"
            alt=""
            className="h-5 w-auto shrink-0 opacity-80"
            aria-hidden="true"
          />
        </a>

        <p className="m-0 text-center min-[900px]:text-right">© {year} The Willow Book</p>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="@container relative flex min-h-svh flex-col">
      <div className="paper-grain" aria-hidden="true" />

      <header className="relative z-20 px-[4vw] pt-5 print:hidden">
        <div className="mx-auto grid max-w-[1180px] items-center gap-3 min-[960px]:grid-cols-[1fr_auto_1fr]">
          <nav
            className="hidden flex-wrap items-center gap-x-5 gap-y-2 min-[960px]:flex"
            aria-label="Primary"
          >
            <LeftNavLinks />
          </nav>

          <div className="flex items-center justify-between min-[960px]:justify-center">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-ink/15 bg-cream px-3 py-2 text-[0.8rem] font-semibold text-ink min-[960px]:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>

            <Link className="inline-flex items-center no-underline" href="/" onClick={closeMenu}>
              <img
                src="/images/logo.png"
                alt="The Willow Book by Keepwell & Bell"
                className="h-auto w-[min(12.1rem,50.6vw)]"
              />
            </Link>

            <span className="w-[3.5rem] min-[960px]:hidden" aria-hidden="true" />
          </div>

          <div className="hidden items-center justify-end gap-4 min-[960px]:flex">
            <MarketingAuthLinks />
          </div>
        </div>

        {menuOpen ? (
          <nav
            id="site-mobile-nav"
            className="mx-auto mt-4 flex max-w-[1180px] flex-col gap-3 rounded-xl border border-ink/10 bg-cream/95 px-4 py-4 shadow-soft min-[960px]:hidden"
            aria-label="Mobile"
          >
            <LeftNavLinks onNavigate={closeMenu} />
            <hr className="border-ink/10" />
            <MarketingAuthLinks onNavigate={closeMenu} />
          </nav>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-[4vw] pb-20">{children}</main>
      <SiteLayoutFooter />
    </div>
  );
}
