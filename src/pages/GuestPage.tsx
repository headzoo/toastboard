import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Field, Shell, StatusNote } from "../components/ui.tsx";
import { useEvent } from "../hooks/useEvent.ts";
import { submitMessage } from "../lib/api.ts";
import { btnClass, btnRowClass, kickerClass, ledeClass, narrowClass } from "../lib/styles.ts";
import { formatEventDate } from "../lib/theme.ts";

export function GuestPage() {
  const { slug } = useParams();
  const { event, status } = useEvent(slug);

  const [guestName, setGuestName] = useState("");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function onSubmit(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!slug) return;
    setBusy(true);
    setError(null);
    try {
      await submitMessage({
        slug,
        guestName,
        text,
        photo,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t send that toast.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <Shell>
        <StatusNote>Opening the guestbook…</StatusNote>
      </Shell>
    );
  }

  if (status !== "ready" || !event || !slug) {
    return (
      <Shell>
        <section className={narrowClass}>
          <h1>This guestbook wasn’t found</h1>
          <p>The QR code may be for a different event, or it hasn’t been created yet.</p>
        </section>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <section className={`${narrowClass} pt-[8vh]`}>
          <p className={kickerClass}>Sent</p>
          <h1>Thank you! Your message has been added 💌</h1>
          <p className={ledeClass}>It should appear on the wall in a moment.</p>
          <div className={btnRowClass}>
            <Link className={btnClass("primary")} to={`/e/${slug}/wall`}>
              See the wall
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                setDone(false);
                setText("");
                setPhoto(null);
              }}
            >
              Leave another
            </Button>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className={narrowClass}>
        <p className={kickerClass}>{formatEventDate(event.eventDate) || "A wedding guestbook"}</p>
        <h1>{event.coupleNames}</h1>
        <p className={ledeClass}>
          {event.welcomeMessage || "Leave a toast — a memory, a wish, or a photo. No account needed."}
        </p>

        <form className="mt-6 grid gap-4" onSubmit={(e) => void onSubmit(e)}>
          <Field label="Your name" hint="Optional">
            <input
              maxLength={80}
              placeholder="Auntie June"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </Field>
          <Field label="Your toast">
            <textarea
              maxLength={1000}
              rows={5}
              placeholder="May your coffee always be hot and your inside jokes never make sense to anyone else."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>
          <Field label="Photo" hint="Optional — we’ll shrink it before upload so venue wifi survives.">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </Field>
          {preview ? (
            <img
              className="block max-h-60 w-full rounded-2xl object-cover"
              src={preview}
              alt="Selected photo preview"
            />
          ) : null}
          {error ? <StatusNote tone="error">{error}</StatusNote> : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Sending…" : "Add to the guestbook"}
          </Button>
        </form>
      </section>
    </Shell>
  );
}
