export type EventRoute =
  | { kind: 'guest'; slug: string }
  | { kind: 'guestbook'; slug: string }
  | { kind: 'manage'; slug: string; token: string }
  | { kind: 'invalid' };

export function parseEventPathname(pathname: string): EventRoute {
  const normalized = pathname.replace(/\/$/, '');
  const segments = normalized.split('/').filter(Boolean);
  if (segments[0] !== 'e' || !segments[1]) return { kind: 'invalid' };
  const slug = segments[1];
  const tail = segments[2];
  if (!tail) return { kind: 'guest', slug };
  if (tail === 'guestbook' && segments.length === 3)
    return { kind: 'guestbook', slug };
  if (tail === 'manage' && segments.length === 3) {
    const token =
      typeof window !== 'undefined'
        ? (new URLSearchParams(window.location.search).get('token') ?? '')
        : '';
    return { kind: 'manage', slug, token };
  }
  return { kind: 'invalid' };
}

export function eventGuestPath(slug: string): string {
  return `/e/${slug}/`;
}

export function eventGuestbookPath(slug: string): string {
  return `/e/${slug}/guestbook/`;
}

export function eventManagePath(slug: string, token?: string): string {
  if (token) {
    const params = new URLSearchParams({ token });
    return `/e/${slug}/manage/?${params.toString()}`;
  }
  return `/e/${slug}/manage/`;
}

export function pathsMatch(pathname: string, target: string): boolean {
  const normalize = (value: string) => value.replace(/\/$/, '') || '/';
  return normalize(pathname) === normalize(target);
}
