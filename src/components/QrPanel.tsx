import { useEffect, useState } from "react";
import { copyText, downloadDataUrl, guestUrl, qrDataUrl } from "../lib/urls.ts";

type QrPanelProps = {
  slug: string;
  table?: string;
  caption?: string;
};

export function QrPanel({ slug, table, caption = "Guest QR code" }: QrPanelProps) {
  const [src, setSrc] = useState<string>("");
  const url = guestUrl(slug, table);

  useEffect(() => {
    let cancelled = false;
    qrDataUrl(url).then((next) => {
      if (!cancelled) setSrc(next);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, table, url]);

  return (
    <div className="qr-panel">
      {src ? <img src={src} alt={caption} /> : <div className="qr-skeleton" />}
      <div className="qr-actions">
        <button className="btn btn-ghost" type="button" onClick={() => void copyText(url)}>
          Copy guest link
        </button>
        {src ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => downloadDataUrl(src, table ? `${slug}-table-${table}.png` : `${slug}-guest-qr.png`)}
          >
            Download QR
          </button>
        ) : null}
      </div>
    </div>
  );
}
