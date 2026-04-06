import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/security/csrf';

function readCookieValue(name: string) {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie ? document.cookie.split(';') : [];
  const prefix = `${name}=`;

  for (const cookie of cookies) {
    const entry = cookie.trim();
    if (!entry.startsWith(prefix)) continue;

    return decodeURIComponent(entry.slice(prefix.length));
  }

  return null;
}

export function createAdminMutationHeaders(baseHeaders?: HeadersInit) {
  const headers = new Headers(baseHeaders);
  const token = readCookieValue(CSRF_COOKIE_NAME);

  if (token) {
    headers.set(CSRF_HEADER_NAME, token);
  }

  return headers;
}
