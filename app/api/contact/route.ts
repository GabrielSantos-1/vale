import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import contactSchema from '@/lib/validations/contact';
import { prisma } from '@/lib/db/prisma';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';

const MAX_BODY_SIZE_BYTES = 8 * 1024;

function getCorrelationId(req: Request) {
  return (
    req.headers.get('x-correlation-id') ||
    req.headers.get('x-request-id') ||
    crypto.randomUUID()
  );
}

function jsonWithSecurityHeaders(
  body: unknown,
  init?: ResponseInit & {
    rateLimitMeta?: {
      limit: number;
      remaining: number;
      resetAt: number;
      retryAfter?: number;
    };
    correlationId?: string;
  },
) {
  const headers = new Headers(init?.headers);

  if (init?.rateLimitMeta) {
    headers.set('X-RateLimit-Limit', String(init.rateLimitMeta.limit));
    headers.set('X-RateLimit-Remaining', String(init.rateLimitMeta.remaining));
    headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil(init.rateLimitMeta.resetAt / 1000)),
    );

    if (typeof init.rateLimitMeta.retryAfter === 'number') {
      headers.set('Retry-After', String(init.rateLimitMeta.retryAfter));
    }
  }

  if (init?.correlationId) {
    headers.set('X-Correlation-Id', init.correlationId);
  }

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  const rl = rateLimit({
    key: buildRateLimitKey('contact', req),
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rl.ok) {
    return jsonWithSecurityHeaders(
      {
        success: false,
        error: 'Muitas requisições. Tente novamente em instantes.',
      },
      {
        status: 429,
        correlationId,
        rateLimitMeta: {
          limit: rl.limit,
          remaining: rl.remaining,
          resetAt: rl.resetAt,
          retryAfter: rl.retryAfter,
        },
      },
    );
  }

  try {
    const contentLengthHeader = req.headers.get('content-length');
    const contentLength = contentLengthHeader
      ? Number(contentLengthHeader)
      : NaN;

    if (!Number.isNaN(contentLength) && contentLength > MAX_BODY_SIZE_BYTES) {
      return jsonWithSecurityHeaders(
        {
          success: false,
          error: 'Payload excede o tamanho permitido.',
        },
        {
          status: 413,
          correlationId,
          rateLimitMeta: {
            limit: rl.limit,
            remaining: rl.remaining,
            resetAt: rl.resetAt,
          },
        },
      );
    }

    const body = await req.json();
    const parsed = contactSchema.parse(body);

    if (
      'website' in parsed &&
      typeof parsed.website === 'string' &&
      parsed.website.trim()
    ) {
      return jsonWithSecurityHeaders(
        {
          success: true,
        },
        {
          status: 201,
          correlationId,
          rateLimitMeta: {
            limit: rl.limit,
            remaining: rl.remaining,
            resetAt: rl.resetAt,
          },
        },
      );
    }

    await prisma.contactMessage.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        subject: parsed.subject,
        message: parsed.message,
      },
    });

    return jsonWithSecurityHeaders(
      {
        success: true,
      },
      {
        status: 201,
        correlationId,
        rateLimitMeta: {
          limit: rl.limit,
          remaining: rl.remaining,
          resetAt: rl.resetAt,
        },
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonWithSecurityHeaders(
        {
          success: false,
          error: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        {
          status: 400,
          correlationId,
          rateLimitMeta: {
            limit: rl.limit,
            remaining: rl.remaining,
            resetAt: rl.resetAt,
          },
        },
      );
    }

    console.error('[api/contact][POST]', {
      correlationId,
      error,
    });

    return jsonWithSecurityHeaders(
      {
        success: false,
        error: 'Erro interno.',
      },
      {
        status: 500,
        correlationId,
        rateLimitMeta: {
          limit: rl.limit,
          remaining: rl.remaining,
          resetAt: rl.resetAt,
        },
      },
    );
  }
}
