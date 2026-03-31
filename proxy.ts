import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { isAdminRole } from '@/lib/auth/roles';
import { securityHeaders } from './lib/security/headers';

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error('Missing NEXTAUTH_SECRET/AUTH_SECRET for proxy');
}

function applyGlobalSecurityHeaders(res: NextResponse) {
  if (process.env.NODE_ENV !== 'development') {
    const headers = securityHeaders();

    for (const [key, value] of Object.entries(headers)) {
      res.headers.set(key, String(value));
    }
  }

  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAuthRoute = pathname.startsWith('/api/auth');

  if (!isAdminRoute || isAdminLoginRoute || isAuthRoute) {
    return applyGlobalSecurityHeaders(NextResponse.next());
  }

  const token = await getToken({
    req,
    secret: authSecret,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const role = (token as { role?: string } | null)?.role;

  if (!token || !isAdminRole(role)) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);

    return applyGlobalSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applyGlobalSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
