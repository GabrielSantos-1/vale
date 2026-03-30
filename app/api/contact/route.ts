import { ZodError } from 'zod';

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';
import {
  created,
  fail,
  internalError,
  validationError,
} from '@/lib/security/response';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import {
  normalizeEmail,
  normalizePhone,
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';
import contactSchema from '@/lib/validations/contact';

const MAX_BODY_SIZE_BYTES = 8 * 1024;
const CONTACT_RATE_LIMIT = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
} as const;

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  const rl = rateLimit({
    key: buildRateLimitKey('contact', req),
    limit: CONTACT_RATE_LIMIT.limit,
    windowMs: CONTACT_RATE_LIMIT.windowMs,
  });

  if (!rl.ok) {
    logger.warn('Rate limit hit on contact route', {
      correlationId,
      route: '/api/contact',
      limit: rl.limit,
      remaining: rl.remaining,
      resetAt: rl.resetAt,
    });

    return withRequestMeta(
      fail('Muitas requisições. Tente novamente em instantes.', {
        status: 429,
        code: 'RATE_LIMITED',
        correlationId,
      }),
      { correlationId, rl },
    );
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    logger.warn('Invalid content-type on contact route', {
      correlationId,
      route: '/api/contact',
      contentType,
    });

    return withRequestMeta(
      fail('Content-Type inválido.', {
        status: 415,
        code: 'UNSUPPORTED_MEDIA_TYPE',
        correlationId,
      }),
      { correlationId, rl },
    );
  }

  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);

    if (
      !Number.isFinite(contentLength) ||
      contentLength > MAX_BODY_SIZE_BYTES
    ) {
      logger.warn('Payload too large on contact route', {
        correlationId,
        route: '/api/contact',
        contentLengthHeader,
      });

      return withRequestMeta(
        fail('Payload excede o tamanho permitido.', {
          status: 413,
          code: 'PAYLOAD_TOO_LARGE',
          correlationId,
        }),
        { correlationId, rl },
      );
    }
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    logger.warn('Invalid JSON on contact route', {
      correlationId,
      route: '/api/contact',
    });

    return withRequestMeta(
      fail('JSON inválido.', {
        status: 400,
        code: 'INVALID_JSON',
        correlationId,
      }),
      { correlationId, rl },
    );
  }

  try {
    const parsed = contactSchema.parse(body);

    if (
      'website' in parsed &&
      typeof parsed.website === 'string' &&
      parsed.website.trim()
    ) {
      logger.info('Honeypot triggered on contact route', {
        correlationId,
        route: '/api/contact',
      });

      return withRequestMeta(created({ success: true }), {
        correlationId,
        rl,
      });
    }

    const data = {
      name: sanitizeString(parsed.name, { maxLength: 120 }),
      email: normalizeEmail(parsed.email),
      phone: sanitizeOptionalString(parsed.phone, { maxLength: 20 }),
      subject: sanitizeOptionalString(parsed.subject, { maxLength: 160 }),
      message: sanitizeString(parsed.message, { maxLength: 2000 }),
    };

    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ? normalizePhone(data.phone) : null,
        subject: data.subject,
        message: data.message,
      },
    });

    logger.info('Contact message created successfully', {
      correlationId,
      route: '/api/contact',
      email: data.email,
    });

    return withRequestMeta(created({ success: true }), {
      correlationId,
      rl,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Validation failed on contact route', {
        correlationId,
        route: '/api/contact',
        issues: error.flatten(),
      });

      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId, rl },
      );
    }

    logger.error('Unhandled error on contact route', {
      correlationId,
      route: '/api/contact',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }
}
