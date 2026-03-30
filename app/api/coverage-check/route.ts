import { ZodError, z } from 'zod';

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';
import {
  fail,
  internalError,
  ok,
  validationError,
} from '@/lib/security/response';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
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

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  const rl = rateLimit({
    key: buildRateLimitKey('coverage-check', req),
    limit: COVERAGE_RATE_LIMIT.limit,
    windowMs: COVERAGE_RATE_LIMIT.windowMs,
  });

  if (!rl.ok) {
    logger.warn('Rate limit hit on coverage-check route', {
      correlationId,
      route: '/api/coverage-check',
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
    logger.warn('Invalid content-type on coverage-check route', {
      correlationId,
      route: '/api/coverage-check',
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
      logger.warn('Payload too large on coverage-check route', {
        correlationId,
        route: '/api/coverage-check',
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
    logger.warn('Invalid JSON on coverage-check route', {
      correlationId,
      route: '/api/coverage-check',
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
        cep: cep || undefined,
        city: city || undefined,
        district: district || undefined,
      });

      return withRequestMeta(
        ok({
          available: false,
          notes: null,
        }),
        { correlationId, rl },
      );
    }

    logger.info('Coverage-check completed with available result', {
      correlationId,
      route: '/api/coverage-check',
      cep: cep || undefined,
      city: city || undefined,
      district: district || undefined,
    });

    return withRequestMeta(
      ok({
        available: found.isAvailable,
        notes: found.notes,
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

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }
}
