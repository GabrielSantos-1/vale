import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { recordPublicApiRateLimited } from '@/lib/observability/audit';
import { logger } from '@/lib/security/logger';
import { fail } from '@/lib/security/response';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';

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
  const correlationId = getCorrelationId(req);

  const rl = await rateLimit({
    key: buildRateLimitKey('auth-login', req),
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.ok) {
    await recordPublicApiRateLimited({
      route: '/api/auth/[...nextauth]',
      correlationId,
    });

    logger.warn('Rate limit hit on auth route', {
      correlationId,
      route: '/api/auth/[...nextauth]',
      limit: rl.limit,
      remaining: rl.remaining,
      resetAt: rl.resetAt,
    });

    return withRequestMeta(
      fail('Muitas tentativas de login. Tente novamente mais tarde.', {
        status: 429,
        code: 'RATE_LIMITED',
        correlationId,
      }),
      { correlationId, rl },
    );
  }

  return nextAuthHandler(req, ctx);
}
