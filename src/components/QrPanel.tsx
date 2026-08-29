import { useEffect, useState } from "react";
import { copyText, downloadDataUrl, guestUrl, qrDataUrl } from "../lib/urls.ts";
import { btnClass } from "../lib/styles.ts";

type QrPanelProps = {
  slug: string;
  caption?: string;
};

export function QrPanel({ slug, caption = "Guest QR code" }: QrPanelProps) {
  const [src, setSrc] = useState<string>("");
  const url = guestUrl(slug);

  useEffect(() => {
    let cancelled = false;
    qrDataUrl(url).then((next) => {
      if (!cancelled) setSrc(next);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, url]);

  return (
    <div className="my-6 w-full max-w-64">
      {src ? (
        <img className="block w-full rounded-2xl" src={src} alt={caption} />
      ) : (
        <div className="aspect-square rounded-2xl bg-paper-2" />
      )}
      <div className="mt-3 flex gap-3 print:hidden">
        <button className={btnClass("ghost")} type="button" onClick={() => void copyText(url)}>
          Copy guest link
        </button>
        {src ? (
          <button
            className={btnClass("ghost")}
            type="button"
            onClick={() => downloadDataUrl(src, `${slug}-guest-qr.png`)}
          >
            Download QR
          </button>
        ) : null}
      </div>
    </div>
  );
}
