import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import { requireAdmin } from '@/lib/api/admin';
import { enforceAdminCsrf, parseAdminJsonBody } from '@/lib/api/admin-mutation';
import { prisma } from '@/lib/db/prisma';
import { getSessionActorUserId, logAudit } from '@/lib/security/audit';
import { logger } from '@/lib/security/logger';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import {
  fail,
  internalError,
  notFound,
  ok,
  validationError,
} from '@/lib/security/response';
import {
  normalizeSlug,
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';
import planSchema from '@/lib/validations/plan';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const PLAN_JSON_LIMIT_BYTES = 12 * 1024;

function normalizeId(value: string) {
  const sanitized = sanitizeString(value, {
    maxLength: 64,
    collapseWhitespace: false,
  });

  return sanitized.length > 0 ? sanitized : null;
}

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

export async function PUT(req: Request, context: RouteContext) {
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
      route: '/api/admin/plans/[id]',
      entity: 'Plan',
    });

    if (csrfFailure) return csrfFailure;

    const { id: rawId } = await context.params;
    const id = normalizeId(rawId);

    if (!id) {
      return withRequestMeta(
        fail('ID inválido.', {
          status: 400,
          code: 'INVALID_ID',
          correlationId,
        }),
        { correlationId },
      );
    }

    const parsedBody = await parseAdminJsonBody(req, {
      maxBytes: PLAN_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = planSchema.parse(parsedBody.data);
    const normalized = normalizePlanInput(parsed);

    const updated = await prisma.plan.update({
      where: { id },
      data: normalized,
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_PLAN_UPDATED',
      entity: 'Plan',
      entityId: id,
      metadata: {
        correlationId,
        route: '/api/admin/plans/[id]',
      },
    });

    return withRequestMeta(ok(updated), { correlationId });
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return withRequestMeta(notFound('Plano não encontrado.', correlationId), {
        correlationId,
      });
    }

    logger.error('Unhandled error updating admin plan', {
      correlationId,
      route: '/api/admin/plans/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
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
      route: '/api/admin/plans/[id]',
      entity: 'Plan',
    });

    if (csrfFailure) return csrfFailure;

    const { id: rawId } = await context.params;
    const id = normalizeId(rawId);

    if (!id) {
      return withRequestMeta(
        fail('ID inválido.', {
          status: 400,
          code: 'INVALID_ID',
          correlationId,
        }),
        { correlationId },
      );
    }

    await prisma.plan.delete({
      where: { id },
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_PLAN_DELETED',
      entity: 'Plan',
      entityId: id,
      metadata: {
        correlationId,
        route: '/api/admin/plans/[id]',
      },
    });

    return withRequestMeta(
      ok({
        deleted: true,
        id,
      }),
      { correlationId },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return withRequestMeta(notFound('Plano não encontrado.', correlationId), {
        correlationId,
      });
    }

    logger.error('Unhandled error deleting admin plan', {
      correlationId,
      route: '/api/admin/plans/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}
