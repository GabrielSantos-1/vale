/**
 * Proxy configuration for local development.
 * No sensitive values — safe for public repository.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decode as decodeNextAuthJwt, getToken } from 'next-auth/jwt';

import { getClientAuthCookieName } from '@/lib/auth/client-session';
import { isAdminRole } from '@/lib/auth/roles';
import { securityHeaders } from './lib/security/headers';
import { CSRF_COOKIE_NAME, generateCsrfToken } from './lib/security/csrf';

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error('Missing NEXTAUTH_SECRET/AUTH_SECRET for proxy');
}

function ensureAdminCsrfCookie(req: NextRequest, res: NextResponse) {
  const token = req.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (token) return;

  res.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: generateCsrfToken(),
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  });
}

function applyGlobalSecurityHeaders(req: NextRequest, res: NextResponse) {
  if (process.env.NODE_ENV !== 'development') {
    const headers = securityHeaders();

    for (const [key, value] of Object.entries(headers)) {
      res.headers.set(key, String(value));
    }
  }

  const isAdminSurface =
    req.nextUrl.pathname.startsWith('/admin') ||
    req.nextUrl.pathname.startsWith('/api/admin');

  if (isAdminSurface) {
    ensureAdminCsrfCookie(req, res);
  }

  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAuthRoute = pathname.startsWith('/api/auth');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  // Protect admin routes
  if (isAdminRoute && !isAdminLoginRoute) {
    const token = await getToken({
      req,
      secret: authSecret,
    });

    const role = (token as { role?: string } | null)?.role;

    if (!token || !isAdminRole(role)) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);

      return applyGlobalSecurityHeaders(req, NextResponse.redirect(loginUrl));
    }

    return applyGlobalSecurityHeaders(req, NextResponse.next());
  }

  // Protect client dashboard routes
  const isClientProtectedRoute =
    pathname.startsWith('/cliente/dashboard') ||
    pathname.startsWith('/cliente/perfil');
  const isClientApiRoute = pathname.startsWith('/api/client');
  const isClientLoginPage = pathname === '/cliente/login';
  const isClientRegisterPage = pathname === '/cliente/registro';
  const isClientAuthApi = pathname.startsWith('/api/client/auth');

  if (isClientProtectedRoute) {
    const clientCookieName = getClientAuthCookieName();
    const rawClientToken = req.cookies.get(clientCookieName)?.value;
    const clientToken = rawClientToken
      ? await decodeNextAuthJwt({
          token: rawClientToken,
          secret: authSecret as string,
        })
      : null;

    if (!clientToken?.sub) {
      const loginUrl = new URL('/cliente/login', req.url);
      loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
      return applyGlobalSecurityHeaders(req, NextResponse.redirect(loginUrl));
    }

    return applyGlobalSecurityHeaders(req, NextResponse.next());
  }

  // Skip non-protected client routes
  if (isClientRegisterPage || isClientLoginPage || isClientAuthApi) {
    return applyGlobalSecurityHeaders(req, NextResponse.next());
  }

  // Pass through public surfaces
  if (!isAdminRoute && !isClientProtectedRoute && !isClientApiRoute) {
    return applyGlobalSecurityHeaders(req, NextResponse.next());
  }

  return applyGlobalSecurityHeaders(req, NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
