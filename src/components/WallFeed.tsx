import { hideMessage } from "../lib/api.ts";
import { formatEventDate } from "../lib/theme.ts";
import type { MessageRecord } from "../lib/types.ts";
import { btnClass } from "../lib/styles.ts";

type MessageCardProps = {
  message: MessageRecord;
  hostToken?: string;
  slug?: string;
  onHidden?: (id: string) => void;
};

export function MessageCard({ message, hostToken, slug, onHidden }: MessageCardProps) {
  async function onDelete() {
    if (!hostToken || !slug) return;
    const ok = window.confirm("Remove this toast from the wall?");
    if (!ok) return;
    try {
      await hideMessage(slug, message.id, hostToken);
      onHidden?.(message.id);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Couldn’t remove that toast.");
    }
  }

  return (
    <article className="mb-4 break-inside-avoid overflow-hidden rounded-[1.4rem] bg-cream shadow-soft">
      {message.photoUrl ? (
        <img className="block w-full" src={message.photoUrl} alt="" />
      ) : null}
      <div className="px-[1.1rem] pb-[1.15rem] pt-4">
        {message.text ? (
          <p className="font-serif text-[1.2rem] font-normal italic">{message.text}</p>
        ) : null}
        <div className="flex flex-wrap gap-2.5 text-[0.82rem] text-ink-soft">
          <span>{message.guestName || "A guest"}</span>
          {message.createdAt ? <span>{formatEventDate(message.createdAt)}</span> : null}
        </div>
        {hostToken ? (
          <button className={btnClass("danger", true)} type="button" onClick={() => void onDelete()}>
            Hide toast
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
};

export function WallFeed({ messages, hostToken, slug, emptyLabel }: WallFeedProps) {
  if (messages.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-ink-soft">
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 min-[700px]:columns-2 min-[1080px]:columns-3">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          hostToken={hostToken}
          slug={slug}
        />
      ))}
    </div>
  );
}
