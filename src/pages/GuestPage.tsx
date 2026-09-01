import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Field, Shell, StatusNote } from "../components/ui.tsx";
import { useEvent } from "../hooks/useEvent.ts";
import { MAX_PHOTOS, submitMessage, validateGuestVideo } from "../lib/api.ts";
import { getEventCopy } from "../lib/eventTypes.ts";
import { formatEventDate } from "../lib/theme.ts";

type PreviewItem = {
  file: File;
  url: string;
};

const VIDEO_ACCEPT =
  "video/mp4,video/quicktime,video/webm,video/x-m4v,video/3gpp";

function formatMediaSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

export function GuestPage() {
  const { slug } = useParams();
  const { event, status } = useEvent(slug);

  const [guestName, setGuestName] = useState("");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
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

  useEffect(() => {
    if (!video) {
      setVideoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(video);
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

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

  function onVideoChange(fileList: FileList | null) {
    if (!fileList?.length) return;
    const file = fileList[0]!;
    try {
      validateGuestVideo(file);
      setVideo(file);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t use that video.");
    }
  }

  function removeVideo() {
    setVideo(null);
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
        video,
      });
      setPhotos([]);
      setVideo(null);
      setDone(true);
    } catch (err) {
      const fallback = event ? getEventCopy(event.eventType).submitErrorFallback : "Couldn’t send that message.";
      setError(err instanceof Error ? err.message : fallback);
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

  const copy = getEventCopy(event.eventType);
  const hasPhotos = photos.length > 0;
  const hasVideo = video !== null;

  if (done) {
    return (
      <Shell>
        <section className="narrow thanks">
          <p className="kicker">Sent</p>
          <h1>{copy.thankYouHeadline}</h1>
          <p className="lede">It should appear in the guestbook in a moment.</p>
          <div className="btn-row">
            <Link className="btn btn-primary" to={`/e/${slug}/guestbook`}>
              See the guestbook
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                setDone(false);
                setText("");
                setPhotos([]);
                setVideo(null);
              }}
            >
              {copy.leaveAnotherLabel}
            </Button>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="narrow guest">
        <p className="kicker">{formatEventDate(event.eventDate) || copy.guestKickerFallback}</p>
        <h1>{event.coupleNames}</h1>
        <p className="lede">
          {event.welcomeMessage || copy.defaultWelcomeMessage}
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
          <Field label={copy.messageFieldLabel}>
            <textarea
              maxLength={1000}
              rows={5}
              placeholder={copy.messageFieldPlaceholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>
          <p className="field-hint">Choose photos or one short video — not both.</p>
          <Field
            label="Photos"
            hint={
              hasVideo
                ? "Remove your video to add photos."
                : `Optional — up to ${MAX_PHOTOS}. We’ll shrink them before upload so venue wifi survives.`
            }
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              disabled={hasVideo || photos.length >= MAX_PHOTOS}
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
          <Field
            label="Video"
            hint={
              hasPhotos
                ? "Remove your photos to add a video."
                : "Optional — one short video under 10 MiB (MP4, MOV, WebM, M4V, or 3GP)."
            }
          >
            <input
              type="file"
              accept={VIDEO_ACCEPT}
              disabled={hasPhotos || hasVideo}
              onChange={(e) => {
                onVideoChange(e.target.files);
                e.target.value = "";
              }}
            />
          </Field>
          {video && videoPreviewUrl ? (
            <div className="video-preview-wrap">
              <video
                className="video-preview"
                src={videoPreviewUrl}
                controls
                playsInline
                preload="metadata"
              />
              <button
                className="photo-preview-remove"
                type="button"
                aria-label="Remove video"
                onClick={removeVideo}
              >
                ×
              </button>
              <p className="video-preview-meta">
                {video.name} · {formatMediaSize(video.size)}
              </p>
            </div>
          ) : null}
          {error ? <StatusNote tone="error">{error}</StatusNote> : null}
          <Button type="submit" disabled={busy}>
            {busy ? copy.submitBusyLabel : copy.submitButtonLabel}
          </Button>
        </form>
      </section>
    </Shell>
  );
}
