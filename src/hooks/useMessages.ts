import { useEffect, useState } from "react";
import { listenMessages } from "../lib/api.ts";
import type { MessageRecord } from "../lib/types.ts";

export function useMessages(slug: string | undefined, enabled = true) {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!slug || !enabled) return undefined;
    setError(null);
    const unsub = listenMessages(
      slug,
      (next) => {
        setMessages(next);
        setLive(true);
      },
      (message) => setError(message),
    );
    return () => unsub();
  }, [slug, enabled]);

  return { messages, error, live };
}
