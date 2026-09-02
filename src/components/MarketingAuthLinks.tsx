"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutAll } from "@/lib/firebaseAuth";
import { marketingBtnClass } from "@/lib/styles";

export function MarketingAuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  async function onSignOut() {
    onNavigate?.();
    await signOutAll();
    router.refresh();
  }

  if (status === "loading") {
    return (
      <span className="text-[0.85rem] text-ink-soft" aria-hidden="true">
        …
      </span>
    );
  }

  if (session?.user) {
    return (
      <>
        <Link
          className="text-[0.85rem] text-ink-soft no-underline hover:text-ink"
          href="/account/"
          onClick={onNavigate}
        >
          Your guestbooks
        </Link>
        <button
          type="button"
          className="text-[0.85rem] text-ink-soft underline-offset-2 hover:text-ink hover:underline"
          onClick={() => void onSignOut()}
        >
          Sign out
        </button>
        <Link className={marketingBtnClass} href="/create/" onClick={onNavigate}>
          14-day Free Trial
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        className="text-[0.85rem] text-ink-soft no-underline hover:text-ink"
        href="/login/"
        onClick={onNavigate}
      >
        Sign in
      </Link>
      <Link className={marketingBtnClass} href="/create/" onClick={onNavigate}>
        14-day Free Trial
      </Link>
    </>
  );
}
