import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Field, Shell, StatusNote } from "../components/ui.tsx";
import { useEvent } from "../hooks/useEvent.ts";
import { MAX_PHOTOS, submitMessage } from "../lib/api.ts";
import { formatEventDate } from "../lib/theme.ts";

type PreviewItem = {
  file: File;
  url: string;
};

export function GuestPage() {
  const { slug } = useParams();
  const { event, status } = useEvent(slug);

  const [guestName, setGuestName] = useState("");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const next = photos.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => {
      for (const item of next) URL.revokeObjectURL(item.url);
    };
  }, [photos]);

  function onPhotosChange(fileList: FileList | null) {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      if (room <= 0) return prev;
      return [...prev, ...incoming.slice(0, room)];
    });
    setError(null);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

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
        photos,
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
        <section className="narrow">
          <h1>This guestbook wasn’t found</h1>
          <p>The QR code may be for a different event, or it hasn’t been created yet.</p>
        </section>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <section className="narrow thanks">
          <p className="kicker">Sent</p>
          <h1>Thank you! Your message has been added 💌</h1>
          <p className="lede">It should appear on the wall in a moment.</p>
          <div className="btn-row">
            <Link className="btn btn-primary" to={`/e/${slug}/wall`}>
              See the wall
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                setDone(false);
                setText("");
                setPhotos([]);
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
      <section className="narrow guest">
        <p className="kicker">{formatEventDate(event.eventDate) || "A wedding guestbook"}</p>
        <h1>{event.coupleNames}</h1>
        <p className="lede">
          {event.welcomeMessage || "Leave a toast — a memory, a wish, or a photo. No account needed."}
        </p>

        <form className="stack" onSubmit={(e) => void onSubmit(e)}>
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
          <Field
            label="Photos"
            hint={`Optional — up to ${MAX_PHOTOS}. We’ll shrink them before upload so venue wifi survives.`}
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              disabled={photos.length >= MAX_PHOTOS}
              onChange={(e) => {
                onPhotosChange(e.target.files);
                e.target.value = "";
              }}
            />
          </Field>
          {previews.length > 0 ? (
            <div className="photo-preview-grid">
              {previews.map((item, index) => (
                <div className="photo-preview-item" key={`${item.file.name}-${item.file.size}-${index}`}>
                  <img className="photo-preview" src={item.url} alt={`Selected photo ${index + 1}`} />
                  <button
                    className="photo-preview-remove"
                    type="button"
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={() => removePhoto(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {photos.length > 0 ? (
            <p className="field-hint">
              {photos.length} of {MAX_PHOTOS} photos
            </p>
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
