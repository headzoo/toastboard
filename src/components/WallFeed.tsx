import { hideMessage } from "../lib/api.ts";
import { formatEventDate } from "../lib/theme.ts";
import type { MessageRecord } from "../lib/types.ts";
import { PhotoGallery } from "./PhotoGallery.tsx";

export type ModerationCopy = {
  hideConfirmLabel: string;
  hideButtonLabel: string;
  hideErrorFallback: string;
};

type MessageCardProps = {
  message: MessageRecord;
  hostToken?: string;
  slug?: string;
  moderation?: ModerationCopy;
  onHidden?: (id: string) => void;
};

export function MessageCard({ message, hostToken, slug, moderation, onHidden }: MessageCardProps) {
  async function onDelete() {
    if (!hostToken || !slug || !moderation) return;
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
      <PhotoGallery urls={message.photoUrls} />
      <div className="toast-body">
        {message.text ? <p className="toast-text">{message.text}</p> : null}
        <div className="toast-meta">
          <span>{message.guestName || "A guest"}</span>
          {message.createdAt ? <span>{formatEventDate(message.createdAt)}</span> : null}
        </div>
        {hostToken && moderation ? (
          <button className="btn btn-danger btn-small" type="button" onClick={() => void onDelete()}>
            {moderation.hideButtonLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

type WallFeedProps = {
  messages: MessageRecord[];
  hostToken?: string;
  slug?: string;
  emptyLabel: string;
  moderation?: ModerationCopy;
};

export function WallFeed({ messages, hostToken, slug, emptyLabel, moderation }: WallFeedProps) {
  if (messages.length === 0) {
    return (
      <div className="empty-wall">
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="wall-grid">
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
