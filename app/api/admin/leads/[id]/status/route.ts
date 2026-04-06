import { NextRequest } from 'next/server';
import { LeadStatus } from '@prisma/client';
import { z } from 'zod';

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
import { sanitizeString } from '@/lib/security/sanitize';

const STATUS_JSON_LIMIT_BYTES = 4 * 1024;

const bodySchema = z
  .object({
    status: z.nativeEnum(LeadStatus),
  })
  .strict();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isValidId(value: string) {
  const id = sanitizeString(value, {
    maxLength: 64,
    collapseWhitespace: false,
  });

  return id.length > 0 ? id : null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const correlationId = getCorrelationId(request);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized lead status update attempt', {
        correlationId,
        route: '/api/admin/leads/[id]/status',
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
      req: request,
      session,
      correlationId,
      route: '/api/admin/leads/[id]/status',
      entity: 'Lead',
    });

    if (csrfFailure) return csrfFailure;

    const { id: rawId } = await context.params;
    const id = isValidId(rawId);

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

    const parsedBody = await parseAdminJsonBody(request, {
      maxBytes: STATUS_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = bodySchema.safeParse(parsedBody.data);

    if (!parsed.success) {
      logger.warn('Invalid lead status payload', {
        correlationId,
        route: '/api/admin/leads/[id]/status',
        issues: parsed.error.flatten(),
      });

      return withRequestMeta(
        validationError(parsed.error.flatten(), correlationId),
        { correlationId },
      );
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingLead) {
      logger.warn('Lead not found on status update', {
        correlationId,
        route: '/api/admin/leads/[id]/status',
        id,
      });

      return withRequestMeta(notFound('Lead não encontrado.', correlationId), {
        correlationId,
      });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: parsed.data.status,
        archivedAt:
          parsed.data.status === LeadStatus.ARQUIVADO ? new Date() : null,
      },
      select: {
        id: true,
        status: true,
        archivedAt: true,
        updatedAt: true,
      },
    });

    logger.info('Lead status updated successfully', {
      correlationId,
      route: '/api/admin/leads/[id]/status',
      id,
      status: parsed.data.status,
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_LEAD_STATUS_UPDATED',
      entity: 'Lead',
      entityId: id,
      metadata: {
        correlationId,
        route: '/api/admin/leads/[id]/status',
        status: parsed.data.status,
      },
    });

    return withRequestMeta(ok(updatedLead), { correlationId });
  } catch (error) {
    logger.error('Unhandled error updating lead status', {
      correlationId,
      route: '/api/admin/leads/[id]/status',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

