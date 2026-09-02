import type { Metadata } from "next";
import { Suspense } from "react";
import { CreatePage } from "@/views/CreatePage";
import { Shell } from "@/components/ui";

export const metadata: Metadata = {
  title: "Create a guestbook — The Willow Book",
  description:
    "Start a Willow Book guestbook in minutes. No account, no checkout — just a link to share with your guests.",
};

function CreateFallback() {
  return (
    <Shell>
      <section className="max-w-[760px]">
        <p className="kicker">Loading</p>
      </section>
    </Shell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CreateFallback />}>
      <CreatePage />
    </Suspense>
  );
}
