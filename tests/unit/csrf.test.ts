import { describe, expect, it } from 'vitest';

import { CSRF_COOKIE_NAME, verifyCsrf } from '@/lib/security/csrf';

function buildRequest(init?: {
  origin?: string;
  referer?: string;
  cookie?: string;
  headerToken?: string;
}) {
  const headers = new Headers();

  if (init?.origin) headers.set('origin', init.origin);
  if (init?.referer) headers.set('referer', init.referer);
  if (init?.cookie) headers.set('cookie', init.cookie);
  if (init?.headerToken) headers.set('x-csrf-token', init.headerToken);

  return new Request('http://localhost/api/admin/status', {
    method: 'POST',
    headers,
  });
}

describe('verifyCsrf', () => {
  it('accepts valid same-origin token pair', () => {
    const token = 'token-123';
    const req = buildRequest({
      origin: 'http://localhost',
      cookie: `${CSRF_COOKIE_NAME}=${token}`,
      headerToken: token,
    });

    const result = verifyCsrf(req);
    expect(result.ok).toBe(true);
  });

  it('rejects missing origin and referer', () => {
    const token = 'token-123';
    const req = buildRequest({
      cookie: `${CSRF_COOKIE_NAME}=${token}`,
      headerToken: token,
    });

    const result = verifyCsrf(req);
    expect(result).toEqual({
      ok: false,
      reason: 'MISSING_ORIGIN',
    });
  });

  it('rejects token mismatch', () => {
    const req = buildRequest({
      origin: 'http://localhost',
      cookie: `${CSRF_COOKIE_NAME}=token-a`,
      headerToken: 'token-b',
    });

    const result = verifyCsrf(req);
    expect(result).toEqual({
      ok: false,
      reason: 'TOKEN_MISMATCH',
    });
  });
});
