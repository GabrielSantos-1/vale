import { NextResponse } from 'next/server';
import { ZodError, z } from 'zod';

import { prisma } from '@/lib/db/prisma';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';

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
    }, z.string().email('E-mail inválido.').max(160, 'E-mail muito longo.').optional()),

    phone: z.preprocess((value) => {
      if (typeof value !== 'string') return value;
      return value.replace(/\D/g, '');
    }, z.string().min(10, 'Telefone inválido.').max(11, 'Telefone inválido.').optional()),

    city: optionalTrimmedString(80),
    district: optionalTrimmedString(80),

    cep: z.preprocess((value) => {
      if (typeof value !== 'string') return undefined;
      const digits = value.replace(/\D/g, '');
      return digits.length > 0 ? digits : undefined;
    }, z.string().length(8, 'CEP inválido.').optional()),

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

function getCorrelationId(req: Request) {
  return req.headers.get('x-correlation-id') || crypto.randomUUID();
}

function applySecurityHeaders(
  response: NextResponse,
  correlationId: string,
  rateLimitMeta?: {
    limit: number;
    remaining: number;
    resetAt: number;
  },
) {
  response.headers.set('X-Correlation-Id', correlationId);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );

  if (rateLimitMeta) {
    response.headers.set('X-RateLimit-Limit', String(rateLimitMeta.limit));
    response.headers.set(
      'X-RateLimit-Remaining',
      String(rateLimitMeta.remaining),
    );
    response.headers.set('X-RateLimit-Reset', String(rateLimitMeta.resetAt));
  }

  return response;
}

function getRateLimitMeta(rl: ReturnType<typeof rateLimit>) {
  return {
    limit: rl.limit,
    remaining: rl.remaining,
    resetAt: rl.resetAt,
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  correlationId: string,
  rl?: ReturnType<typeof rateLimit>,
) {
  const response = NextResponse.json(body, { status });

  return applySecurityHeaders(
    response,
    correlationId,
    rl ? getRateLimitMeta(rl) : undefined,
  );
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  const rl = rateLimit({
    key: buildRateLimitKey('leads', req),
    limit: LEADS_RATE_LIMIT.limit,
    windowMs: LEADS_RATE_LIMIT.windowMs,
  });

  if (!rl.ok) {
    const response = jsonResponse(
      {
        success: false,
        error: 'Muitas tentativas. Tente novamente em instantes.',
        correlationId,
      },
      429,
      correlationId,
      rl,
    );

    response.headers.set('Retry-After', String(rl.retryAfter));
    return response;
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse(
      {
        success: false,
        error: 'Content-Type inválido.',
        correlationId,
      },
      415,
      correlationId,
      rl,
    );
  }

  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);

    if (
      !Number.isFinite(contentLength) ||
      contentLength > MAX_BODY_SIZE_BYTES
    ) {
      return jsonResponse(
        {
          success: false,
          error: 'Payload muito grande.',
          correlationId,
        },
        413,
        correlationId,
        rl,
      );
    }
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(
      {
        success: false,
        error: 'JSON inválido.',
        correlationId,
      },
      400,
      correlationId,
      rl,
    );
  }

  try {
    const parsed = leadSchema.parse(body);

    if (parsed.website) {
      return jsonResponse(
        {
          success: true,
          message: 'Solicitação recebida com sucesso.',
          correlationId,
        },
        201,
        correlationId,
        rl,
      );
    }

    let planId: string | undefined;

    if (parsed.planSlug) {
      const plan = await prisma.plan.findFirst({
        where: {
          slug: parsed.planSlug,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (!plan) {
        return jsonResponse(
          {
            success: false,
            error: 'Plano inválido.',
            fieldErrors: {
              planSlug: 'Selecione um plano válido.',
            },
            correlationId,
          },
          400,
          correlationId,
          rl,
        );
      }

      planId = plan.id;
    }

    const lead = await prisma.lead.create({
      data: {
        name: parsed.name,
        email: parsed.email ?? null,
        phone: parsed.phone,
        city: parsed.city,
        district: parsed.district,
        cep: parsed.cep,
        message: parsed.message,
        planId,
        source: 'public_site',
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return jsonResponse(
      {
        success: true,
        data: {
          id: lead.id,
          createdAt: lead.createdAt,
        },
        message: 'Lead enviado com sucesso.',
        correlationId,
      },
      201,
      correlationId,
      rl,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          success: false,
          error: 'Dados inválidos.',
          fieldErrors: formatValidationErrors(error),
          correlationId,
        },
        400,
        correlationId,
        rl,
      );
    }

    console.error('[api/leads][POST]', {
      correlationId,
      message: error instanceof Error ? error.message : 'unknown_error',
    });

    return jsonResponse(
      {
        success: false,
        error: 'Não foi possível enviar sua solicitação.',
        correlationId,
      },
      500,
      correlationId,
      rl,
    );
  }
}
