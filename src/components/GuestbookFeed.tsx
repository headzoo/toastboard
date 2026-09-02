import { useState } from "react";
import { hideMessage } from "../lib/api";
import { formatEventDate } from "../lib/theme";
import type { MessageRecord } from "../lib/types";
import { PhotoGallery } from "./PhotoGallery";
import { VideoLightbox } from "./VideoLightbox";
import { VideoPlayer } from "./VideoPlayer";

export type ModerationCopy = {
  hideConfirmLabel: string;
  hideButtonLabel: string;
  hideErrorFallback: string;
};

type VideoStatusPlaceholderProps = {
  status: "processing" | "failed";
};

function VideoStatusPlaceholder({ status }: VideoStatusPlaceholderProps) {
  const processing = status === "processing";
  return (
    <div
      className={`toast-video-placeholder${processing ? " toast-video-placeholder-processing" : " toast-video-placeholder-failed"}`}
      role="status"
      aria-live={processing ? "polite" : undefined}
    >
      <p className="toast-video-placeholder-text">
        {processing ? "Video processing" : "Video couldn't be processed"}
      </p>
      {processing ? (
        <span className="toast-video-placeholder-spinner" aria-hidden="true" />
      ) : null}
    </div>
  );
}

type VideoCardProps = {
  url: string;
};

function VideoCard({ url }: VideoCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!url) return null;

  return (
    <>
      <div className="toast-video-frame">
        <VideoPlayer src={url} className="toast-video" />
        <button
          className="toast-video-expand"
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Expand video"
        >
          Expand
        </button>
      </div>
      {lightboxOpen ? (
        <VideoLightbox url={url} onClose={() => setLightboxOpen(false)} />
      ) : null}
    </>
  );
}

function MessageMedia({ message }: { message: MessageRecord }) {
  if (message.photoUrls.length > 0) {
    return <PhotoGallery urls={message.photoUrls} />;
  }

  const { videoStatus, videoUrl } = message;

  if (videoStatus === "processing") {
    return <VideoStatusPlaceholder status="processing" />;
  }

  if (videoStatus === "failed") {
    return <VideoStatusPlaceholder status="failed" />;
  }

  if (videoStatus === "ready" && videoUrl) {
    return <VideoCard url={videoUrl} />;
  }

  if (videoStatus === "ready" || videoStatus) {
    return <VideoStatusPlaceholder status="failed" />;
  }

  return null;
}

type MessageCardProps = {
  message: MessageRecord;
  hostToken?: string;
  slug?: string;
  moderation?: ModerationCopy;
  onHidden?: (id: string) => void;
};

export function MessageCard({ message, hostToken, slug, moderation, onHidden }: MessageCardProps) {
  async function onDelete() {
    if (!slug || !moderation) return;
    const ok = window.confirm(moderation.hideConfirmLabel);
    if (!ok) return;
    try {
      await hideMessage(slug, message.id, hostToken);
      onHidden?.(message.id);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : moderation.hideErrorFallback);
    }
  }

  return (
    <article className="toast-card">
      <MessageMedia message={message} />
      <div className="toast-body">
        {message.text ? <p className="toast-text">{message.text}</p> : null}
        <div className="toast-meta">
          <span>{message.guestName || "A guest"}</span>
          {message.createdAt ? <span>{formatEventDate(message.createdAt)}</span> : null}
        </div>
        {moderation ? (
          <button className="btn btn-danger btn-small" type="button" onClick={() => void onDelete()}>
            {moderation.hideButtonLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

type GuestbookFeedProps = {
  messages: MessageRecord[];
  hostToken?: string;
  slug?: string;
  emptyLabel: string;
  moderation?: ModerationCopy;
};

export function GuestbookFeed({ messages, hostToken, slug, emptyLabel, moderation }: GuestbookFeedProps) {
  if (messages.length === 0) {
    return (
      <div className="empty-guestbook">
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="guestbook-grid">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          hostToken={hostToken}
          slug={slug}
          moderation={moderation}
        />
      ))}
    </div>
  );
}
