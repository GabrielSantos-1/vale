import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/api/admin';
import { logger } from '@/lib/security/logger';
import { fail, internalError, ok } from '@/lib/security/response';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';

type MetricsView = 'daily' | 'weekly' | 'monthly';

type MetricsPoint = {
  label: string;
  value: number;
  date: string;
};

const ALLOWED_VIEWS: MetricsView[] = ['daily', 'weekly', 'monthly'];

function subDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function parseView(value: string | null): MetricsView {
  if (!value) return 'daily';
  return ALLOWED_VIEWS.includes(value as MetricsView)
    ? (value as MetricsView)
    : 'daily';
}

function getWeekStart(date: Date) {
  const result = startOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function buildDailyPoints(now: Date) {
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const days = 7;
  const startDate = startOfDay(subDays(now, days - 1));
  const buckets = new Map<string, MetricsPoint>();

  for (let i = 0; i < days; i++) {
    const current = startOfDay(subDays(now, days - 1 - i));
    const key = formatDateKey(current);

    buckets.set(key, {
      date: key,
      label: dayLabels[current.getDay()],
      value: 0,
    });
  }

  return {
    startDate,
    buckets,
    rangeLabel: 'Ãšltimos 7 dias',
  };
}

function buildWeeklyPoints(now: Date) {
  const weeks = 8;
  const currentWeekStart = getWeekStart(now);
  const startDate = new Date(currentWeekStart);
  startDate.setDate(currentWeekStart.getDate() - (weeks - 1) * 7);
  startDate.setHours(0, 0, 0, 0);

  const buckets = new Map<string, MetricsPoint>();

  for (let i = 0; i < weeks; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i * 7);
    current.setHours(0, 0, 0, 0);

    const key = formatDateKey(current);

    buckets.set(key, {
      date: key,
      label: `S${i + 1}`,
      value: 0,
    });
  }

  return {
    startDate,
    buckets,
    rangeLabel: 'Ãšltimas 8 semanas',
  };
}

function buildMonthlyPoints(now: Date) {
  const months = 6;
  const currentMonthStart = getMonthStart(now);
  const startDate = new Date(
    currentMonthStart.getFullYear(),
    currentMonthStart.getMonth() - (months - 1),
    1,
  );
  startDate.setHours(0, 0, 0, 0);

  const monthLabels = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  const buckets = new Map<string, MetricsPoint>();

  for (let i = 0; i < months; i++) {
    const current = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + i,
      1,
    );
    current.setHours(0, 0, 0, 0);

    const key = formatDateKey(current);

    buckets.set(key, {
      date: key,
      label: monthLabels[current.getMonth()],
      value: 0,
    });
  }

  return {
    startDate,
    buckets,
    rangeLabel: 'Ãšltimos 6 meses',
  };
}

export async function GET(request: Request) {
  const correlationId = getCorrelationId(request);

  try {
    const session = await requireAdmin();

    if (!session) {
      logger.warn('Unauthorized admin metrics access attempt', {
        correlationId,
        route: '/api/admin/metrics/leads',
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
    const view = parseView(searchParams.get('view'));
    const now = new Date();

    const config =
      view === 'weekly'
        ? buildWeeklyPoints(now)
        : view === 'monthly'
          ? buildMonthlyPoints(now)
          : buildDailyPoints(now);

    const leads = await prisma.lead.findMany({
      where: {
        deletedAt: null,
        createdAt: {
          gte: config.startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    for (const lead of leads) {
      const created = new Date(lead.createdAt);

      let bucketKey = '';

      if (view === 'daily') {
        bucketKey = formatDateKey(created);
      } else if (view === 'weekly') {
        bucketKey = formatDateKey(getWeekStart(created));
      } else {
        bucketKey = formatDateKey(getMonthStart(created));
      }

      const bucket = config.buckets.get(bucketKey);

      if (bucket) {
        bucket.value += 1;
      }
    }

    const points = Array.from(config.buckets.values());
    const total = points.reduce((sum, item) => sum + item.value, 0);
    const max = points.reduce(
      (highest, item) => Math.max(highest, item.value),
      0,
    );
    const average =
      points.length > 0 ? Number((total / points.length).toFixed(1)) : 0;

    logger.info('Admin leads metrics fetched successfully', {
      correlationId,
      route: '/api/admin/metrics/leads',
      view,
      points: points.length,
      total,
    });

    return withRequestMeta(
      ok(points, {
        summary: {
          view,
          total,
          max,
          average,
          rangeLabel: config.rangeLabel,
        },
      }),
      { correlationId },
    );
  } catch (error) {
    logger.error('Unhandled error fetching admin leads metrics', {
      correlationId,
      route: '/api/admin/metrics/leads',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

