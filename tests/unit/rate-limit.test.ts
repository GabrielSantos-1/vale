import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { rateLimit } from '@/lib/security/rate-limit';

const ORIGINAL_ENV = { ...process.env };

function resetRateLimitEnv() {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.RATE_LIMIT_DRIVER;
  delete process.env.RATE_LIMIT_FAILOVER_TO_MEMORY;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimitEnv();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies memory driver and blocks after reaching limit', async () => {
    process.env.RATE_LIMIT_DRIVER = 'memory';

    const key = `memory-limit-${Date.now()}-${Math.random()}`;
    const first = await rateLimit({ key, limit: 2, windowMs: 1_000 });
    const second = await rateLimit({ key, limit: 2, windowMs: 1_000 });
    const third = await rateLimit({ key, limit: 2, windowMs: 1_000 });

    expect(first.ok).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.ok).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.ok).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it('resets memory window after expiration', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-03T12:00:00.000Z'));
    process.env.RATE_LIMIT_DRIVER = 'memory';

    const key = `memory-window-${Date.now()}-${Math.random()}`;
    const first = await rateLimit({ key, limit: 1, windowMs: 1_000 });
    const blocked = await rateLimit({ key, limit: 1, windowMs: 1_000 });

    vi.setSystemTime(new Date('2026-04-03T12:00:01.100Z'));
    const afterReset = await rateLimit({ key, limit: 1, windowMs: 1_000 });

    expect(first.ok).toBe(true);
    expect(blocked.ok).toBe(false);
    expect(afterReset.ok).toBe(true);
    expect(afterReset.remaining).toBe(0);
  });

  it('uses upstash driver result when configured', async () => {
    process.env.RATE_LIMIT_DRIVER = 'upstash';
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ result: 2 }, { result: 12_000 }, { result: 1 }],
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await rateLimit({
      key: `upstash-${Date.now()}-${Math.random()}`,
      limit: 2,
      windowMs: 60_000,
    });

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(0);
    expect(result.limit).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to fail-open when upstash is unavailable and failover is disabled', async () => {
    process.env.RATE_LIMIT_DRIVER = 'upstash';
    process.env.RATE_LIMIT_FAILOVER_TO_MEMORY = 'false';
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network unavailable')),
    );

    const result = await rateLimit({
      key: `upstash-fail-open-${Date.now()}-${Math.random()}`,
      limit: 5,
      windowMs: 60_000,
    });

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(4);
    expect(warnSpy).toHaveBeenCalled();
  });
});
