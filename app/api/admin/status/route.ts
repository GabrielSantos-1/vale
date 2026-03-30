import { ZodError } from 'zod';

import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/api/admin';
import { logger } from '@/lib/security/logger';
import {
  created,
  fail,
  internalError,
  ok,
  validationError,
} from '@/lib/security/response';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import {
  normalizeSlug,
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';
import statusSchema from '@/lib/validations/status';

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

    const parsed = statusSchema.parse(body);

    const data = {
      title: sanitizeString(parsed.title, { maxLength: 160 }),
      slug: normalizeSlug(parsed.slug),
      status: parsed.status,
      description: sanitizeOptionalString(parsed.description, {
        maxLength: 2000,
      }),
      startedAt: parsed.startedAt ?? null,
      resolvedAt: parsed.resolvedAt ?? null,
      isVisible: parsed.isVisible,
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
