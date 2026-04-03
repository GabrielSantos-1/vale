import { ZodError } from 'zod';

import { prisma } from '@/lib/db/prisma';
import {
  JsonBodyParseError,
  parseJsonBodyWithLimit,
} from '@/lib/security/json-body';
import { logger } from '@/lib/security/logger';
import {
  created,
  fail,
  internalError,
  validationError,
} from '@/lib/security/response';
import {
  buildRateLimitKey,
  rateLimit,
  type RateLimitResult,
} from '@/lib/security/rate-limit';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import {
  recordPublicApiError,
  recordPublicApiRateLimited,
} from '@/lib/observability/audit';
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

function mapBodyParseError(
  error: JsonBodyParseError,
  correlationId: string,
  rl: RateLimitResult,
) {
  if (error.code === 'UNSUPPORTED_MEDIA_TYPE') {
    return withRequestMeta(
      fail('Content-Type invalido.', {
        status: 415,
        code: 'UNSUPPORTED_MEDIA_TYPE',
        correlationId,
      }),
      { correlationId, rl },
    );
  }

  if (error.code === 'PAYLOAD_TOO_LARGE') {
    return withRequestMeta(
      fail('Payload excede o tamanho permitido.', {
        status: 413,
        code: 'PAYLOAD_TOO_LARGE',
        correlationId,
      }),
      { correlationId, rl },
    );
  }

  return withRequestMeta(
    fail('JSON invalido.', {
      status: 400,
      code: 'INVALID_JSON',
      correlationId,
    }),
    { correlationId, rl },
  );
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  const rl = await rateLimit({
    key: buildRateLimitKey('contact', req),
    limit: CONTACT_RATE_LIMIT.limit,
    windowMs: CONTACT_RATE_LIMIT.windowMs,
  });

  if (!rl.ok) {
    await recordPublicApiRateLimited({
      route: '/api/contact',
      correlationId,
    });

    logger.warn('Rate limit hit on contact route', {
      correlationId,
      route: '/api/contact',
      limit: rl.limit,
      remaining: rl.remaining,
      resetAt: rl.resetAt,
    });

    return withRequestMeta(
      fail('Muitas requisicoes. Tente novamente em instantes.', {
        status: 429,
        code: 'RATE_LIMITED',
        correlationId,
      }),
      { correlationId, rl },
    );
  }

  let body: unknown;

  try {
    body = await parseJsonBodyWithLimit(req, {
      maxBytes: MAX_BODY_SIZE_BYTES,
      requireJsonContentType: true,
    });
  } catch (error) {
    if (error instanceof JsonBodyParseError) {
      logger.warn('Invalid request body on contact route', {
        correlationId,
        route: '/api/contact',
        category: error.code,
      });

      return mapBodyParseError(error, correlationId, rl);
    }

    logger.error('Unhandled body parse error on contact route', {
      correlationId,
      route: '/api/contact',
      error,
    });

    await recordPublicApiError({
      route: '/api/contact',
      correlationId,
      category: 'body_parse_error',
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
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

    await recordPublicApiError({
      route: '/api/contact',
      correlationId,
      category: 'unhandled_error',
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }
}
