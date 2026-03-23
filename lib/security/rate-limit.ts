type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  retryAfter: number;
};

const store = new Map<string, RateLimitEntry>();

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

export function rateLimit({
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
