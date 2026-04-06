import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/api/admin';
import { logger } from '@/lib/security/logger';
import { fail, internalError, ok } from '@/lib/security/response';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { getAlertConfig, getAlertRuntimeSnapshot } from '@/lib/observability/alerts';
import {
  aggregateObservabilityMetrics,
  parseMetricsView,
  type ObservabilityAuditEntry,
} from '@/lib/observability/metrics';

const OBSERVABILITY_ACTIONS = [
  'PUBLIC_EVENT_TRACKED',
  'PUBLIC_API_RATE_LIMITED',
  'PUBLIC_API_ERROR',
] as const;

type AuditLogFindManyModel = {
  findMany: (args: {
    where: {
      action: {
        in: string[];
      };
    };
    select: {
      action: true;
      createdAt: true;
      metadataJson: true;
    };
    orderBy: {
      createdAt: 'asc';
    };
  }) => Promise<ObservabilityAuditEntry[]>;
};

function deriveAlertHealthStatus(params: {
  totalRateLimited: number;
  totalErrors: number;
  rateLimitWarning: number;
  rateLimitCritical: number;
  errorWarning: number;
  errorCritical: number;
}) {
  if (
    params.totalRateLimited >= params.rateLimitCritical ||
    params.totalErrors >= params.errorCritical
  ) {
    return 'critical' as const;
  }

  if (
    params.totalRateLimited >= params.rateLimitWarning ||
    params.totalErrors >= params.errorWarning
  ) {
    return 'warning' as const;
  }

  return 'stable' as const;
}

export async function GET(request: Request) {
  const correlationId = getCorrelationId(request);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized observability metrics access attempt', {
        correlationId,
        route: '/api/admin/metrics/observability',
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
    const view = parseMetricsView(searchParams.get('view'));
    const now = new Date();

    const auditLogModel = (prisma as unknown as {
      auditLog?: AuditLogFindManyModel;
    }).auditLog;

    const records = auditLogModel?.findMany
      ? ((await auditLogModel.findMany({
          where: {
            action: {
              in: OBSERVABILITY_ACTIONS as unknown as string[],
            },
          },
          select: {
            action: true,
            createdAt: true,
            metadataJson: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        })) as ObservabilityAuditEntry[])
      : [];

    const aggregated = aggregateObservabilityMetrics({
      entries: records,
      view,
      now,
    });
    const alertConfig = getAlertConfig();
    const alertRuntime = getAlertRuntimeSnapshot();
    const alertHealthStatus = deriveAlertHealthStatus({
      totalRateLimited: aggregated.summary.publicRateLimited,
      totalErrors: aggregated.summary.publicErrors,
      rateLimitWarning: alertConfig.thresholds.rateLimit.warning,
      rateLimitCritical: alertConfig.thresholds.rateLimit.critical,
      errorWarning: alertConfig.thresholds.error.warning,
      errorCritical: alertConfig.thresholds.error.critical,
    });

    logger.info('Admin observability metrics fetched successfully', {
      correlationId,
      route: '/api/admin/metrics/observability',
      view,
      totalEvents: aggregated.summary.totalEvents,
      totalErrors: aggregated.summary.totalErrors,
      totalRateLimited: aggregated.summary.totalRateLimited,
    });

    return withRequestMeta(
      ok(aggregated.points, {
        summary: aggregated.summary,
        calibration: {
          windowMinutes: alertConfig.windowMinutes,
          cooldownSeconds: alertConfig.cooldownSeconds,
          enabled: alertConfig.enabled,
          hasWebhookUrl: alertConfig.hasWebhookUrl,
          thresholds: alertConfig.thresholds,
        },
        alertHealth: {
          status: alertHealthStatus,
          dispatched: alertRuntime.dispatched,
          suppressed: alertRuntime.suppressed,
          lastDispatchedByKey: alertRuntime.lastDispatchedByKey,
          lastSuppressedByKey: alertRuntime.lastSuppressedByKey,
        },
      }),
      { correlationId },
    );
  } catch (error) {
    logger.error('Unhandled error fetching admin observability metrics', {
      correlationId,
      route: '/api/admin/metrics/observability',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}
