import { ContactMessageStatus } from '@prisma/client';
import { NextRequest } from 'next/server';
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

const CONTACT_JSON_LIMIT_BYTES = 4 * 1024;

const patchBodySchema = z
  .object({
    status: z.nativeEnum(ContactMessageStatus),
  })
  .strict();

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

    const csrfFailure = await enforceAdminCsrf({
      req,
      session,
      correlationId,
      route: '/api/admin/contact/[id]',
      entity: 'ContactMessage',
    });

    if (csrfFailure) return csrfFailure;

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

    const parsedBody = await parseAdminJsonBody(req, {
      maxBytes: CONTACT_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = patchBodySchema.safeParse(parsedBody.data);

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

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_CONTACT_MESSAGE_UPDATED',
      entity: 'ContactMessage',
      entityId: id,
      metadata: {
        correlationId,
        route: '/api/admin/contact/[id]',
        status,
      },
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

    const csrfFailure = await enforceAdminCsrf({
      req,
      session,
      correlationId,
      route: '/api/admin/contact/[id]',
      entity: 'ContactMessage',
    });

    if (csrfFailure) return csrfFailure;

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

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_CONTACT_MESSAGE_DELETED',
      entity: 'ContactMessage',
      entityId: id,
      metadata: {
        correlationId,
        route: '/api/admin/contact/[id]',
      },
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

