import { LeadStatus } from '@prisma/client';

import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/api/admin';
import { logger } from '@/lib/security/logger';
import { fail, internalError, notFound, ok } from '@/lib/security/response';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { sanitizeString } from '@/lib/security/sanitize';

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

export async function PATCH(request: Request, context: RouteContext) {
  const correlationId = getCorrelationId(request);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized lead archive attempt', {
        correlationId,
        route: '/api/admin/leads/[id]/archive',
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
      logger.warn('Lead not found on archive action', {
        correlationId,
        route: '/api/admin/leads/[id]/archive',
        id,
      });

      return withRequestMeta(notFound('Lead não encontrado.', correlationId), {
        correlationId,
      });
    }

    const archivedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.ARQUIVADO,
        archivedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        archivedAt: true,
        updatedAt: true,
      },
    });

    logger.info('Lead archived successfully', {
      correlationId,
      route: '/api/admin/leads/[id]/archive',
      id,
    });

    return withRequestMeta(ok(archivedLead), { correlationId });
  } catch (error) {
    logger.error('Unhandled error archiving lead', {
      correlationId,
      route: '/api/admin/leads/[id]/archive',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

