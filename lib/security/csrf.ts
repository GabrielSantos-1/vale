import { randomUUID } from 'crypto';

export const CSRF_COOKIE_NAME = 'vv_csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

type CsrfValidationResult =
  | {
      ok: true;
      token: string;
    }
  | {
      ok: false;
      reason:
        | 'MISSING_ORIGIN'
        | 'INVALID_ORIGIN'
        | 'MISSING_COOKIE_TOKEN'
        | 'MISSING_HEADER_TOKEN'
        | 'TOKEN_MISMATCH';
    };

function safeUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function resolveAllowedOrigins(req: Request) {
  const reqUrl = safeUrl(req.url);
  const reqOrigin = reqUrl?.origin;
  const nextAuthOrigin = safeUrl(process.env.NEXTAUTH_URL)?.origin;

  return new Set(
    [reqOrigin, nextAuthOrigin].filter(
      (origin): origin is string => typeof origin === 'string' && origin.length > 0,
    ),
  );
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return new Map<string, string>();

  const items = cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const map = new Map<string, string>();

  for (const item of items) {
    const separator = item.indexOf('=');
    if (separator <= 0) continue;

    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();

    if (!key) continue;
    map.set(key, decodeURIComponent(value));
  }

  return map;
}

function extractOriginFromReferer(referer: string | null) {
  const refererUrl = safeUrl(referer);
  return refererUrl?.origin ?? null;
}

function isValidRequestOrigin(req: Request) {
  const allowedOrigins = resolveAllowedOrigins(req);
  if (allowedOrigins.size === 0) {
    return false;
  }

  const origin = req.headers.get('origin');
  if (origin) {
    return allowedOrigins.has(origin);
  }

  const refererOrigin = extractOriginFromReferer(req.headers.get('referer'));
  if (refererOrigin) {
    return allowedOrigins.has(refererOrigin);
  }

  return false;
}

export function generateCsrfToken() {
  return randomUUID();
}

export function readCsrfTokenFromRequest(req: Request) {
  const cookies = parseCookieHeader(req.headers.get('cookie'));
  return cookies.get(CSRF_COOKIE_NAME) ?? null;
}

export function verifyCsrf(req: Request): CsrfValidationResult {
  if (!req.url) {
    return { ok: false, reason: 'MISSING_ORIGIN' };
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  if (!origin && !referer) {
    return { ok: false, reason: 'MISSING_ORIGIN' };
  }

  if (!isValidRequestOrigin(req)) {
    return { ok: false, reason: 'INVALID_ORIGIN' };
  }

  const cookieToken = readCsrfTokenFromRequest(req);
  if (!cookieToken) {
    return { ok: false, reason: 'MISSING_COOKIE_TOKEN' };
  }

  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    return { ok: false, reason: 'MISSING_HEADER_TOKEN' };
  }

  if (cookieToken !== headerToken) {
    return { ok: false, reason: 'TOKEN_MISMATCH' };
  }

  return { ok: true, token: cookieToken };
}
