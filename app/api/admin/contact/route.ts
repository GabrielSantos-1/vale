import { NextRequest } from 'next/server';
import { ContactMessageStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

import { requireAdmin } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { fail, internalError, ok } from '@/lib/security/response';
import {
  sanitizeOptionalString,
  sanitizeString,
} from '@/lib/security/sanitize';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const allowedStatusValues = [
  'ALL',
  ...Object.values(ContactMessageStatus),
] as const;

const querySchema = z.object({
  status: z.enum(allowedStatusValues).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

function parsePositiveInt(value: number | undefined, fallback: number) {
  if (!value || !Number.isInteger(value) || value <= 0) return fallback;
  return value;
}

export async function GET(req: NextRequest) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin contact list access attempt', {
        correlationId,
        route: '/api/admin/contact',
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

    const { searchParams } = new URL(req.url);

    const parsed = querySchema.safeParse({
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      logger.warn('Invalid admin contact query params', {
        correlationId,
        route: '/api/admin/contact',
        issues: parsed.error.flatten(),
      });

      return withRequestMeta(
        fail('Parâmetros inválidos.', {
          status: 400,
          code: 'INVALID_QUERY_PARAMS',
          correlationId,
        }),
        { correlationId },
      );
    }

    const normalizedStatus =
      parsed.data.status && parsed.data.status !== 'ALL'
        ? (sanitizeString(parsed.data.status, {
            maxLength: 40,
            collapseWhitespace: false,
          }) as ContactMessageStatus)
        : undefined;

    const search = sanitizeOptionalString(parsed.data.search, {
      maxLength: 160,
    });

    const page = parsePositiveInt(parsed.data.page, DEFAULT_PAGE);
    const limit = Math.min(
      parsePositiveInt(parsed.data.limit, DEFAULT_LIMIT),
      MAX_LIMIT,
    );
    const skip = (page - 1) * limit;

    const where: Prisma.ContactMessageWhereInput = {
      deletedAt: null,
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { message: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.contactMessage.count({ where }),
    ]);

    logger.info('Admin contact list fetched successfully', {
      correlationId,
      route: '/api/admin/contact',
      page,
      limit,
      total,
      status: normalizedStatus ?? 'ALL',
      hasSearch: Boolean(search),
    });

    return withRequestMeta(
      ok(data, {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }),
      { correlationId },
    );
  } catch (error) {
    logger.error('Unhandled error fetching admin contact list', {
      correlationId,
      route: '/api/admin/contact',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

