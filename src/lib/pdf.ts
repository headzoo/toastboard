const PAGE_W = 612;
const PAGE_H = 792;

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function encode(text: string) {
  return new TextEncoder().encode(text);
}

function xrefEntry(offset: number, generation = 0, free = false) {
  return `${String(offset).padStart(10, "0")} ${String(generation).padStart(5, "0")} ${free ? "f" : "n"} \n`;
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function deflate(data: Uint8Array) {
  const stream = new Blob([toArrayBuffer(data)]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function canvasToRgb(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn’t read the table sign.");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rgb = new Uint8Array(canvas.width * canvas.height * 3);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
    rgb[j] = data[i] ?? 0;
    rgb[j + 1] = data[i + 1] ?? 0;
    rgb[j + 2] = data[i + 2] ?? 0;
  }
  return rgb;
}

export async function canvasToLetterPdf(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const rgb = await deflate(canvasToRgb(canvas));
  const content = `q\n${PAGE_W} 0 0 ${PAGE_H} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentBytes = encode(content);

  const chunks: Uint8Array[] = [encode("%PDF-1.4\n%\x80\x80\x80\x80\n")];
  const offsets = [0];

  function addObject(body: string, stream?: Uint8Array) {
    offsets.push(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
    const num = offsets.length - 1;
    if (stream) {
      chunks.push(encode(`${num} 0 obj\n${body}\nstream\n`));
      chunks.push(stream);
      chunks.push(encode("\nendstream\nendobj\n"));
      return;
    }
    chunks.push(encode(`${num} 0 obj\n${body}\nendobj\n`));
  }

  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObject(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>`,
  );
  addObject(`<< /Length ${contentBytes.length} >>`, contentBytes);
  addObject(
    `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${rgb.length} >>`,
    rgb,
  );

  const xrefOffset = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const xref = [
    "xref\n",
    `0 ${offsets.length}\n`,
    xrefEntry(0, 65535, true),
    ...offsets.slice(1).map((offset) => xrefEntry(offset)),
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\n`,
    `startxref\n${xrefOffset}\n`,
    "%%EOF\n",
  ].join("");
  chunks.push(encode(xref));
  return concatBytes(chunks);
}
