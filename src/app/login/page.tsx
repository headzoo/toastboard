"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { Button, Field, StatusNote } from "@/components/ui";
import {
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/firebaseAuth";
import { btnClass, kickerClass, ledeClass, narrowClass } from "@/lib/styles";
import { applyTheme } from "@/lib/theme";

type Mode = "sign-in" | "sign-up" | "reset";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account/";
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  async function onGoogleSignIn() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await signInWithGoogle();
      router.replace(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign you in with Google.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "reset") {
        await sendPasswordReset(email.trim());
        setNotice("If that address is on file, we sent a reset link.");
        setMode("sign-in");
        return;
      }

      if (mode === "sign-up") {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
      router.replace(callbackUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign you in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MarketingShell>
      <section className={narrowClass}>
        <p className={kickerClass}>Host sign-in</p>
        <h1>Sign in to your guestbooks</h1>
        <p className={ledeClass}>
          Guests never log in here — this is for hosts who create and keep a Willow Book.
        </p>

        <div className="mt-6 grid gap-4">
          <button
            type="button"
            className={btnClass("ghost")}
            disabled={busy}
            onClick={() => void onGoogleSignIn()}
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[0.82rem] text-ink-soft">
            <span className="h-px flex-1 bg-ink/10" aria-hidden="true" />
            <span>or</span>
            <span className="h-px flex-1 bg-ink/10" aria-hidden="true" />
          </div>

          <form className="grid gap-4" onSubmit={(e) => void onSubmit(e)}>
            <Field label="Email">
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            {mode !== "reset" ? (
              <Field label="Password">
                <input
                  type="password"
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </Field>
            ) : null}

            {error ? <StatusNote tone="error">{error}</StatusNote> : null}
            {notice ? <StatusNote>{notice}</StatusNote> : null}

            <Button type="submit" variant="primary" disabled={busy}>
              {mode === "sign-up"
                ? "Create account"
                : mode === "reset"
                  ? "Send reset link"
                  : "Sign in"}
            </Button>
          </form>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.85rem]">
            {mode === "sign-in" ? (
              <>
                <button
                  type="button"
                  className="text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                  onClick={() => {
                    setMode("sign-up");
                    setError(null);
                    setNotice(null);
                  }}
                >
                  Create an account
                </button>
                <button
                  type="button"
                  className="text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                  onClick={() => {
                    setMode("reset");
                    setError(null);
                    setNotice(null);
                  }}
                >
                  Forgot password
                </button>
              </>
            ) : (
              <button
                type="button"
                className="text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                onClick={() => {
                  setMode("sign-in");
                  setError(null);
                  setNotice(null);
                }}
              >
                Back to sign in
              </button>
            )}
          </div>

          <p className="text-[0.85rem] text-ink-soft">
            New here?{" "}
            <Link className="text-ink underline-offset-2 hover:underline" href="/create/">
              Start a 14-day free trial
            </Link>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
