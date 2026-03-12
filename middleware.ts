import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { securityHeaders } from './lib/security/headers'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const headers = securityHeaders()
  Object.entries(headers).forEach(([key, value]) => res.headers.set(key, String(value)))
  return res
}

export const config = {
  matcher: '/(.*)'
}

