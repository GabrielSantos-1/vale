import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { securityHeaders } from './lib/security/headers';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  if (process.env.NODE_ENV !== 'development') {
    const headers = securityHeaders();

    for (const [key, value] of Object.entries(headers)) {
      res.headers.set(key, String(value));
    }
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAuthRoute = pathname.startsWith('/api/auth');

  if (!isAdminRoute || isAdminLoginRoute || isAuthRoute) {
    return res;
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = String(
    (token as { role?: string } | null)?.role || '',
  ).toLowerCase();

  if (!token || role !== 'admin') {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
