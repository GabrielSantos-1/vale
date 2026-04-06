import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import { requireAdmin } from '@/lib/api/admin';
import { enforceAdminCsrf, parseAdminJsonBody } from '@/lib/api/admin-mutation';
import { prisma } from '@/lib/db/prisma';
import { getSessionActorUserId, logAudit } from '@/lib/security/audit';
import { logger } from '@/lib/security/logger';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import {
  created,
  fail,
  internalError,
  ok,
  validationError,
} from '@/lib/security/response';
import {
  normalizeSlug,
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';
import planSchema from '@/lib/validations/plan';

const PLAN_JSON_LIMIT_BYTES = 12 * 1024;

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

function normalizePlanInput(input: {
  name: string;
  slug: string;
  downloadMbps: number;
  uploadMbps: number;
  latencyTarget: number;
  priceCents: number;
  featured?: boolean;
  benefitsJson?: unknown[];
  badge?: string;
}) {
  const benefitsJson = Array.isArray(input.benefitsJson)
    ? input.benefitsJson
        .filter((item): item is string => typeof item === 'string')
        .map((item) => sanitizeString(item, { maxLength: 160 }))
    : [];

  return {
    name: sanitizeString(input.name, { maxLength: 120 }),
    slug: normalizeSlug(input.slug),
    downloadMbps: input.downloadMbps,
    uploadMbps: input.uploadMbps,
    latencyTarget: input.latencyTarget,
    priceCents: input.priceCents,
    featured: input.featured ?? false,
    benefitsJson: benefitsJson as Prisma.InputJsonValue,
    badge: sanitizeOptionalString(input.badge, { maxLength: 80 }),
  };
}

export async function GET(req: Request) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();
    if (!session) {
      return withRequestMeta(
        fail('Não autenticado.', {
          status: 401,
          code: 'UNAUTHORIZED',
          correlationId,
        }),
        { correlationId },
      );
    }

    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return withRequestMeta(ok(plans), { correlationId });
  } catch (error) {
    logger.error('Unhandled error fetching admin plans list', {
      correlationId,
      route: '/api/admin/plans',
      error,
    });

    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();
    if (!session) {
      return withRequestMeta(
        fail('Não autenticado.', {
          status: 401,
          code: 'UNAUTHORIZED',
          correlationId,
        }),
        { correlationId },
      );
    }

    const csrfFailure = await enforceAdminCsrf({
      req,
      session,
      correlationId,
      route: '/api/admin/plans',
      entity: 'Plan',
    });

    if (csrfFailure) return csrfFailure;

    const parsedBody = await parseAdminJsonBody(req, {
      maxBytes: PLAN_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = planSchema.parse(parsedBody.data);
    const normalized = normalizePlanInput(parsed);

    const createdPlan = await prisma.plan.create({
      data: normalized,
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_PLAN_CREATED',
      entity: 'Plan',
      entityId: createdPlan.id,
      metadata: {
        correlationId,
        route: '/api/admin/plans',
        slug: createdPlan.slug,
      },
    });

    return withRequestMeta(created(createdPlan), { correlationId });
  } catch (error) {
    if (error instanceof ZodError) {
      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return withRequestMeta(
        fail('Já existe um plano com esse slug.', {
          status: 409,
          code: 'CONFLICT',
          correlationId,
        }),
        { correlationId },
      );
    }

    logger.error('Unhandled error creating admin plan', {
      correlationId,
      route: '/api/admin/plans',
      error,
    });

    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}
