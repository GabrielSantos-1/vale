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
  normalizeCep,
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';
import coverageSchema from '@/lib/validations/coverage';

const COVERAGE_JSON_LIMIT_BYTES = 8 * 1024;

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
      logger.warn('Unauthorized admin coverage list access attempt', {
        correlationId,
        route: '/api/admin/coverage',
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

    const list = await prisma.coverageArea.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        city: true,
        district: true,
        cepStart: true,
        cepEnd: true,
        isAvailable: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('Admin coverage list fetched successfully', {
      correlationId,
      route: '/api/admin/coverage',
      total: list.length,
    });

    return withRequestMeta(ok(list), { correlationId });
  } catch (error) {
    logger.error('Unhandled error fetching admin coverage list', {
      correlationId,
      route: '/api/admin/coverage',
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
      logger.warn('Unauthorized admin coverage create attempt', {
        correlationId,
        route: '/api/admin/coverage',
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
      route: '/api/admin/coverage',
      entity: 'CoverageArea',
    });

    if (csrfFailure) return csrfFailure;

    const parsedBody = await parseAdminJsonBody(req, {
      maxBytes: COVERAGE_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = coverageSchema.parse(parsedBody.data);

    const data = {
      city: sanitizeString(parsed.city, { maxLength: 120 }),
      district: sanitizeString(parsed.district, { maxLength: 120 }),
      cepStart: normalizeCep(parsed.cepStart),
      cepEnd: normalizeCep(parsed.cepEnd),
      isAvailable: parsed.isAvailable,
      notes: sanitizeOptionalString(parsed.notes, {
        maxLength: 1000,
      }),
    };

    const createdItem = await prisma.coverageArea.create({
      data,
      select: {
        id: true,
        city: true,
        district: true,
        cepStart: true,
        cepEnd: true,
        isAvailable: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('Admin coverage area created successfully', {
      correlationId,
      route: '/api/admin/coverage',
      id: createdItem.id,
      city: createdItem.city,
      district: createdItem.district,
      isAvailable: createdItem.isAvailable,
    });

    await logAudit({
      actorUserId: getSessionActorUserId(session),
      action: 'ADMIN_COVERAGE_AREA_CREATED',
      entity: 'CoverageArea',
      entityId: createdItem.id,
      metadata: {
        correlationId,
        route: '/api/admin/coverage',
      },
    });

    return withRequestMeta(created(createdItem), { correlationId });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Invalid admin coverage create payload', {
        correlationId,
        route: '/api/admin/coverage',
        issues: error.flatten(),
      });

      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId },
      );
    }

    logger.error('Unhandled error creating admin coverage area', {
      correlationId,
      route: '/api/admin/coverage',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

