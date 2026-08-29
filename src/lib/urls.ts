import QRCode from "qrcode";

export async function qrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    width: 720,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#2A2118", light: "#FFFCF7" },
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
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

export function wallUrl(slug: string) {
  return new URL(`/e/${slug}/wall`, window.location.origin).toString();
}

export function manageUrl(slug: string, token: string) {
  const url = new URL(`/e/${slug}/manage`, window.location.origin);
  url.searchParams.set("token", token);
  return url.toString();
}
