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
import {
  normalizeSlug,
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';
import statusSchema from '@/lib/validations/status';

const STATUS_JSON_LIMIT_BYTES = 8 * 1024;

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export async function GET(req: Request) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin status list access attempt', {
        correlationId,
        route: '/api/admin/status',
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

    const items = await prisma.networkStatus.findMany({
      orderBy: { createdAt: 'desc' },
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

    logger.info('Admin network status list fetched successfully', {
      correlationId,
      route: '/api/admin/status',
      total: items.length,
    });

    return withRequestMeta(ok(items), { correlationId });
  } catch (error) {
    logger.error('Unhandled error fetching admin network status list', {
      correlationId,
      route: '/api/admin/status',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin status create attempt', {
        correlationId,
        route: '/api/admin/status',
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
      route: '/api/admin/status',
      entity: 'NetworkStatus',
    });

    if (csrfFailure) return csrfFailure;

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

    const createdItem = await prisma.networkStatus.create({
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

    logger.info('Admin network status created successfully', {
      correlationId,
      route: '/api/admin/status',
      id: createdItem.id,
      slug: createdItem.slug,
      status: createdItem.status,
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_NETWORK_STATUS_CREATED',
      entity: 'NetworkStatus',
      entityId: createdItem.id,
      metadata: {
        correlationId,
        route: '/api/admin/status',
        status: createdItem.status,
      },
    });

    return withRequestMeta(created(createdItem), { correlationId });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Invalid admin status create payload', {
        correlationId,
        route: '/api/admin/status',
        issues: error.flatten(),
      });

      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId },
      );
    }

    logger.error('Unhandled error creating admin network status', {
      correlationId,
      route: '/api/admin/status',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

