import { logger } from '@/lib/security/logger';

type OperationalAlertPayload = {
  kind: 'rate_limit_spike' | 'error_spike';
  route: string;
  count: number;
  threshold: number;
  windowMinutes: number;
  correlationId?: string;
};

const alertCooldownState = new Map<string, number>();

function isAlertEnabled() {
  return process.env.OBS_ALERT_ENABLED?.trim().toLowerCase() === 'true';
}

function getWebhookUrl() {
  return process.env.OBS_ALERT_WEBHOOK_URL?.trim() ?? '';
}

function getCooldownSeconds() {
  const raw = process.env.OBS_ALERT_COOLDOWN_SECONDS?.trim();
  const parsed = raw ? Number(raw) : 300;

  if (!Number.isFinite(parsed) || parsed <= 0) return 300;
  return Math.floor(parsed);
}

function shouldSendByCooldown(key: string, nowMs: number) {
  const cooldownMs = getCooldownSeconds() * 1000;
  const last = alertCooldownState.get(key);

  if (typeof last === 'number' && nowMs - last < cooldownMs) {
    return false;
  }

  alertCooldownState.set(key, nowMs);
  return true;
}

export async function sendOperationalAlert(payload: OperationalAlertPayload) {
  if (!isAlertEnabled()) return;

  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    logger.warn('Operational alert is enabled but webhook URL is missing', {
      hasWebhookUrl: false,
    });
    return;
  }

  const cooldownKey = `${payload.kind}:${payload.route}`;
  const nowMs = Date.now();

  if (!shouldSendByCooldown(cooldownKey, nowMs)) {
    return;
  }

  const message = {
    source: 'verde-vale-observability',
    severity: payload.kind === 'error_spike' ? 'critical' : 'warning',
    ...payload,
    timestamp: new Date(nowMs).toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
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
      });
    }
  } catch (error) {
    logger.error('Operational alert webhook request failed', {
      kind: payload.kind,
      route: payload.route,
      error,
    });
  }
}

export function resetAlertCooldownForTests() {
  alertCooldownState.clear();
}
