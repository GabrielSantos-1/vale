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
import statusSchema from '@/lib/validations/status';

type Context = {
  params: Promise<{ id: string }>;
};

const STATUS_JSON_LIMIT_BYTES = 8 * 1024;

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

export async function PUT(req: Request, context: Context) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin status update attempt', {
        correlationId,
        route: '/api/admin/status/[id]',
      });

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
      route: '/api/admin/status/[id]',
      entity: 'NetworkStatus',
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
      maxBytes: STATUS_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = statusSchema.parse(parsedBody.data);

    const data = {
      title: sanitizeString(parsed.title, { maxLength: 160 }),
      slug: normalizeSlug(parsed.slug),
      status: parsed.status,
      description: sanitizeOptionalString(parsed.description, {
        maxLength: 2000,
      }),
      startedAt: parsed.startedAt ?? null,
      resolvedAt: parsed.resolvedAt ?? null,
      isVisible: parsed.isVisible ?? false,
    };

    const updated = await prisma.networkStatus.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        description: true,
        startedAt: true,
        resolvedAt: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('Admin network status updated successfully', {
      correlationId,
      route: '/api/admin/status/[id]',
      id,
      slug: updated.slug,
      status: updated.status,
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_NETWORK_STATUS_UPDATED',
      entity: 'NetworkStatus',
      entityId: id,
      metadata: {
        correlationId,
        route: '/api/admin/status/[id]',
        status: updated.status,
      },
    });

    return withRequestMeta(ok(updated), { correlationId });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Invalid admin status update payload', {
        correlationId,
        route: '/api/admin/status/[id]',
        issues: error.flatten(),
      });

      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      logger.warn('Admin status update target not found', {
        correlationId,
        route: '/api/admin/status/[id]',
      });

      return withRequestMeta(
        notFound('Registro de status não encontrado.', correlationId),
        { correlationId },
      );
    }

    logger.error('Unhandled error updating admin network status', {
      correlationId,
      route: '/api/admin/status/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

export async function DELETE(req: Request, context: Context) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin status delete attempt', {
        correlationId,
        route: '/api/admin/status/[id]',
      });

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
      route: '/api/admin/status/[id]',
      entity: 'NetworkStatus',
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

    await prisma.networkStatus.delete({
      where: { id },
    });

    logger.info('Admin network status deleted successfully', {
      correlationId,
      route: '/api/admin/status/[id]',
      id,
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_NETWORK_STATUS_DELETED',
      entity: 'NetworkStatus',
      entityId: id,
      metadata: {
        correlationId,
        route: '/api/admin/status/[id]',
      },
    });

    return withRequestMeta(ok({ deleted: true, id }), {
      correlationId,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      logger.warn('Admin status delete target not found', {
        correlationId,
        route: '/api/admin/status/[id]',
      });

      return withRequestMeta(
        notFound('Registro de status não encontrado.', correlationId),
        { correlationId },
      );
    }

    logger.error('Unhandled error deleting admin network status', {
      correlationId,
      route: '/api/admin/status/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

