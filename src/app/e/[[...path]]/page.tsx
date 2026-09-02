"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/ui";
import { parseEventPathname, type EventRoute } from "@/lib/eventRoutes";
import { GuestPage } from "@/views/GuestPage";
import { GuestbookPage } from "@/views/GuestbookPage";
import { ManagePage } from "@/views/ManagePage";

function EventRouteView({ route }: { route: EventRoute }) {
  switch (route.kind) {
    case "guest":
      return <GuestPage slug={route.slug} />;
    case "guestbook":
      return <GuestbookPage slug={route.slug} />;
    case "manage":
      return <ManagePage slug={route.slug} token={route.token} />;
    case "invalid":
      return (
        <Shell>
          <section className="max-w-[760px]">
            <h1>That guestbook isn&apos;t on the table</h1>
          </section>
        </Shell>
      );
  }
}

export default function Page() {
  const [route, setRoute] = useState<EventRoute | null>(null);

  useEffect(() => {
    const sync = () => setRoute(parseEventPathname(window.location.pathname));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  if (!route) {
    return (
      <Shell>
        <section className="max-w-[760px]">
          <p className="kicker">Loading</p>
        </section>
      </Shell>
    );
  }

  return <EventRouteView route={route} />;
}
