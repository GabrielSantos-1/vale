import { ZodError, z } from 'zod';

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
  normalizeCep,
  normalizeEmail,
  normalizePhone,
  normalizeSlug,
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';

const MAX_BODY_SIZE_BYTES = 8 * 1024;
const LEADS_RATE_LIMIT = {
  limit: 5,
  windowMs: 60_000,
} as const;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function optionalTrimmedString(maxLength: number) {
  return z.preprocess((value) => {
    if (typeof value !== 'string') return undefined;

    const trimmed = normalizeWhitespace(value);
    return trimmed.length > 0 ? trimmed : undefined;
  }, z.string().max(maxLength).optional());
}

const leadSchema = z
  .object({
    name: z.preprocess(
      (value) => {
        if (typeof value !== 'string') return value;
        return normalizeWhitespace(value);
      },
      z
        .string()
        .min(3, 'Informe seu nome completo.')
        .max(120, 'Nome muito longo.'),
    ),
    email: z.preprocess((value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim().toLowerCase();
      return trimmed.length > 0 ? trimmed : undefined;
    }, z.string().email('E-mail invalido.').max(160, 'E-mail muito longo.').optional()),
    phone: z.preprocess((value) => {
      if (typeof value !== 'string') return value;
      return value.replace(/\D/g, '');
    }, z.string().min(10, 'Telefone invalido.').max(11, 'Telefone invalido.').optional()),
    city: optionalTrimmedString(80),
    district: optionalTrimmedString(80),
    cep: z.preprocess((value) => {
      if (typeof value !== 'string') return undefined;
      const digits = value.replace(/\D/g, '');
      return digits.length > 0 ? digits : undefined;
    }, z.string().length(8, 'CEP invalido.').optional()),
    message: optionalTrimmedString(1000),
    planSlug: optionalTrimmedString(120),
    website: optionalTrimmedString(255),
  })
  .strict();

function formatValidationErrors(error: ZodError) {
  const fieldErrors = error.flatten().fieldErrors;
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(fieldErrors)) {
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'string'
    ) {
      normalized[key] = value[0];
    }
  }

  return normalized;
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
      fail('Payload muito grande.', {
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
    key: buildRateLimitKey('leads', req),
    limit: LEADS_RATE_LIMIT.limit,
    windowMs: LEADS_RATE_LIMIT.windowMs,
  });

  if (!rl.ok) {
    await recordPublicApiRateLimited({
      route: '/api/leads',
      correlationId,
    });

    logger.warn('Rate limit hit on leads route', {
      correlationId,
      route: '/api/leads',
      limit: rl.limit,
      remaining: rl.remaining,
      resetAt: rl.resetAt,
    });

    return withRequestMeta(
      fail('Muitas tentativas. Tente novamente em instantes.', {
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
      logger.warn('Invalid request body on leads route', {
        correlationId,
        route: '/api/leads',
        category: error.code,
      });

      return mapBodyParseError(error, correlationId, rl);
    }

    logger.error('Unhandled body parse error on leads route', {
      correlationId,
      route: '/api/leads',
      error,
    });

    await recordPublicApiError({
      route: '/api/leads',
      correlationId,
      category: 'body_parse_error',
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }

  try {
    const parsed = leadSchema.parse(body);

    if (parsed.website) {
      logger.info('Honeypot triggered on leads route', {
        correlationId,
        route: '/api/leads',
      });

      return withRequestMeta(
        created({
          success: true,
          message: 'Solicitacao recebida com sucesso.',
          correlationId,
        }),
        { correlationId, rl },
      );
    }

    const sanitized = {
      name: sanitizeString(parsed.name, { maxLength: 120 }),
      email: parsed.email ? normalizeEmail(parsed.email) : null,
      phone: parsed.phone ? normalizePhone(parsed.phone) : null,
      city: sanitizeOptionalString(parsed.city, { maxLength: 80 }),
      district: sanitizeOptionalString(parsed.district, { maxLength: 80 }),
      cep: parsed.cep ? normalizeCep(parsed.cep) : null,
      message: sanitizeOptionalString(parsed.message, { maxLength: 1000 }),
      planSlug: parsed.planSlug ? normalizeSlug(parsed.planSlug) : null,
    };

    let planId: string | undefined;

    if (sanitized.planSlug) {
      const plan = await prisma.plan.findFirst({
        where: {
          slug: sanitized.planSlug,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (!plan) {
        logger.warn('Invalid plan slug on leads route', {
          correlationId,
          route: '/api/leads',
        });

        return withRequestMeta(
          fail('Plano invalido.', {
            status: 400,
            code: 'INVALID_PLAN',
            details: {
              fieldErrors: {
                planSlug: 'Selecione um plano valido.',
              },
            },
            correlationId,
          }),
          { correlationId, rl },
        );
      }

      planId = plan.id;
    }

    const lead = await prisma.lead.create({
      data: {
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone ?? undefined,
        city: sanitized.city ?? undefined,
        district: sanitized.district ?? undefined,
        cep: sanitized.cep ?? undefined,
        message: sanitized.message ?? undefined,
        planId,
        source: 'public_site',
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    logger.info('Lead created successfully', {
      correlationId,
      route: '/api/leads',
      leadId: lead.id,
      hasPlan: Boolean(planId),
    });

    return withRequestMeta(
      created({
        success: true,
        data: {
          id: lead.id,
          createdAt: lead.createdAt,
        },
        message: 'Lead enviado com sucesso.',
        correlationId,
      }),
      { correlationId, rl },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Validation failed on leads route', {
        correlationId,
        route: '/api/leads',
        issues: error.flatten(),
      });

      return withRequestMeta(
        validationError(
          {
            fieldErrors: formatValidationErrors(error),
          },
          correlationId,
        ),
        { correlationId, rl },
      );
    }

    logger.error('Unhandled error on leads route', {
      correlationId,
      route: '/api/leads',
      error,
    });

    await recordPublicApiError({
      route: '/api/leads',
      correlationId,
      category: 'unhandled_error',
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
      rl,
    });
  }
}
