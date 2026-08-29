export const PAPER = "#F7F0E6";
export const CREAM = "#FFFCF7";
export const INK = "#2A2118";
export const INK_SOFT = "#5C5146";

export async function waitForPrintFonts() {
  if (!document.fonts) return;
  await document.fonts.ready;
  await Promise.all([
    document.fonts.load('400 64px "Fraunces"'),
    document.fonts.load('italic 400 64px "Fraunces"'),
    document.fonts.load('500 42px "Fraunces"'),
    document.fonts.load('600 42px "Fraunces"'),
    document.fonts.load('400 24px "Figtree"'),
    document.fonts.load('500 24px "Figtree"'),
    document.fonts.load('600 24px "Figtree"'),
    document.fonts.load('700 24px "Figtree"'),
  ]);
}

export function hexAlpha(hex: string, alpha: number) {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return `rgba(196, 92, 103, ${alpha})`;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | [number, number, number, number],
) {
  const [tl, tr, br, bl] = typeof r === "number" ? [r, r, r, r] : r;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.arcTo(x + w, y, x + w, y + h, tr);
  ctx.arcTo(x + w, y + h, x, y + h, br);
  ctx.arcTo(x, y + h, x, y, bl);
  ctx.arcTo(x, y, x + w, y, tl);
  ctx.closePath();
}

export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function fitWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxLines: number,
  opts: {
    maxSize: number;
    minSize: number;
    lineHeight: number;
    font: (size: number) => string;
  },
) {
  if (!text.trim()) return y;
  let size = opts.maxSize;
  let lines: string[] = [];
  while (size >= opts.minSize) {
    ctx.font = opts.font(size);
    lines = wrapLines(ctx, text, maxWidth);
    const overflow = lines.some((line) => ctx.measureText(line).width > maxWidth);
    if (lines.length <= maxLines && !overflow) break;
    size -= 1;
  }
  ctx.font = opts.font(size);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1] ?? "";
    while (last && ctx.measureText(`${last}\u2026`).width > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[maxLines - 1] = last ? `${last}\u2026` : "\u2026";
  }
  const lh = size * opts.lineHeight;
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], x, y + i * lh);
  }
  return y + Math.max(0, lines.length - 1) * lh + size * 0.22;
}

export function fillTextSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  const chars = [...text];
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + tracking * Math.max(0, chars.length - 1);
  let cursor = x - total / 2;
  const previous = ctx.textAlign;
  ctx.textAlign = "left";
  for (let i = 0; i < chars.length; i += 1) {
    ctx.fillText(chars[i], cursor, y);
    cursor += widths[i] + tracking;
  }
  ctx.textAlign = previous;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Couldn’t load QR image."));
    image.src = src;
  });
}
