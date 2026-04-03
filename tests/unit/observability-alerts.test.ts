import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getAlertConfig,
  getAlertRuntimeSnapshot,
  resetAlertCooldownForTests,
  sendOperationalAlert,
} from '@/lib/observability/alerts';

describe('observability alerts', () => {
  beforeEach(() => {
    process.env.OBS_ALERT_ENABLED = 'false';
    process.env.OBS_ALERT_WEBHOOK_URL = '';
    process.env.OBS_ALERT_COOLDOWN_SECONDS = '300';
    delete process.env.OBS_ALERT_WINDOW_MINUTES;
    delete process.env.OBS_ALERT_RATE_LIMIT_THRESHOLD_WARNING;
    delete process.env.OBS_ALERT_RATE_LIMIT_THRESHOLD_CRITICAL;
    delete process.env.OBS_ALERT_ERROR_THRESHOLD_WARNING;
    delete process.env.OBS_ALERT_ERROR_THRESHOLD_CRITICAL;
    delete process.env.OBS_ALERT_RATE_LIMIT_THRESHOLD;
    delete process.env.OBS_ALERT_ERROR_THRESHOLD;
    resetAlertCooldownForTests();
    vi.unstubAllGlobals();
  });

  it('does not call webhook when alerts are disabled', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await sendOperationalAlert({
      kind: 'error_spike',
      route: '/api/events',
      count: 10,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('respects cooldown and avoids duplicate alerts per severity', async () => {
    process.env.OBS_ALERT_ENABLED = 'true';
    process.env.OBS_ALERT_WEBHOOK_URL = 'https://example.com/webhook';
    process.env.OBS_ALERT_COOLDOWN_SECONDS = '300';
    process.env.OBS_ALERT_RATE_LIMIT_THRESHOLD_WARNING = '12';
    process.env.OBS_ALERT_RATE_LIMIT_THRESHOLD_CRITICAL = '20';

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await sendOperationalAlert({
      kind: 'rate_limit_spike',
      route: '/api/leads',
      count: 12,
    });

    await sendOperationalAlert({
      kind: 'rate_limit_spike',
      route: '/api/leads',
      count: 15,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await sendOperationalAlert({
      kind: 'rate_limit_spike',
      route: '/api/leads',
      count: 20,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('resolves new threshold envs and keeps legacy fallback compatibility', () => {
    process.env.OBS_ALERT_RATE_LIMIT_THRESHOLD = '25';
    process.env.OBS_ALERT_ERROR_THRESHOLD = '11';
    process.env.OBS_ALERT_WINDOW_MINUTES = '7';

    const fallbackConfig = getAlertConfig();
    expect(fallbackConfig.windowMinutes).toBe(7);
    expect(fallbackConfig.thresholds.rateLimit.critical).toBe(25);
    expect(fallbackConfig.thresholds.error.critical).toBe(11);

    process.env.OBS_ALERT_RATE_LIMIT_THRESHOLD_WARNING = '9';
    process.env.OBS_ALERT_RATE_LIMIT_THRESHOLD_CRITICAL = '13';
    process.env.OBS_ALERT_ERROR_THRESHOLD_WARNING = '4';
    process.env.OBS_ALERT_ERROR_THRESHOLD_CRITICAL = '8';

    const config = getAlertConfig();
    expect(config.thresholds.rateLimit.warning).toBe(9);
    expect(config.thresholds.rateLimit.critical).toBe(13);
    expect(config.thresholds.error.warning).toBe(4);
    expect(config.thresholds.error.critical).toBe(8);
  });

  it('tracks suppression in runtime snapshot', async () => {
    process.env.OBS_ALERT_ENABLED = 'true';
    process.env.OBS_ALERT_WEBHOOK_URL = 'https://example.com/webhook';
    process.env.OBS_ALERT_COOLDOWN_SECONDS = '300';
    process.env.OBS_ALERT_ERROR_THRESHOLD_WARNING = '2';
    process.env.OBS_ALERT_ERROR_THRESHOLD_CRITICAL = '4';

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await sendOperationalAlert({
      kind: 'error_spike',
      route: '/api/contact',
      count: 2,
    });

    await sendOperationalAlert({
      kind: 'error_spike',
      route: '/api/contact',
      count: 3,
    });

    const snapshot = getAlertRuntimeSnapshot();
    expect(snapshot.dispatched.total).toBe(1);
    expect(snapshot.suppressed.total).toBe(1);
  });
});
