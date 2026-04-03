import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';
import {
  getAlertConfig,
  sendOperationalAlert,
} from '@/lib/observability/alerts';

type AuditAction =
  | 'PUBLIC_EVENT_TRACKED'
  | 'PUBLIC_API_RATE_LIMITED'
  | 'PUBLIC_API_ERROR';

type BaseMetadata = {
  route: string;
  correlationId: string;
  timestamp: string;
  [key: string]: unknown;
};

function getAuditLogModel() {
  return (prisma as unknown as { auditLog?: { create: Function; findMany: Function } })
    .auditLog;
}

export function sanitizeOperationalText(
  value: unknown,
  {
    maxLength,
  }: {
    maxLength: number;
  },
) {
  if (typeof value !== 'string') return undefined;
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact) return undefined;
  return compact.slice(0, maxLength);
}

async function persistOperationalAudit(params: {
  action: AuditAction;
  entity: string;
  metadata: BaseMetadata;
}) {
  const auditLogModel = getAuditLogModel();
  if (!auditLogModel?.create) return;

  try {
    await auditLogModel.create({
      data: {
        actorUserId: null,
        action: params.action,
        entity: params.entity,
        entityId: null,
        metadataJson: params.metadata as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.error('Failed to persist operational audit log', {
      action: params.action,
      entity: params.entity,
      route: params.metadata.route,
      error,
    });
  }
}

async function countRecentActionByRoute(params: {
  action: AuditAction;
  route: string;
  windowMinutes: number;
}) {
  const auditLogModel = getAuditLogModel();
  if (!auditLogModel?.findMany) return 0;

  const since = new Date(Date.now() - params.windowMinutes * 60 * 1000);

  const records = (await auditLogModel.findMany({
    where: {
      action: params.action,
      createdAt: {
        gte: since,
      },
    },
    select: {
      metadataJson: true,
    },
  })) as Array<{ metadataJson?: unknown }>;

  return records.filter((record) => {
    const metadata = record.metadataJson as Record<string, unknown> | null;
    if (!metadata || typeof metadata !== 'object') return false;
    return metadata.route === params.route;
  }).length;
}

export async function recordPublicEventTracked(params: {
  eventName: string;
  page: string;
  component: string;
  status?: string;
  correlationId: string;
  timestamp: string;
}) {
  await persistOperationalAudit({
    action: 'PUBLIC_EVENT_TRACKED',
    entity: 'public_event',
    metadata: {
      route: '/api/events',
      correlationId: params.correlationId,
      timestamp: params.timestamp,
      eventName: sanitizeOperationalText(params.eventName, { maxLength: 80 }),
      page: sanitizeOperationalText(params.page, { maxLength: 120 }),
      component: sanitizeOperationalText(params.component, { maxLength: 80 }),
      status: sanitizeOperationalText(params.status, { maxLength: 40 }),
    },
  });
}

export async function recordPublicApiRateLimited(params: {
  route: string;
  correlationId: string;
}) {
  const timestamp = new Date().toISOString();
  const route =
    sanitizeOperationalText(params.route, { maxLength: 120 }) ?? 'unknown';

  await persistOperationalAudit({
    action: 'PUBLIC_API_RATE_LIMITED',
    entity: 'public_api',
    metadata: {
      route,
      correlationId: params.correlationId,
      timestamp,
    },
  });

  const config = getAlertConfig();
  const windowMinutes = config.windowMinutes;
  const total = await countRecentActionByRoute({
    action: 'PUBLIC_API_RATE_LIMITED',
    route,
    windowMinutes,
  });

  await sendOperationalAlert({
    kind: 'rate_limit_spike',
    route,
    count: total,
    correlationId: params.correlationId,
  });
}

export async function recordPublicApiError(params: {
  route: string;
  correlationId: string;
  category?: string;
}) {
  const timestamp = new Date().toISOString();
  const route =
    sanitizeOperationalText(params.route, { maxLength: 120 }) ?? 'unknown';

  await persistOperationalAudit({
    action: 'PUBLIC_API_ERROR',
    entity: 'public_api',
    metadata: {
      route,
      correlationId: params.correlationId,
      timestamp,
      category: sanitizeOperationalText(params.category, { maxLength: 80 }),
    },
  });

  const config = getAlertConfig();
  const windowMinutes = config.windowMinutes;
  const total = await countRecentActionByRoute({
    action: 'PUBLIC_API_ERROR',
    route,
    windowMinutes,
  });

  await sendOperationalAlert({
    kind: 'error_spike',
    route,
    count: total,
    correlationId: params.correlationId,
  });
}
