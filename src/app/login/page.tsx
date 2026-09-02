import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPage } from "@/views/LoginPage";
import { MarketingShell } from "@/components/MarketingShell";
import { kickerClass, narrowClass } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Sign in — The Willow Book",
  description: "Sign in to create and manage your Willow Book guestbooks.",
};

function LoginFallback() {
  return (
    <MarketingShell>
      <section className={narrowClass}>
        <p className={kickerClass}>Loading</p>
      </section>
    </MarketingShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPage />
    </Suspense>
  );
}
