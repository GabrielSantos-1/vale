import { NextRequest } from 'next/server';
import { LeadStatus } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/api/admin';
import { logger } from '@/lib/security/logger';
import {
  fail,
  internalError,
  notFound,
  ok,
  validationError,
} from '@/lib/security/response';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { sanitizeString } from '@/lib/security/sanitize';

const bodySchema = z.object({
  status: z.nativeEnum(LeadStatus),
});

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

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return withRequestMeta(
        fail('Content-Type inválido.', {
          status: 415,
          code: 'UNSUPPORTED_MEDIA_TYPE',
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

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return withRequestMeta(
        fail('JSON inválido.', {
          status: 400,
          code: 'INVALID_JSON',
          correlationId,
        }),
        { correlationId },
      );
    }

    const parsed = bodySchema.safeParse(body);

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

