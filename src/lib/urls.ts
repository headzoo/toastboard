import QRCode from 'qrcode';

export async function qrDataUrl(
  value: string,
  options?: { width?: number; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' },
): Promise<string> {
  return QRCode.toDataURL(value, {
    width: options?.width ?? 720,
    margin: 2,
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
    color: { dark: '#2A2118', light: '#FFFCF7' },
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function downloadBytes(
  bytes: Uint8Array,
  filename: string,
  type: string,
) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

/** Save a remote or data-URL image. Falls back to opening a new tab if fetch fails. */
export async function downloadRemoteUrl(
  url: string,
  filename: string,
): Promise<void> {
  if (url.startsWith('data:')) {
    downloadDataUrl(url, filename);
    return;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed (${response.status})`);
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function guestUrl(slug: string) {
  return new URL(`/e/${slug}`, window.location.origin).toString();
}

export function guestbookUrl(slug: string) {
  return new URL(`/e/${slug}/guestbook`, window.location.origin).toString();
}

export function manageUrl(slug: string, token: string) {
  const url = new URL(`/e/${slug}/manage`, window.location.origin);
  url.searchParams.set('token', token);
  return url.toString();
}
