export async function sha256Hex(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function randomToken(bytes = 32): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return base64Url(buffer);
}

export function randomSuffix(length = 10): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => alphabet[byte % alphabet.length]).join(
    '',
  );
}

function base64Url(buffer: Uint8Array): string {
  let binary = '';
  buffer.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function slugifyNames(names: string): string {
  const cleaned = names
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return cleaned || 'guestbook';
}

export function makeEventSlug(names: string): string {
  return `${slugifyNames(names)}-${randomSuffix(10)}`;
}

export function sanitizeText(input: string, max: number): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}
