import { ContactMessageStatus } from '@prisma/client';
import { NextRequest } from 'next/server';
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchBodySchema = z.object({
  status: z.nativeEnum(ContactMessageStatus),
});

function normalizeId(value: string) {
  const sanitized = sanitizeString(value, {
    maxLength: 64,
    collapseWhitespace: false,
  });

  return sanitized.length > 0 ? sanitized : null;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin contact read attempt', {
        correlationId,
        route: '/api/admin/contact/[id]',
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

    const { id: rawId } = await params;
    const id = normalizeId(rawId);

    if (!id) {
      return withRequestMeta(
        fail('ID da mensagem é obrigatório.', {
          status: 400,
          code: 'INVALID_ID',
          correlationId,
        }),
        { correlationId },
      );
    }

    const message = await prisma.contactMessage.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        status: true,
        readAt: true,
        archivedAt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!message) {
      logger.warn('Admin contact message not found', {
        correlationId,
        route: '/api/admin/contact/[id]',
        id,
      });

      return withRequestMeta(
        notFound('Mensagem não encontrada.', correlationId),
        { correlationId },
      );
    }

    logger.info('Admin contact message fetched successfully', {
      correlationId,
      route: '/api/admin/contact/[id]',
      id,
    });

    return withRequestMeta(ok(message), { correlationId });
  } catch (error) {
    logger.error('Unhandled error fetching admin contact message', {
      correlationId,
      route: '/api/admin/contact/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin contact update attempt', {
        correlationId,
        route: '/api/admin/contact/[id]',
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

    const contentType = req.headers.get('content-type') ?? '';
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

    const { id: rawId } = await params;
    const id = normalizeId(rawId);

    if (!id) {
      return withRequestMeta(
        fail('ID da mensagem é obrigatório.', {
          status: 400,
          code: 'INVALID_ID',
          correlationId,
        }),
        { correlationId },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
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

    const parsed = patchBodySchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('Invalid admin contact patch payload', {
        correlationId,
        route: '/api/admin/contact/[id]',
        issues: parsed.error.flatten(),
      });

      return withRequestMeta(
        validationError(parsed.error.flatten(), correlationId),
        { correlationId },
      );
    }

    const status = parsed.data.status;

    const existing = await prisma.contactMessage.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
        readAt: true,
        archivedAt: true,
      },
    });

    if (!existing) {
      logger.warn('Admin contact message not found on update', {
        correlationId,
        route: '/api/admin/contact/[id]',
        id,
      });

      return withRequestMeta(
        notFound('Mensagem não encontrada.', correlationId),
        { correlationId },
      );
    }

    let readAt = existing.readAt;
    let archivedAt = existing.archivedAt;

    if (status === ContactMessageStatus.NOVA) {
      readAt = null;
      archivedAt = null;
    }

    if (
      status === ContactMessageStatus.LIDA ||
      status === ContactMessageStatus.RESPONDIDA
    ) {
      readAt = existing.readAt ?? new Date();
      archivedAt = null;
    }

    if (status === ContactMessageStatus.ARQUIVADA) {
      readAt = existing.readAt ?? new Date();
      archivedAt = new Date();
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status,
        readAt,
        archivedAt,
      },
      select: {
        id: true,
        status: true,
        readAt: true,
        archivedAt: true,
        updatedAt: true,
      },
    });

    logger.info('Admin contact message updated successfully', {
      correlationId,
      route: '/api/admin/contact/[id]',
      id,
      status,
    });

    return withRequestMeta(ok(updated), { correlationId });
  } catch (error) {
    logger.error('Unhandled error updating admin contact message', {
      correlationId,
      route: '/api/admin/contact/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin contact delete attempt', {
        correlationId,
        route: '/api/admin/contact/[id]',
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

    const { id: rawId } = await params;
    const id = normalizeId(rawId);

    if (!id) {
      return withRequestMeta(
        fail('ID da mensagem é obrigatório.', {
          status: 400,
          code: 'INVALID_ID',
          correlationId,
        }),
        { correlationId },
      );
    }

    const existing = await prisma.contactMessage.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      logger.warn('Admin contact message not found on delete', {
        correlationId,
        route: '/api/admin/contact/[id]',
        id,
      });

      return withRequestMeta(
        notFound('Mensagem não encontrada.', correlationId),
        { correlationId },
      );
    }

    const deleted = await prisma.contactMessage.update({
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

    logger.info('Admin contact message soft-deleted successfully', {
      correlationId,
      route: '/api/admin/contact/[id]',
      id,
    });

    return withRequestMeta(ok(deleted), { correlationId });
  } catch (error) {
    logger.error('Unhandled error deleting admin contact message', {
      correlationId,
      route: '/api/admin/contact/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

