import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth/auth-options';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';

const nextAuthHandler = NextAuth(authOptions);

type RouteContext = {
  params: Promise<{
    nextauth: string[];
  }>;
};

export async function GET(req: NextRequest, ctx: RouteContext) {
  return nextAuthHandler(req, ctx);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const rl = rateLimit({
    key: buildRateLimitKey('auth-login', req),
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.ok) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Muitas tentativas de login. Tente novamente mais tarde.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rl.retryAfter),
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
        },
      },
    );
  }

  return nextAuthHandler(req, ctx);
}
