import { NextRequest } from 'next/server';
import { LeadStatus, Prisma } from '@prisma/client';

import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/api/admin';
import { logger } from '@/lib/security/logger';
import { fail, internalError, ok } from '@/lib/security/response';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { sanitizeString } from '@/lib/security/sanitize';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_QUERY_LENGTH = 100;

const SORT_FIELDS = ['createdAt', 'name', 'status'] as const;
type SortField = (typeof SORT_FIELDS)[number];
type SortOrder = 'asc' | 'desc';

function isValidLeadStatus(value: string | null): value is LeadStatus {
  if (!value) return false;
  return Object.values(LeadStatus).includes(value as LeadStatus);
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;

  return parsed;
}

function parseSortField(value: string | null): SortField {
  if (!value) return 'createdAt';
  return SORT_FIELDS.includes(value as SortField)
    ? (value as SortField)
    : 'createdAt';
}

function parseSortOrder(value: string | null): SortOrder {
  return value === 'asc' ? 'asc' : 'desc';
}

function parseSearchQuery(value: string | null) {
  if (!value) return '';

  return sanitizeString(value, {
    maxLength: MAX_QUERY_LENGTH,
    collapseWhitespace: true,
  });
}

function buildOrderBy(
  sort: SortField,
  order: SortOrder,
): Prisma.LeadOrderByWithRelationInput {
  if (sort === 'name') {
    return { name: order };
  }

  if (sort === 'status') {
    return { status: order };
  }

  return { createdAt: order };
}

function buildSearchFilter(query: string): Prisma.LeadWhereInput | undefined {
  if (!query) return undefined;

  return {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query, mode: 'insensitive' } },
      { city: { contains: query, mode: 'insensitive' } },
      { district: { contains: query, mode: 'insensitive' } },
    ],
  };
}

export async function GET(request: NextRequest) {
  const correlationId = getCorrelationId(request);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin leads access attempt', {
        correlationId,
        route: '/api/admin/leads',
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

    const { searchParams } = new URL(request.url);

    const statusParam = searchParams.get('status');
    const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
    const pageSize = Math.min(
      parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE,
    );
    const q = parseSearchQuery(searchParams.get('q'));
    const sort = parseSortField(searchParams.get('sort'));
    const order = parseSortOrder(searchParams.get('order'));

    const whereClause: Prisma.LeadWhereInput = {
      deletedAt: null,
    };

    if (statusParam && statusParam !== 'ALL') {
      if (!isValidLeadStatus(statusParam)) {
        logger.warn('Invalid lead status filter', {
          correlationId,
          route: '/api/admin/leads',
          statusParam,
        });

        return withRequestMeta(
          fail('Status inválido.', {
            status: 400,
            code: 'INVALID_STATUS',
            correlationId,
          }),
          { correlationId },
        );
      }

      whereClause.status = statusParam;
    }

    const searchFilter = buildSearchFilter(q);
    if (searchFilter) {
      Object.assign(whereClause, searchFilter);
    }

    const orderBy = buildOrderBy(sort, order);

    const [
      total,
      leads,
      totalAll,
      totalNovo,
      totalEmAtendimento,
      totalConvertido,
      totalDescartado,
      totalArquivado,
    ] = await Promise.all([
      prisma.lead.count({
        where: whereClause,
      }),
      prisma.lead.findMany({
        where: whereClause,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
          deletedAt: true,
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
      }),
      prisma.lead.count({
        where: {
          deletedAt: null,
          ...(q ? buildSearchFilter(q) : {}),
        },
      }),
      prisma.lead.count({
        where: {
          deletedAt: null,
          status: LeadStatus.NOVO,
          ...(q ? buildSearchFilter(q) : {}),
        },
      }),
      prisma.lead.count({
        where: {
          deletedAt: null,
          status: LeadStatus.EM_ATENDIMENTO,
          ...(q ? buildSearchFilter(q) : {}),
        },
      }),
      prisma.lead.count({
        where: {
          deletedAt: null,
          status: LeadStatus.CONVERTIDO,
          ...(q ? buildSearchFilter(q) : {}),
        },
      }),
      prisma.lead.count({
        where: {
          deletedAt: null,
          status: LeadStatus.DESCARTADO,
          ...(q ? buildSearchFilter(q) : {}),
        },
      }),
      prisma.lead.count({
        where: {
          deletedAt: null,
          status: LeadStatus.ARQUIVADO,
          ...(q ? buildSearchFilter(q) : {}),
        },
      }),
    ]);

    logger.info('Admin leads fetched successfully', {
      correlationId,
      route: '/api/admin/leads',
      page,
      pageSize,
      total,
      status: statusParam ?? 'ALL',
      q: q || undefined,
      sort,
      order,
    });

    return withRequestMeta(
      ok(leads, {
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
        filters: {
          status: statusParam ?? 'ALL',
          q,
          sort,
          order,
        },
        counts: {
          ALL: totalAll,
          NOVO: totalNovo,
          EM_ATENDIMENTO: totalEmAtendimento,
          CONVERTIDO: totalConvertido,
          DESCARTADO: totalDescartado,
          ARQUIVADO: totalArquivado,
        },
      }),
      { correlationId },
    );
  } catch (error) {
    logger.error('Unhandled error fetching admin leads', {
      correlationId,
      route: '/api/admin/leads',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}
