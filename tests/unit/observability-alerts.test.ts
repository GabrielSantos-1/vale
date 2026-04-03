import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  resetAlertCooldownForTests,
  sendOperationalAlert,
} from '@/lib/observability/alerts';

describe('observability alerts', () => {
  beforeEach(() => {
    process.env.OBS_ALERT_ENABLED = 'false';
    process.env.OBS_ALERT_WEBHOOK_URL = '';
    process.env.OBS_ALERT_COOLDOWN_SECONDS = '300';
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
      threshold: 5,
      windowMinutes: 5,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('respects cooldown and avoids duplicate alerts', async () => {
    process.env.OBS_ALERT_ENABLED = 'true';
    process.env.OBS_ALERT_WEBHOOK_URL = 'https://example.com/webhook';
    process.env.OBS_ALERT_COOLDOWN_SECONDS = '300';

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await sendOperationalAlert({
      kind: 'rate_limit_spike',
      route: '/api/leads',
      count: 25,
      threshold: 20,
      windowMinutes: 5,
    });

    await sendOperationalAlert({
      kind: 'rate_limit_spike',
      route: '/api/leads',
      count: 30,
      threshold: 20,
      windowMinutes: 5,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
