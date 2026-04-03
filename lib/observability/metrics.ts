export type MetricsView = 'daily' | 'weekly' | 'monthly';

export type ObservabilityAuditEntry = {
  action: 'PUBLIC_EVENT_TRACKED' | 'PUBLIC_API_RATE_LIMITED' | 'PUBLIC_API_ERROR';
  createdAt: Date;
  metadataJson: unknown;
};

type MetricsPoint = {
  label: string;
  value: number;
  date: string;
};

type CriticalEvent = {
  action: string;
  route: string;
  timestamp: string;
};

export type ObservabilityMetricsResult = {
  points: MetricsPoint[];
  summary: {
    view: MetricsView;
    rangeLabel: string;
    totalEvents: number;
    totalRateLimited: number;
    totalErrors: number;
    errorRate: number;
    status: 'stable' | 'warning' | 'critical';
    rateLimitedByRoute: Record<string, number>;
    errorsByRoute: Record<string, number>;
    lastCriticalEvent: CriticalEvent | null;
  };
};

type WindowConfig = {
  startDate: Date;
  buckets: Map<string, MetricsPoint>;
  rangeLabel: string;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getWeekStart(date: Date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function buildDailyWindow(now: Date): WindowConfig {
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const days = 7;
  const startDate = startOfDay(new Date(now));
  startDate.setDate(startDate.getDate() - (days - 1));

  const buckets = new Map<string, MetricsPoint>();

  for (let i = 0; i < days; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
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
    rangeLabel: 'Ultimos 7 dias',
  };
}

function buildWeeklyWindow(now: Date): WindowConfig {
  const weeks = 8;
  const currentWeekStart = getWeekStart(now);
  const startDate = new Date(currentWeekStart);
  startDate.setDate(currentWeekStart.getDate() - (weeks - 1) * 7);
  startDate.setHours(0, 0, 0, 0);

  const buckets = new Map<string, MetricsPoint>();

  for (let i = 0; i < weeks; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i * 7);
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
    rangeLabel: 'Ultimas 8 semanas',
  };
}

function buildMonthlyWindow(now: Date): WindowConfig {
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
    rangeLabel: 'Ultimos 6 meses',
  };
}

export function parseMetricsView(value: string | null): MetricsView {
  if (value === 'weekly' || value === 'monthly' || value === 'daily') return value;
  return 'daily';
}

export function getWindowConfig(view: MetricsView, now = new Date()): WindowConfig {
  if (view === 'weekly') return buildWeeklyWindow(now);
  if (view === 'monthly') return buildMonthlyWindow(now);
  return buildDailyWindow(now);
}

function getRouteFromMetadata(metadataJson: unknown) {
  if (!metadataJson || typeof metadataJson !== 'object') return 'unknown';
  const route = (metadataJson as Record<string, unknown>).route;
  return typeof route === 'string' && route.trim() ? route.trim() : 'unknown';
}

function getBucketKey(view: MetricsView, date: Date) {
  if (view === 'weekly') return formatDateKey(getWeekStart(date));
  if (view === 'monthly') return formatDateKey(getMonthStart(date));
  return formatDateKey(date);
}

function deriveStatus(errorRate: number) {
  if (errorRate >= 15) return 'critical';
  if (errorRate >= 5) return 'warning';
  return 'stable';
}

export function aggregateObservabilityMetrics(params: {
  entries: ObservabilityAuditEntry[];
  view: MetricsView;
  now?: Date;
}): ObservabilityMetricsResult {
  const now = params.now ?? new Date();
  const { startDate, buckets, rangeLabel } = getWindowConfig(params.view, now);
  const rateLimitedByRoute: Record<string, number> = {};
  const errorsByRoute: Record<string, number> = {};

  let totalEvents = 0;
  let totalRateLimited = 0;
  let totalErrors = 0;
  let lastCriticalEvent: CriticalEvent | null = null;

  for (const entry of params.entries) {
    const createdAt = new Date(entry.createdAt);
    if (createdAt < startDate) continue;

    const bucketKey = getBucketKey(params.view, createdAt);
    const bucket = buckets.get(bucketKey);

    if (entry.action === 'PUBLIC_EVENT_TRACKED') {
      totalEvents += 1;
      if (bucket) {
        bucket.value += 1;
      }
      continue;
    }

    const route = getRouteFromMetadata(entry.metadataJson);

    if (entry.action === 'PUBLIC_API_RATE_LIMITED') {
      totalRateLimited += 1;
      rateLimitedByRoute[route] = (rateLimitedByRoute[route] ?? 0) + 1;
    } else if (entry.action === 'PUBLIC_API_ERROR') {
      totalErrors += 1;
      errorsByRoute[route] = (errorsByRoute[route] ?? 0) + 1;
      const timestamp = createdAt.toISOString();
      if (!lastCriticalEvent || timestamp > lastCriticalEvent.timestamp) {
        lastCriticalEvent = {
          action: entry.action,
          route,
          timestamp,
        };
      }
    }
  }

  const relevantTotal = totalEvents + totalRateLimited + totalErrors;
  const errorRate =
    relevantTotal > 0
      ? Number((((totalErrors + totalRateLimited) / relevantTotal) * 100).toFixed(1))
      : 0;

  return {
    points: Array.from(buckets.values()),
    summary: {
      view: params.view,
      rangeLabel,
      totalEvents,
      totalRateLimited,
      totalErrors,
      errorRate,
      status: deriveStatus(errorRate),
      rateLimitedByRoute,
      errorsByRoute,
      lastCriticalEvent,
    },
  };
}
