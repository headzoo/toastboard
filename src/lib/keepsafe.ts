import { getSignTheme } from "./signThemes.ts";
import { qrDataUrl } from "./urls.ts";

type KeepsafeInput = {
  coupleNames: string;
  guestUrl: string;
  manageUrl: string;
  themeColor: string;
  themeId?: string | null;
};

export async function renderKeepsafePng(input: KeepsafeInput): Promise<string> {
  const qr = await qrDataUrl(input.guestUrl);
  const width = 1080;
  const height = 1480;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn’t draw the keepsafe card.");

  const palette = getSignTheme(input.themeId);

  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = input.themeColor;
  ctx.lineWidth = 18;
  roundRect(ctx, 48, 48, width - 96, height - 96, 48);
  ctx.stroke();

  ctx.fillStyle = palette.ink;
  ctx.font = "600 42px 'Fraunces', serif";
  ctx.textAlign = "center";
  ctx.fillText("Wishing Wall", width / 2, 160);

  ctx.font = "italic 300 72px 'Fraunces', serif";
  wrapText(ctx, input.coupleNames, width / 2, 270, width - 200, 82);

  ctx.font = "600 28px 'Figtree', sans-serif";
  ctx.fillStyle = input.themeColor;
  ctx.fillText("SAVE THIS LINK — IT CANNOT BE RECOVERED", width / 2, 430);

  const qrImage = await loadImage(qr);
  const qrSize = 520;
  ctx.drawImage(qrImage, (width - qrSize) / 2, 480, qrSize, qrSize);

  ctx.fillStyle = palette.inkSoft;
  ctx.font = "500 24px 'Figtree', sans-serif";
  ctx.fillText("Guest QR", width / 2, 1040);

  ctx.fillStyle = palette.ink;
  ctx.font = "600 26px 'Figtree', sans-serif";
  ctx.fillText("Private host link", width / 2, 1110);

  ctx.font = "400 22px 'Figtree', sans-serif";
  wrapText(ctx, input.manageUrl, width / 2, 1160, width - 180, 34);

  ctx.fillStyle = palette.inkSoft;
  ctx.font = "400 22px 'Figtree', sans-serif";
  ctx.fillText("Guest page", width / 2, 1336);
  wrapText(ctx, input.guestUrl, width / 2, 1374, width - 180, 32);

  return canvas.toDataURL("image/png");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let cursor = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, cursor);
      line = word;
      cursor += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, cursor);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Couldn’t load QR image."));
    image.src = src;
  });
}
