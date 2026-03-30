type RateLimitMeta = {
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
};

type SecurityHeadersOptions = {
  correlationId: string;
  rateLimitMeta?: RateLimitMeta;
  csp?: string;
};

const DEFAULT_CSP =
  "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

export function getCorrelationId(req: Request): string {
  return (
    req.headers.get('x-correlation-id') ||
    req.headers.get('x-request-id') ||
    crypto.randomUUID()
  );
}

export function applySecurityHeaders(
  response: Response,
  options: SecurityHeadersOptions,
): Response {
  const { correlationId, rateLimitMeta, csp = DEFAULT_CSP } = options;

  response.headers.set('X-Correlation-Id', correlationId);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set('Content-Security-Policy', csp);

  if (rateLimitMeta) {
    response.headers.set('X-RateLimit-Limit', String(rateLimitMeta.limit));
    response.headers.set(
      'X-RateLimit-Remaining',
      String(rateLimitMeta.remaining),
    );
    response.headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil(rateLimitMeta.resetAt / 1000)),
    );

    if (typeof rateLimitMeta.retryAfter === 'number') {
      response.headers.set('Retry-After', String(rateLimitMeta.retryAfter));
    }
  }

  return response;
}

export function toRateLimitMeta(
  rl?: {
    limit: number;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
  } | null,
): RateLimitMeta | undefined {
  if (!rl) return undefined;

  return {
    limit: rl.limit,
    remaining: rl.remaining,
    resetAt: rl.resetAt,
    retryAfter: rl.retryAfter,
  };
}

export function withRequestMeta(
  response: Response,
  {
    correlationId,
    rl,
    csp,
  }: {
    correlationId: string;
    rl?: {
      limit: number;
      remaining: number;
      resetAt: number;
      retryAfter?: number;
    } | null;
    csp?: string;
  },
): Response {
  return applySecurityHeaders(response, {
    correlationId,
    rateLimitMeta: toRateLimitMeta(rl),
    csp,
  });
}
