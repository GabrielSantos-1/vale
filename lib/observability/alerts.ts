import { logger } from '@/lib/security/logger';

type OperationalAlertPayload = {
  kind: 'rate_limit_spike' | 'error_spike';
  route: string;
  count: number;
  correlationId?: string;
};

export type AlertSeverity = 'warning' | 'critical';

type ThresholdConfig = {
  warning: number;
  critical: number;
};

type AlertConfig = {
  enabled: boolean;
  hasWebhookUrl: boolean;
  webhookUrl: string;
  cooldownSeconds: number;
  windowMinutes: number;
  thresholds: {
    rateLimit: ThresholdConfig;
    error: ThresholdConfig;
  };
};

type AlertRuntimeEvent = {
  key: string;
  kind: OperationalAlertPayload['kind'];
  route: string;
  severity: AlertSeverity;
  count: number;
  threshold: number;
  windowMinutes: number;
  timestamp: string;
};

const alertCooldownState = new Map<string, number>();
const lastDispatchedByKey = new Map<string, AlertRuntimeEvent>();
const lastSuppressedByKey = new Map<string, AlertRuntimeEvent>();

const alertCounters = {
  dispatched: {
    warning: 0,
    critical: 0,
  },
  suppressed: {
    warning: 0,
    critical: 0,
  },
};

function isAlertEnabled() {
  return process.env.OBS_ALERT_ENABLED?.trim().toLowerCase() === 'true';
}

function getWebhookUrl() {
  return process.env.OBS_ALERT_WEBHOOK_URL?.trim() ?? '';
}

function toPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = value ? Number(value) : fallback;
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function getCooldownSeconds() {
  return toPositiveInteger(process.env.OBS_ALERT_COOLDOWN_SECONDS?.trim(), 300);
}

function getWindowMinutes() {
  return toPositiveInteger(process.env.OBS_ALERT_WINDOW_MINUTES?.trim(), 5);
}

function resolveThresholds(params: {
  warningKey: string;
  criticalKey: string;
  legacyKey: string;
  defaultCritical: number;
}) {
  const legacyCritical = toPositiveInteger(
    process.env[params.legacyKey]?.trim(),
    params.defaultCritical,
  );

  const critical = toPositiveInteger(
    process.env[params.criticalKey]?.trim(),
    legacyCritical,
  );

  const defaultWarning = Math.max(1, Math.floor(critical * 0.6));
  const warning = toPositiveInteger(
    process.env[params.warningKey]?.trim(),
    defaultWarning,
  );

  return {
    warning: Math.min(warning, critical),
    critical,
  } satisfies ThresholdConfig;
}

export function getAlertConfig(): AlertConfig {
  const webhookUrl = getWebhookUrl();
  return {
    enabled: isAlertEnabled(),
    hasWebhookUrl: Boolean(webhookUrl),
    webhookUrl,
    cooldownSeconds: getCooldownSeconds(),
    windowMinutes: getWindowMinutes(),
    thresholds: {
      rateLimit: resolveThresholds({
        warningKey: 'OBS_ALERT_RATE_LIMIT_THRESHOLD_WARNING',
        criticalKey: 'OBS_ALERT_RATE_LIMIT_THRESHOLD_CRITICAL',
        legacyKey: 'OBS_ALERT_RATE_LIMIT_THRESHOLD',
        defaultCritical: 20,
      }),
      error: resolveThresholds({
        warningKey: 'OBS_ALERT_ERROR_THRESHOLD_WARNING',
        criticalKey: 'OBS_ALERT_ERROR_THRESHOLD_CRITICAL',
        legacyKey: 'OBS_ALERT_ERROR_THRESHOLD',
        defaultCritical: 10,
      }),
    },
  };
}

function resolveSeverity(
  payload: OperationalAlertPayload,
  config: AlertConfig,
): { severity: AlertSeverity; threshold: number } | null {
  const thresholds =
    payload.kind === 'rate_limit_spike'
      ? config.thresholds.rateLimit
      : config.thresholds.error;

  if (payload.count >= thresholds.critical) {
    return {
      severity: 'critical',
      threshold: thresholds.critical,
    };
  }

  if (payload.count >= thresholds.warning) {
    return {
      severity: 'warning',
      threshold: thresholds.warning,
    };
  }

  return null;
}

function shouldSendByCooldown(key: string, nowMs: number, cooldownSeconds: number) {
  const cooldownMs = cooldownSeconds * 1000;
  const last = alertCooldownState.get(key);

  if (typeof last === 'number' && nowMs - last < cooldownMs) {
    return false;
  }

  alertCooldownState.set(key, nowMs);
  return true;
}

export async function sendOperationalAlert(payload: OperationalAlertPayload) {
  const config = getAlertConfig();
  if (!config.enabled) return;

  const severityInfo = resolveSeverity(payload, config);
  if (!severityInfo) return;

  if (!config.hasWebhookUrl) {
    logger.warn('Operational alert is enabled but webhook URL is missing', {
      hasWebhookUrl: false,
    });
    return;
  }

  const cooldownKey = `${payload.kind}:${payload.route}:${severityInfo.severity}`;
  const nowMs = Date.now();

  const runtimeEvent: AlertRuntimeEvent = {
    key: cooldownKey,
    kind: payload.kind,
    route: payload.route,
    severity: severityInfo.severity,
    count: payload.count,
    threshold: severityInfo.threshold,
    windowMinutes: config.windowMinutes,
    timestamp: new Date(nowMs).toISOString(),
  };

  if (!shouldSendByCooldown(cooldownKey, nowMs, config.cooldownSeconds)) {
    alertCounters.suppressed[severityInfo.severity] += 1;
    lastSuppressedByKey.set(cooldownKey, runtimeEvent);

    logger.info('Operational alert suppressed by cooldown', {
      key: cooldownKey,
      kind: payload.kind,
      route: payload.route,
      severity: severityInfo.severity,
      count: payload.count,
      threshold: severityInfo.threshold,
      cooldownSeconds: config.cooldownSeconds,
    });
    return;
  }

  const message = {
    source: 'verde-vale-observability',
    severity: severityInfo.severity,
    ...payload,
    threshold: severityInfo.threshold,
    windowMinutes: config.windowMinutes,
    timestamp: new Date(nowMs).toISOString(),
  };
  alertCounters.dispatched[severityInfo.severity] += 1;
  lastDispatchedByKey.set(cooldownKey, runtimeEvent);

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
      cache: 'no-store',
    });

    if (!response.ok) {
      logger.warn('Operational alert webhook rejected payload', {
        status: response.status,
        kind: payload.kind,
        route: payload.route,
        severity: severityInfo.severity,
      });
    }
  } catch (error) {
    logger.error('Operational alert webhook request failed', {
      kind: payload.kind,
      route: payload.route,
      severity: severityInfo.severity,
      error,
    });
  }
}

export function getAlertRuntimeSnapshot() {
  return {
    dispatched: {
      total: alertCounters.dispatched.warning + alertCounters.dispatched.critical,
      warning: alertCounters.dispatched.warning,
      critical: alertCounters.dispatched.critical,
    },
    suppressed: {
      total: alertCounters.suppressed.warning + alertCounters.suppressed.critical,
      warning: alertCounters.suppressed.warning,
      critical: alertCounters.suppressed.critical,
    },
    lastDispatchedByKey: Array.from(lastDispatchedByKey.values()),
    lastSuppressedByKey: Array.from(lastSuppressedByKey.values()),
  };
}

export function resetAlertCooldownForTests() {
  alertCooldownState.clear();
  lastDispatchedByKey.clear();
  lastSuppressedByKey.clear();
  alertCounters.dispatched.warning = 0;
  alertCounters.dispatched.critical = 0;
  alertCounters.suppressed.warning = 0;
  alertCounters.suppressed.critical = 0;
}
