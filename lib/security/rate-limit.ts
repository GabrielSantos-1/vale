import { logger } from '@/lib/security/logger';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  retryAfter: number;
};

const store = new Map<string, RateLimitEntry>();
const RATE_LIMIT_KEY_PREFIX = 'rl';

function now() {
  return Date.now();
}

function cleanupIfExpired(key: string, currentTime: number) {
  const entry = store.get(key);

  if (!entry) return null;

  if (currentTime >= entry.resetAt) {
    store.delete(key);
    return null;
  }

  return entry;
}

function resolveDriver() {
  const configuredDriver = process.env.RATE_LIMIT_DRIVER?.trim().toLowerCase();

  if (configuredDriver === 'upstash') return 'upstash';
  return 'memory';
}

function isFailoverToMemoryEnabled() {
  const raw = process.env.RATE_LIMIT_FAILOVER_TO_MEMORY;
  if (!raw) return true;

  return raw.trim().toLowerCase() === 'true';
}

function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeTtlMs(ttlMs: number | null, windowMs: number) {
  if (ttlMs === null || ttlMs <= 0) return windowMs;
  return ttlMs;
}

function asRateLimitResult({
  limit,
  count,
  windowMs,
  ttlMs,
}: {
  limit: number;
  count: number;
  windowMs: number;
  ttlMs: number | null;
}): RateLimitResult {
  const effectiveTtlMs = normalizeTtlMs(ttlMs, windowMs);
  const resetAt = now() + effectiveTtlMs;
  const retryAfter = Math.max(1, Math.ceil(effectiveTtlMs / 1000));

  if (count > limit) {
    return {
      ok: false,
      remaining: 0,
      limit,
      resetAt,
      retryAfter,
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - count),
    limit,
    resetAt,
    retryAfter,
  };
}

function rateLimitMemory({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const currentTime = now();
  const existing = cleanupIfExpired(key, currentTime);

  if (!existing) {
    const resetAt = currentTime + windowMs;

    store.set(key, {
      count: 1,
      resetAt,
    });

    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      limit,
      resetAt,
      retryAfter: Math.max(1, Math.ceil(windowMs / 1000)),
    };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      limit,
      resetAt: existing.resetAt,
      retryAfter: Math.max(
        1,
        Math.ceil((existing.resetAt - currentTime) / 1000),
      ),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    limit,
    resetAt: existing.resetAt,
    retryAfter: Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000)),
  };
}

async function rateLimitUpstash({
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Upstash driver configured but UPSTASH_REDIS_REST_URL/TOKEN is missing.',
    );
  }

  const redisKey = `${RATE_LIMIT_KEY_PREFIX}:${key}`;
  const endpoint = `${url.replace(/\/+$/, '')}/pipeline`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', redisKey],
      ['PTTL', redisKey],
      ['PEXPIRE', redisKey, String(windowMs), 'NX'],
    ]),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as
    | Array<{ result?: unknown; error?: unknown }>
    | undefined;

  if (!Array.isArray(payload) || payload.length < 2) {
    throw new Error('Unexpected Upstash response payload.');
  }

  const firstError = payload.find((entry) => entry?.error);
  if (firstError) {
    throw new Error('Upstash pipeline returned command error.');
  }

  const count = safeNumber(payload[0]?.result);
  const ttlMs = safeNumber(payload[1]?.result);

  if (count === null) {
    throw new Error('Upstash response missing INCR result.');
  }

  return asRateLimitResult({
    limit,
    count,
    windowMs,
    ttlMs,
  });
}

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const driver = resolveDriver();

  if (driver === 'memory') {
    return rateLimitMemory(options);
  }

  try {
    return await rateLimitUpstash(options);
  } catch (error) {
    logger.warn('Distributed rate limit unavailable; applying fail-open policy', {
      driver,
      fallbackToMemory: isFailoverToMemoryEnabled(),
      error,
    });

    if (isFailoverToMemoryEnabled()) {
      return rateLimitMemory(options);
    }

    return asRateLimitResult({
      limit: options.limit,
      count: 1,
      windowMs: options.windowMs,
      ttlMs: options.windowMs,
    });
  }
}

function normalizeIp(value: string | null | undefined) {
  if (!value) return null;

  const ip = value.trim();

  if (!ip) return null;

  if (ip === '::1') return '127.0.0.1';

  if (ip.startsWith('::ffff:')) {
    return ip.replace('::ffff:', '');
  }

  return ip;
}

export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    const normalized = normalizeIp(firstIp);
    if (normalized) return normalized;
  }

  const realIp = normalizeIp(req.headers.get('x-real-ip'));
  if (realIp) return realIp;

  return 'unknown';
}

export function buildRateLimitKey(prefix: string, req: Request) {
  const ip = getClientIp(req);
  return `${prefix}:${ip}`;
}
