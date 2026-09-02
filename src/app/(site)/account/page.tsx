"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, StatusNote } from "@/components/ui";
import { listOwnedEvents, type OwnedEventSummary } from "@/lib/api";
import { eventGuestbookPath, eventManagePath } from "@/lib/eventRoutes";
import { getEventCopy } from "@/lib/eventTypes";
import { btnClass, btnRowClass, kickerClass, ledeClass, narrowClass } from "@/lib/styles";
import { applyTheme } from "@/lib/theme";
import { formatEventDate } from "@/lib/theme";

export default function Page() {
  const [events, setEvents] = useState<OwnedEventSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applyTheme("#C45C67");
  }, []);

  useEffect(() => {
    let cancelled = false;
    void listOwnedEvents()
      .then((items) => {
        if (!cancelled) setEvents(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load your guestbooks.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={narrowClass}>
      <p className={kickerClass}>Your guestbooks</p>
      <h1>Everything you’ve kept</h1>
      <p className={ledeClass}>
        Guestbooks you create while signed in live here. Your host link still works as a spare key.
      </p>

      <div className={btnRowClass}>
        <Button variant="primary" href="/create/">
          Create another guestbook
        </Button>
      </div>

      {error ? <StatusNote tone="error">{error}</StatusNote> : null}

      {events === null ? (
        <StatusNote>Loading your guestbooks…</StatusNote>
      ) : events.length === 0 ? (
        <StatusNote>
          Nothing here yet.{" "}
          <Link className="text-ink underline-offset-2 hover:underline" href="/create/">
            Create your first guestbook
          </Link>
          .
        </StatusNote>
      ) : (
        <ul className="mt-8 grid gap-4">
          {events.map((event) => {
            const copy = getEventCopy(event.eventType);
            return (
              <li
                key={event.slug}
                className="rounded-[1rem] border border-ink/10 bg-white px-5 py-4 shadow-soft"
              >
                <h2 className="text-[1.15rem]">{event.coupleNames || copy.displayNameFallback}</h2>
                <p className="mt-1 text-[0.85rem] text-ink-soft">
                  {copy.pickerLabel}
                  {event.createdAt ? ` · Created ${formatEventDate(event.createdAt)}` : null}
                </p>
                <div className={`${btnRowClass} mt-4`}>
                  <a className={btnClass("ghost")} href={eventGuestbookPath(event.slug)}>
                    Open guestbook
                  </a>
                  <a className={btnClass("ghost")} href={eventManagePath(event.slug)}>
                    Host tools
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
