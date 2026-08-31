import {
  fillTextSpaced,
  fitWrappedText,
  hexAlpha,
  loadImage,
  roundRect,
  waitForPrintFonts,
} from "./canvas.ts";
import { canvasToLetterPdf } from "./pdf.ts";
import { DEFAULT_SIGN_THEME, getSignTheme, type SignTheme, type SignThemeId } from "./signThemes.ts";
import { qrDataUrl } from "./urls.ts";

export type TableSignInput = {
  coupleNames: string;
  guestUrl: string;
  themeColor: string;
  themeId?: SignThemeId | string | null;
  eventDateLabel?: string | null;
  welcomeMessage?: string | null;
  signKicker: string;
  signScanInstruction: string;
  signTagline: string;
};

type DrawCtx = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  cx: number;
  P: (n: number) => number;
  accent: string;
  palette: SignTheme;
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

  const palette = getSignTheme(input.themeId ?? DEFAULT_SIGN_THEME);
  const accent = input.themeColor;
  const cx = width / 2;
  const d: DrawCtx = { ctx, width, height, cx, P, accent, palette };

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  drawBackground(d);
  drawFrame(d);
  drawCorners(d);

  drawToastMark(ctx, cx, P(78), P(15), accent);

  const kickerTracking = palette.id === "art-deco" ? P(5.5) : P(3.2);
  ctx.fillStyle = accent;
  ctx.font = `700 ${P(10)}px "Figtree", sans-serif`;
  fillTextSpaced(ctx, input.signKicker, cx, P(108), kickerTracking);

  const nameFont =
    palette.id === "modern"
      ? (size: number) => `500 ${size}px "Figtree", sans-serif`
      : (size: number) => `italic 400 ${size}px "Fraunces", serif`;

  ctx.fillStyle = palette.ink;
  let y = fitWrappedText(ctx, input.coupleNames, cx, P(168), width - P(120), 2, {
    maxSize: P(46),
    minSize: P(22),
    lineHeight: 1.12,
    font: nameFont,
  });

  if (input.eventDateLabel) {
    ctx.fillStyle = palette.inkSoft;
    ctx.font = `500 ${P(13)}px "Figtree", sans-serif`;
    ctx.fillText(input.eventDateLabel, cx, y + P(22));
    y += P(28);
  }

  if (input.welcomeMessage) {
    ctx.fillStyle = palette.inkSoft;
    y = fitWrappedText(ctx, input.welcomeMessage, cx, y + P(22), width - P(140), 2, {
      maxSize: P(14),
      minSize: P(11),
      lineHeight: 1.28,
      font: (size) =>
        palette.id === "modern"
          ? `400 ${size}px "Figtree", sans-serif`
          : `italic 400 ${size}px "Fraunces", serif`,
    });
  }

  y += P(22);
  drawThemeDivider(d, y);
  y += P(20);

  const footerTop = height - P(52);
  const instructionBlock = P(86);
  const room = footerTop - y - instructionBlock;
  const qrSize = Math.max(P(168), Math.min(P(220), room - P(28)));
  const cardPad = P(14);
  const card = qrSize + cardPad * 2;
  const cardX = (width - card) / 2;
  const cardY = y;

  if (palette.id === "art-deco") {
    drawSunburst(d, cardX + card / 2, cardY + card / 2, card * 0.72);
  }

  ctx.fillStyle = palette.cream;
  const qrRadius = palette.id === "modern" ? P(2) : palette.id === "coastal" ? card / 2 : P(10);
  if (palette.id === "coastal") {
    ctx.beginPath();
    ctx.arc(cardX + card / 2, cardY + card / 2, card / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexAlpha(accent, 0.35);
    ctx.lineWidth = P(0.8);
    ctx.stroke();
  } else {
    roundRect(ctx, cardX, cardY, card, card, qrRadius);
    ctx.fill();
    ctx.strokeStyle = hexAlpha(accent, 0.28);
    ctx.lineWidth = P(0.8);
    ctx.stroke();
  }

  const qr = await qrDataUrl(input.guestUrl, {
    width: preview ? 480 : 1200,
    errorCorrectionLevel: preview ? "M" : "H",
  });
  const qrImage = await loadImage(qr);
  ctx.drawImage(qrImage, cardX + cardPad, cardY + cardPad, qrSize, qrSize);

  y = cardY + card + P(28);
  ctx.fillStyle = palette.ink;
  y = fitWrappedText(ctx, input.signScanInstruction, cx, y, width - P(130), 2, {
    maxSize: P(16),
    minSize: P(13),
    lineHeight: 1.2,
    font: (size) =>
      palette.id === "modern"
        ? `500 ${size}px "Figtree", sans-serif`
        : `500 ${size}px "Fraunces", serif`,
  });

  ctx.fillStyle = palette.inkSoft;
  ctx.font = `400 ${P(11)}px "Figtree", sans-serif`;
  ctx.fillText(input.signTagline, cx, y + P(18));
  y += P(34);

  ctx.fillStyle = hexAlpha(palette.inkSoft, 0.85);
  fitWrappedText(ctx, input.guestUrl, cx, y, width - P(140), 2, {
    maxSize: P(8.5),
    minSize: P(7),
    lineHeight: 1.25,
    font: (size) => `400 ${size}px "Figtree", sans-serif`,
  });

  drawToastMark(ctx, cx - P(52), height - P(56), P(8), accent);
  ctx.fillStyle = palette.ink;
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

function drawBackground({ ctx, width, height, cx, P, accent, palette }: DrawCtx) {
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, width, height);

  if (palette.id === "midnight") {
    const wash = ctx.createRadialGradient(cx, 0, 0, cx, 0, P(480));
    wash.addColorStop(0, hexAlpha(accent, 0.22));
    wash.addColorStop(1, hexAlpha(accent, 0));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (palette.id === "coastal") {
    const wash = ctx.createRadialGradient(cx, height * 0.15, 0, cx, height * 0.15, P(500));
    wash.addColorStop(0, hexAlpha(accent, 0.12));
    wash.addColorStop(1, hexAlpha(accent, 0));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (palette.id === "modern") {
    return;
  }

  const wash = ctx.createRadialGradient(cx, 0, 0, cx, 0, P(420));
  wash.addColorStop(0, hexAlpha(accent, palette.id === "botanical" ? 0.14 : 0.2));
  wash.addColorStop(1, hexAlpha(accent, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  if (palette.id === "classic" || palette.id === "art-deco") {
    const gold = ctx.createRadialGradient(width, height, 0, width, height, P(360));
    gold.addColorStop(0, "rgba(176, 137, 79, 0.12)");
    gold.addColorStop(1, "rgba(176, 137, 79, 0)");
    ctx.fillStyle = gold;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawFrame({ ctx, width, height, P, accent, palette }: DrawCtx) {
  switch (palette.id) {
    case "modern": {
      ctx.strokeStyle = accent;
      ctx.lineWidth = P(1.1);
      ctx.strokeRect(P(36), P(36), width - P(72), height - P(72));
      ctx.lineWidth = P(0.45);
      ctx.strokeStyle = hexAlpha(accent, 0.45);
      ctx.strokeRect(P(44), P(44), width - P(88), height - P(88));
      break;
    }
    case "art-deco": {
      ctx.strokeStyle = accent;
      ctx.lineWidth = P(2.2);
      roundRect(ctx, P(28), P(28), width - P(56), height - P(56), P(4));
      ctx.stroke();
      ctx.lineWidth = P(0.7);
      ctx.strokeStyle = hexAlpha(accent, 0.5);
      roundRect(ctx, P(40), P(40), width - P(80), height - P(80), P(2));
      ctx.stroke();
      break;
    }
    case "coastal": {
      ctx.strokeStyle = accent;
      ctx.lineWidth = P(2);
      ellipsePath(ctx, width / 2, height / 2, (width - P(56)) / 2, (height - P(56)) / 2);
      ctx.stroke();
      ctx.lineWidth = P(0.65);
      ctx.strokeStyle = hexAlpha(accent, 0.5);
      ellipsePath(ctx, width / 2, height / 2, (width - P(80)) / 2, (height - P(80)) / 2);
      ctx.stroke();
      break;
    }
    case "midnight": {
      ctx.strokeStyle = accent;
      ctx.lineWidth = P(1.2);
      roundRect(ctx, P(28), P(28), width - P(56), height - P(56), P(16));
      ctx.stroke();
      ctx.lineWidth = P(0.5);
      ctx.strokeStyle = hexAlpha(accent, 0.45);
      roundRect(ctx, P(38), P(38), width - P(76), height - P(76), P(11));
      ctx.stroke();
      break;
    }
    case "botanical": {
      ctx.strokeStyle = hexAlpha(accent, 0.75);
      ctx.lineWidth = P(1.6);
      roundRect(ctx, P(30), P(30), width - P(60), height - P(60), P(22));
      ctx.stroke();
      ctx.lineWidth = P(0.6);
      ctx.strokeStyle = hexAlpha(accent, 0.4);
      roundRect(ctx, P(42), P(42), width - P(84), height - P(84), P(16));
      ctx.stroke();
      break;
    }
    default: {
      ctx.strokeStyle = accent;
      ctx.lineWidth = P(2.4);
      roundRect(ctx, P(28), P(28), width - P(56), height - P(56), P(16));
      ctx.stroke();
      ctx.lineWidth = P(0.7);
      ctx.strokeStyle = hexAlpha(accent, 0.55);
      roundRect(ctx, P(38), P(38), width - P(76), height - P(76), P(11));
      ctx.stroke();
    }
  }
}

function drawCorners({ ctx, width, height, P, accent, palette }: DrawCtx) {
  const size = P(34);
  const inset = P(58);
  const corners: [number, number, number][] = [
    [inset, inset, 0],
    [width - inset, inset, Math.PI / 2],
    [width - inset, height - inset, Math.PI],
    [inset, height - inset, -Math.PI / 2],
  ];

  switch (palette.id) {
    case "modern":
      return;
    case "botanical":
      for (const [x, y, rot] of corners) drawVineCorner(ctx, x, y, size * 1.15, rot, accent);
      return;
    case "art-deco":
      for (const [x, y, rot] of corners) drawSteppedCorner(ctx, x, y, size * 0.95, rot, accent);
      return;
    case "coastal":
      for (const [x, y, rot] of corners) drawWaveCorner(ctx, x, y, size, rot, accent);
      return;
    case "midnight":
      for (const [x, y, rot] of corners) drawCornerFlourish(ctx, x, y, size * 0.85, rot, accent);
      return;
    default:
      for (const [x, y, rot] of corners) drawCornerFlourish(ctx, x, y, size, rot, accent);
  }
}

function drawThemeDivider({ ctx, cx, P, accent, palette }: DrawCtx, y: number) {
  const half = P(150);
  switch (palette.id) {
    case "botanical":
      drawLeafDivider(ctx, cx, y, half, accent);
      break;
    case "modern":
      drawModernDivider(ctx, cx, y, half, accent);
      break;
    case "art-deco":
      drawChevronDivider(ctx, cx, y, half, accent);
      break;
    case "coastal":
      drawWaveDivider(ctx, cx, y, half, accent);
      break;
    default:
      drawDivider(ctx, cx, y, half, accent);
  }
}

function ellipsePath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function drawSunburst(
  { ctx, accent }: DrawCtx,
  cx: number,
  cy: number,
  radius: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = hexAlpha(accent, 0.18);
  ctx.lineWidth = Math.max(1, radius * 0.008);
  const rays = 24;
  for (let i = 0; i < rays; i += 1) {
    const angle = (i / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * radius * 0.35, Math.sin(angle) * radius * 0.35);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.stroke();
  }
  ctx.restore();
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

function drawModernDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  half: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = hexAlpha(color, 0.55);
  ctx.lineWidth = Math.max(1, half * 0.01);
  ctx.beginPath();
  ctx.moveTo(cx - half * 0.55, y);
  ctx.lineTo(cx + half * 0.55, y);
  ctx.stroke();
  ctx.restore();
}

function drawLeafDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  half: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = hexAlpha(color, 0.65);
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, half * 0.012);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - half * 0.18, y);
  ctx.moveTo(cx + half * 0.18, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
  drawLeaf(ctx, cx - half * 0.06, y, half * 0.1, -0.4);
  drawLeaf(ctx, cx + half * 0.06, y, half * 0.1, Math.PI + 0.4);
  ctx.restore();
}

function drawChevronDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  half: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = hexAlpha(color, 0.7);
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, half * 0.012);
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - half * 0.2, y);
  ctx.moveTo(cx + half * 0.2, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
  const s = half * 0.06;
  ctx.beginPath();
  ctx.moveTo(cx - s, y);
  ctx.lineTo(cx, y - s * 0.85);
  ctx.lineTo(cx + s, y);
  ctx.lineTo(cx, y + s * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWaveDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  half: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = hexAlpha(color, 0.65);
  ctx.lineWidth = Math.max(1.2, half * 0.014);
  ctx.lineCap = "round";
  ctx.beginPath();
  const amp = half * 0.06;
  const start = cx - half * 0.7;
  const end = cx + half * 0.7;
  ctx.moveTo(start, y);
  const segs = 6;
  for (let i = 0; i < segs; i += 1) {
    const x0 = start + ((end - start) * i) / segs;
    const x1 = start + ((end - start) * (i + 1)) / segs;
    const mid = (x0 + x1) / 2;
    const dir = i % 2 === 0 ? -1 : 1;
    ctx.quadraticCurveTo(mid, y + amp * dir, x1, y);
  }
  ctx.stroke();
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

function drawVineCorner(
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
  ctx.lineWidth = Math.max(1.3, size * 0.04);

  ctx.beginPath();
  ctx.moveTo(0, size * 0.05);
  ctx.bezierCurveTo(size * 0.15, -size * 0.35, size * 0.55, -size * 0.15, size * 0.9, -size * 0.55);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(size * 0.05, 0);
  ctx.bezierCurveTo(-size * 0.35, size * 0.15, -size * 0.15, size * 0.55, -size * 0.55, size * 0.9);
  ctx.stroke();

  ctx.lineWidth = Math.max(1, size * 0.032);
  drawLeaf(ctx, size * 0.28, -size * 0.12, size * 0.18, -0.9);
  drawLeaf(ctx, size * 0.55, -size * 0.28, size * 0.14, -0.3);
  drawLeaf(ctx, -size * 0.12, size * 0.28, size * 0.18, 1.0);
  drawLeaf(ctx, -size * 0.28, size * 0.55, size * 0.14, 0.4);
  ctx.restore();
}

function drawSteppedCorner(
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
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.lineWidth = Math.max(1.5, size * 0.05);

  const steps = 3;
  const step = size / steps;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 0; i < steps; i += 1) {
    ctx.lineTo(step * (i + 1), -step * i);
    ctx.lineTo(step * (i + 1), -step * (i + 1));
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 0; i < steps; i += 1) {
    ctx.lineTo(-step * i, step * (i + 1));
    ctx.lineTo(-step * (i + 1), step * (i + 1));
  }
  ctx.stroke();
  ctx.restore();
}

function drawWaveCorner(
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
  ctx.lineWidth = Math.max(1.3, size * 0.04);

  ctx.beginPath();
  ctx.moveTo(0, size * 0.15);
  ctx.quadraticCurveTo(size * 0.25, -size * 0.2, size * 0.55, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.8, size * 0.08, size * 0.95, -size * 0.35);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(size * 0.15, 0);
  ctx.quadraticCurveTo(-size * 0.2, size * 0.25, -size * 0.05, size * 0.55);
  ctx.quadraticCurveTo(size * 0.08, size * 0.8, -size * 0.35, size * 0.95);
  ctx.stroke();
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
