import { ZodError, z } from 'zod';

import { prisma } from '@/lib/db/prisma';
import {
  JsonBodyParseError,
  parseJsonBodyWithLimit,
} from '@/lib/security/json-body';
import { logger } from '@/lib/security/logger';
import {
  fail,
  internalError,
  ok,
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
  normalizeCep,
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';

const MAX_BODY_SIZE_BYTES = 4 * 1024;
const COVERAGE_RATE_LIMIT = {
  limit: 20,
  windowMs: 5 * 60 * 1000,
} as const;

const coverageCheckSchema = z
  .object({
    cep: z.string().trim().optional(),
    city: z.string().trim().optional(),
    district: z.string().trim().optional(),
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
    key: buildRateLimitKey('coverage-check', req),
    limit: COVERAGE_RATE_LIMIT.limit,
    windowMs: COVERAGE_RATE_LIMIT.windowMs,
  });

  if (!rl.ok) {
    await recordPublicApiRateLimited({
      route: '/api/coverage-check',
      correlationId,
    });

    logger.warn('Rate limit hit on coverage-check route', {
      correlationId,
      route: '/api/coverage-check',
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
      logger.warn('Invalid request body on coverage-check route', {
        correlationId,
        route: '/api/coverage-check',
        category: error.code,
      });

      return mapBodyParseError(error, correlationId, rl);
    }

    logger.error('Unhandled body parse error on coverage-check route', {
      correlationId,
      route: '/api/coverage-check',
      error,
    });

    await recordPublicApiError({
      route: '/api/coverage-check',
      correlationId,
      category: 'body_parse_error',
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }

  try {
    const parsed = coverageCheckSchema.parse(body);

    const cep = parsed.cep ? normalizeCep(parsed.cep) : '';
    const city = sanitizeOptionalString(parsed.city, { maxLength: 80 }) ?? '';
    const district =
      sanitizeOptionalString(parsed.district, { maxLength: 80 }) ?? '';

    if (!cep && !city && !district) {
      logger.warn('Coverage-check missing search parameters', {
        correlationId,
        route: '/api/coverage-check',
      });

      return withRequestMeta(
        fail('Informe ao menos CEP, cidade ou bairro.', {
          status: 400,
          code: 'MISSING_SEARCH_FIELDS',
          correlationId,
        }),
        { correlationId, rl },
      );
    }

    let found: { isAvailable: boolean; notes: string | null } | null = null;

    if (cep) {
      found = await prisma.coverageArea.findFirst({
        where: {
          isAvailable: true,
          cepStart: { lte: cep },
          cepEnd: { gte: cep },
        },
        select: {
          isAvailable: true,
          notes: true,
        },
      });
    } else if (city && district) {
      found = await prisma.coverageArea.findFirst({
        where: {
          isAvailable: true,
          city: {
            equals: sanitizeString(city, {
              maxLength: 80,
              collapseWhitespace: true,
            }),
            mode: 'insensitive',
          },
          district: {
            equals: sanitizeString(district, {
              maxLength: 80,
              collapseWhitespace: true,
            }),
            mode: 'insensitive',
          },
        },
        select: {
          isAvailable: true,
          notes: true,
        },
      });
    } else if (city) {
      found = await prisma.coverageArea.findFirst({
        where: {
          isAvailable: true,
          city: {
            equals: sanitizeString(city, {
              maxLength: 80,
              collapseWhitespace: true,
            }),
            mode: 'insensitive',
          },
        },
        select: {
          isAvailable: true,
          notes: true,
        },
      });
    }

    if (!found) {
      logger.info('Coverage-check completed with unavailable result', {
        correlationId,
        route: '/api/coverage-check',
      });

      return withRequestMeta(
        ok({
          available: false,
          notes: null,
        }),
        { correlationId, rl },
      );
    }

    const safeNotes = sanitizeOptionalString(found.notes, {
      maxLength: 500,
      collapseWhitespace: true,
      removeAngleBrackets: true,
      removeControlChars: true,
    });

    logger.info('Coverage-check completed with available result', {
      correlationId,
      route: '/api/coverage-check',
    });

    return withRequestMeta(
      ok({
        available: found.isAvailable,
        notes: safeNotes,
      }),
      { correlationId, rl },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Validation failed on coverage-check route', {
        correlationId,
        route: '/api/coverage-check',
        issues: error.flatten(),
      });

      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId, rl },
      );
    }

    logger.error('Unhandled error on coverage-check route', {
      correlationId,
      route: '/api/coverage-check',
      error,
    });

    await recordPublicApiError({
      route: '/api/coverage-check',
      correlationId,
      category: 'unhandled_error',
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }
}
