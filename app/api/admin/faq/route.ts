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
import { sanitizeOptionalString, sanitizeString } from '@/lib/security/sanitize';
import { faqSchema } from '@/lib/validations/faq';

const FAQ_JSON_LIMIT_BYTES = 8 * 1024;

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
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

    const items = await prisma.fAQ.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
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

    return withRequestMeta(ok(items), { correlationId });
  } catch (error) {
    logger.error('Unhandled error fetching admin FAQ list', {
      correlationId,
      route: '/api/admin/faq',
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
      route: '/api/admin/faq',
      entity: 'FAQ',
    });

    if (csrfFailure) return csrfFailure;

    const parsedBody = await parseAdminJsonBody(req, {
      maxBytes: FAQ_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = faqSchema.parse(parsedBody.data);
    const normalized = normalizeFaqInput(parsed);

    const createdItem = await prisma.fAQ.create({
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
      action: 'ADMIN_FAQ_CREATED',
      entity: 'FAQ',
      entityId: createdItem.id,
      metadata: {
        correlationId,
        route: '/api/admin/faq',
        isPublished: createdItem.isPublished,
      },
    });

    return withRequestMeta(created(createdItem), { correlationId });
  } catch (error) {
    if (error instanceof ZodError) {
      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId },
      );
    }

    logger.error('Unhandled error creating admin FAQ', {
      correlationId,
      route: '/api/admin/faq',
      error,
    });

    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}
