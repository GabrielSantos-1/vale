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
import { sanitizeOptionalString, sanitizeString } from '@/lib/security/sanitize';
import { faqSchema } from '@/lib/validations/faq';

type Context = {
  params: Promise<{ id: string }>;
};

const FAQ_JSON_LIMIT_BYTES = 8 * 1024;

function normalizeFaqId(value: string) {
  const sanitized = sanitizeString(value, {
    maxLength: 64,
    collapseWhitespace: false,
  });

  return sanitized.length > 0 ? sanitized : null;
}

function normalizeFaqInput(input: {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isPublished?: boolean;
}) {
  return {
    question: sanitizeString(input.question, { maxLength: 240 }),
    answer: sanitizeString(input.answer, { maxLength: 4000 }),
    category: sanitizeOptionalString(input.category, { maxLength: 120 }),
    order: input.order ?? 0,
    isPublished: input.isPublished ?? false,
  };
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
      route: '/api/admin/faq/[id]',
      entity: 'FAQ',
    });

    if (csrfFailure) return csrfFailure;

    const { id: rawId } = await context.params;
    const id = normalizeFaqId(rawId);

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
      maxBytes: FAQ_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = faqSchema.parse(parsedBody.data);
    const normalized = normalizeFaqInput(parsed);

    const updated = await prisma.fAQ.update({
      where: { id },
      data: normalized,
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        order: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_FAQ_UPDATED',
      entity: 'FAQ',
      entityId: updated.id,
      metadata: {
        correlationId,
        route: '/api/admin/faq/[id]',
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
      error.code === 'P2025'
    ) {
      return withRequestMeta(notFound('FAQ não encontrada.', correlationId), {
        correlationId,
      });
    }

    logger.error('Unhandled error updating admin FAQ', {
      correlationId,
      route: '/api/admin/faq/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}

export async function DELETE(req: Request, context: Context) {
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
      route: '/api/admin/faq/[id]',
      entity: 'FAQ',
    });

    if (csrfFailure) return csrfFailure;

    const { id: rawId } = await context.params;
    const id = normalizeFaqId(rawId);

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

    await prisma.fAQ.delete({
      where: { id },
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_FAQ_DELETED',
      entity: 'FAQ',
      entityId: id,
      metadata: {
        correlationId,
        route: '/api/admin/faq/[id]',
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
      return withRequestMeta(notFound('FAQ não encontrada.', correlationId), {
        correlationId,
      });
    }

    logger.error('Unhandled error deleting admin FAQ', {
      correlationId,
      route: '/api/admin/faq/[id]',
      error,
    });

    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}
