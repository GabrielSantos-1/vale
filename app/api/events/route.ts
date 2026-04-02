import { z, ZodError } from 'zod';

import {
  JsonBodyParseError,
  parseJsonBodyWithLimit,
} from '@/lib/security/json-body';
import { logger } from '@/lib/security/logger';
import { fail, internalError, ok, validationError } from '@/lib/security/response';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { sanitizeOptionalString, sanitizeString } from '@/lib/security/sanitize';

const MAX_BODY_SIZE_BYTES = 2 * 1024;
const EVENTS_RATE_LIMIT = {
  limit: 60,
  windowMs: 60 * 1000,
} as const;

const publicEventSchema = z
  .object({
    eventName: z.enum([
      'cta_click',
      'coverage_check_submitted',
      'coverage_check_result',
      'contact_submit',
      'plan_interest',
    ]),
    page: z.string().trim().min(1).max(120),
    component: z.string().trim().min(1).max(80),
    target: z.string().trim().max(120).optional(),
    status: z
      .enum(['click', 'submitted', 'success', 'error', 'available', 'unavailable'])
      .optional(),
  })
  .strict();

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

function mapBodyParseError(
  error: JsonBodyParseError,
  correlationId: string,
  rl: ReturnType<typeof rateLimit>,
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

  const rl = rateLimit({
    key: buildRateLimitKey('public-events', req),
    limit: EVENTS_RATE_LIMIT.limit,
    windowMs: EVENTS_RATE_LIMIT.windowMs,
  });

  if (!rl.ok) {
    logger.warn('Rate limit hit on public events route', {
      correlationId,
      route: '/api/events',
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
      logger.warn('Invalid request body on public events route', {
        correlationId,
        route: '/api/events',
        category: error.code,
      });

      return mapBodyParseError(error, correlationId, rl);
    }

    logger.error('Unhandled body parse error on public events route', {
      correlationId,
      route: '/api/events',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }

  try {
    const parsed = publicEventSchema.parse(body);
    const timestamp = new Date().toISOString();

    logger.info('Public conversion event tracked', {
      correlationId,
      route: '/api/events',
      eventName: parsed.eventName,
      page: sanitizeString(parsed.page, { maxLength: 120 }),
      component: sanitizeString(parsed.component, { maxLength: 80 }),
      target: sanitizeOptionalString(parsed.target, { maxLength: 120 }),
      status: parsed.status,
      timestamp,
    });

    return withRequestMeta(
      ok({
        accepted: true,
        timestamp,
      }),
      { correlationId, rl },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Validation failed on public events route', {
        correlationId,
        route: '/api/events',
        issues: error.flatten(),
      });

      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId, rl },
      );
    }

    logger.error('Unhandled error on public events route', {
      correlationId,
      route: '/api/events',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }
}

