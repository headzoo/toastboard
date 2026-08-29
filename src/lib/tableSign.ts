import {
  CREAM,
  INK,
  INK_SOFT,
  PAPER,
  fillTextSpaced,
  fitWrappedText,
  hexAlpha,
  loadImage,
  roundRect,
  waitForPrintFonts,
} from "./canvas.ts";
import { canvasToLetterPdf } from "./pdf.ts";
import { qrDataUrl } from "./urls.ts";

export type TableSignInput = {
  coupleNames: string;
  guestUrl: string;
  themeColor: string;
  eventDateLabel?: string | null;
  welcomeMessage?: string | null;
};

const LETTER_IN_W = 8.5;
const LETTER_IN_H = 11;

export async function renderTableSignCanvas(input: TableSignInput, preview = false) {
  await waitForPrintFonts();
  const dpi = preview ? 96 : 300;
  const width = Math.round(LETTER_IN_W * dpi);
  const height = Math.round(LETTER_IN_H * dpi);
  const pt = dpi / 72;
  const P = (n: number) => n * pt;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn’t draw the table sign.");

  const theme = input.themeColor;
  const cx = width / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);

  const wash = ctx.createRadialGradient(cx, 0, 0, cx, 0, P(420));
  wash.addColorStop(0, hexAlpha(theme, 0.2));
  wash.addColorStop(1, hexAlpha(theme, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  const gold = ctx.createRadialGradient(width, height, 0, width, height, P(360));
  gold.addColorStop(0, "rgba(176, 137, 79, 0.12)");
  gold.addColorStop(1, "rgba(176, 137, 79, 0)");
  ctx.fillStyle = gold;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = theme;
  ctx.lineWidth = P(2.4);
  roundRect(ctx, P(28), P(28), width - P(56), height - P(56), P(16));
  ctx.stroke();

  ctx.lineWidth = P(0.7);
  ctx.strokeStyle = hexAlpha(theme, 0.55);
  roundRect(ctx, P(38), P(38), width - P(76), height - P(76), P(11));
  ctx.stroke();

  const flourish = P(34);
  drawCornerFlourish(ctx, P(58), P(58), flourish, 0, theme);
  drawCornerFlourish(ctx, width - P(58), P(58), flourish, Math.PI / 2, theme);
  drawCornerFlourish(ctx, width - P(58), height - P(58), flourish, Math.PI, theme);
  drawCornerFlourish(ctx, P(58), height - P(58), flourish, -Math.PI / 2, theme);

  drawToastMark(ctx, cx, P(78), P(15), theme);

  ctx.fillStyle = theme;
  ctx.font = `700 ${P(10)}px "Figtree", sans-serif`;
  fillTextSpaced(ctx, "LEAVE A TOAST", cx, P(108), P(3.2));

  ctx.fillStyle = INK;
  let y = fitWrappedText(ctx, input.coupleNames, cx, P(168), width - P(120), 2, {
    maxSize: P(46),
    minSize: P(22),
    lineHeight: 1.12,
    font: (size) => `italic 400 ${size}px "Fraunces", serif`,
  });

  if (input.eventDateLabel) {
    ctx.fillStyle = INK_SOFT;
    ctx.font = `500 ${P(13)}px "Figtree", sans-serif`;
    ctx.fillText(input.eventDateLabel, cx, y + P(22));
    y += P(28);
  }

  if (input.welcomeMessage) {
    ctx.fillStyle = INK_SOFT;
    y = fitWrappedText(ctx, input.welcomeMessage, cx, y + P(22), width - P(140), 2, {
      maxSize: P(14),
      minSize: P(11),
      lineHeight: 1.28,
      font: (size) => `italic 400 ${size}px "Fraunces", serif`,
    });
  }

  y += P(22);
  drawDivider(ctx, cx, y, P(150), theme);
  y += P(20);

  const footerTop = height - P(52);
  const instructionBlock = P(86);
  const room = footerTop - y - instructionBlock;
  const qrSize = Math.max(P(168), Math.min(P(220), room - P(28)));
  const cardPad = P(14);
  const card = qrSize + cardPad * 2;
  const cardX = (width - card) / 2;
  const cardY = y;

  ctx.fillStyle = CREAM;
  roundRect(ctx, cardX, cardY, card, card, P(10));
  ctx.fill();
  ctx.strokeStyle = hexAlpha(theme, 0.28);
  ctx.lineWidth = P(0.8);
  ctx.stroke();

  const qr = await qrDataUrl(input.guestUrl, {
    width: preview ? 480 : 1200,
    errorCorrectionLevel: preview ? "M" : "H",
  });
  const qrImage = await loadImage(qr);
  ctx.drawImage(qrImage, cardX + cardPad, cardY + cardPad, qrSize, qrSize);

  y = cardY + card + P(28);
  ctx.fillStyle = INK;
  y = fitWrappedText(ctx, "Scan to leave a message and upload a photo.", cx, y, width - P(130), 2, {
    maxSize: P(16),
    minSize: P(13),
    lineHeight: 1.2,
    font: (size) => `500 ${size}px "Fraunces", serif`,
  });

  ctx.fillStyle = INK_SOFT;
  ctx.font = `400 ${P(11)}px "Figtree", sans-serif`;
  ctx.fillText("No app. No login. It appears on the wall.", cx, y + P(18));
  y += P(34);

  ctx.fillStyle = hexAlpha(INK_SOFT, 0.85);
  fitWrappedText(ctx, input.guestUrl, cx, y, width - P(140), 2, {
    maxSize: P(8.5),
    minSize: P(7),
    lineHeight: 1.25,
    font: (size) => `400 ${size}px "Figtree", sans-serif`,
  });

  drawToastMark(ctx, cx - P(52), height - P(56), P(8), theme);
  ctx.fillStyle = INK;
  ctx.font = `500 ${P(11)}px "Fraunces", serif`;
  ctx.fillText("Toastboard", cx + P(6), height - P(52));

  return canvas;
}

export async function renderTableSignPng(input: TableSignInput, preview = false) {
  const canvas = await renderTableSignCanvas(input, preview);
  return canvas.toDataURL("image/png");
}

export async function renderTableSignPdf(input: TableSignInput) {
  const canvas = await renderTableSignCanvas(input, false);
  return canvasToLetterPdf(canvas);
}

function drawToastMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 4);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.14);
  const half = size / 2;
  roundRect(ctx, -half, -half, size, size, [half, half, half, 0]);
  ctx.stroke();
  ctx.restore();
}

function drawDivider(ctx: CanvasRenderingContext2D, cx: number, y: number, half: number, color: string) {
  ctx.save();
  ctx.strokeStyle = hexAlpha(color, 0.7);
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, half * 0.012);
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - half * 0.12, y);
  ctx.moveTo(cx + half * 0.12, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
  ctx.translate(cx, y);
  ctx.rotate(Math.PI / 4);
  const d = half * 0.045;
  ctx.fillRect(-d, -d, d * 2, d * 2);
  ctx.restore();
}

function drawCornerFlourish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1.4, size * 0.045);

  ctx.beginPath();
  ctx.moveTo(0, size * 0.12);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.28, size * 0.52, -size * 0.22);
  ctx.quadraticCurveTo(size * 0.82, -size * 0.18, size * 0.96, -size * 0.48);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(size * 0.12, 0);
  ctx.quadraticCurveTo(-size * 0.28, size * 0.08, -size * 0.22, size * 0.52);
  ctx.quadraticCurveTo(-size * 0.18, size * 0.82, -size * 0.48, size * 0.96);
  ctx.stroke();

  ctx.lineWidth = Math.max(1.1, size * 0.035);
  drawLeaf(ctx, size * 0.38, -size * 0.08, size * 0.16, -0.7);
  drawLeaf(ctx, -size * 0.08, size * 0.38, size * 0.16, 0.9);
  ctx.restore();
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.55, -size * 0.45, size, 0);
  ctx.quadraticCurveTo(size * 0.55, size * 0.45, 0, 0);
  ctx.stroke();
  ctx.restore();
}
