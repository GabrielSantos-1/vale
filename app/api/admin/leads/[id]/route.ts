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

export async function GET(request: Request, context: RouteContext) {
  const correlationId = getCorrelationId(request);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized lead detail access attempt', {
        correlationId,
        route: '/api/admin/leads/[id]',
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

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        district: true,
        cep: true,
        message: true,
        source: true,
        status: true,
        archivedAt: true,
        createdAt: true,
        updatedAt: true,
        planId: true,
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!lead) {
      logger.warn('Lead not found on detail fetch', {
        correlationId,
        route: '/api/admin/leads/[id]',
        id,
      });

      return withRequestMeta(notFound('Lead não encontrado.', correlationId), {
        correlationId,
      });
    }

    logger.info('Lead detail fetched successfully', {
      correlationId,
      route: '/api/admin/leads/[id]',
      id,
    });

    return withRequestMeta(ok(lead), { correlationId });
  } catch (error) {
    logger.error('Unhandled error fetching lead detail', {
      correlationId,
      route: '/api/admin/leads/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const correlationId = getCorrelationId(request);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized lead delete attempt', {
        correlationId,
        route: '/api/admin/leads/[id]',
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
      },
    });

    if (!existingLead) {
      logger.warn('Lead not found on delete action', {
        correlationId,
        route: '/api/admin/leads/[id]',
        id,
      });

      return withRequestMeta(notFound('Lead não encontrado.', correlationId), {
        correlationId,
      });
    }

    const deletedLead = await prisma.lead.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    logger.info('Lead soft-deleted successfully', {
      correlationId,
      route: '/api/admin/leads/[id]',
      id,
    });

    return withRequestMeta(ok(deletedLead), { correlationId });
  } catch (error) {
    logger.error('Unhandled error deleting lead', {
      correlationId,
      route: '/api/admin/leads/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

