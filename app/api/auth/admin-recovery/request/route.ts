import { ZodError } from 'zod';
import { createHash } from 'crypto';

import { logger } from '@/lib/security/logger';
import { ok, fail, internalError, validationError } from '@/lib/security/response';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { normalizeEmail } from '@/lib/security/sanitize';
import { adminRecoveryRequestSchema } from '@/lib/validations/admin-recovery';
import {
  createRecoveryToken,
  findRecoverableAdminByEmail,
  getRecoveryTokenExpiryDate,
  invalidateOpenRecoveryTokens,
  recordRecoveryAudit,
  sendRecoveryEmail,
  storeRecoveryToken,
} from '@/lib/auth/admin-recovery';

const REQUEST_RATE_LIMIT = {
  limit: 3,
  windowMs: 15 * 60 * 1000,
} as const;

const GENERIC_RESPONSE_MESSAGE =
  'Se o e-mail estiver cadastrado, enviaremos instruções para recuperação.';

function hashForRateLimit(email: string) {
  return createHash('sha256').update(email).digest('hex').slice(0, 24);
}

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withRequestMeta(
      fail('JSON inválido.', {
        status: 400,
        code: 'INVALID_JSON',
        correlationId,
      }),
      { correlationId },
    );
  }

  try {
    const parsed = adminRecoveryRequestSchema.parse(body);
    const normalizedEmail = normalizeEmail(parsed.email);

    const rl = await rateLimit({
      key: `${buildRateLimitKey('admin-recovery-request', req)}:${hashForRateLimit(normalizedEmail)}`,
      limit: REQUEST_RATE_LIMIT.limit,
      windowMs: REQUEST_RATE_LIMIT.windowMs,
    });

    if (!rl.ok) {
      logger.warn('Rate limit hit on admin recovery request route', {
        correlationId,
        route: '/api/auth/admin-recovery/request',
        limit: rl.limit,
        remaining: rl.remaining,
        resetAt: rl.resetAt,
      });

      return withRequestMeta(
        fail('Muitas solicitações. Tente novamente mais tarde.', {
          status: 429,
          code: 'RATE_LIMITED',
          correlationId,
        }),
        { correlationId, rl },
      );
    }

    const adminUser = await findRecoverableAdminByEmail(normalizedEmail);

    if (!adminUser) {
      await recordRecoveryAudit({
        actorUserId: null,
        action: 'ADMIN_PASSWORD_RECOVERY_REQUESTED',
        metadata: {
          correlationId,
          accountMatched: false,
        },
      });

      return withRequestMeta(ok({ message: GENERIC_RESPONSE_MESSAGE }), {
        correlationId,
        rl,
      });
    }

    await invalidateOpenRecoveryTokens(adminUser.id);

    const tokenData = createRecoveryToken();
    const expiresAt = getRecoveryTokenExpiryDate();

    await storeRecoveryToken({
      adminUserId: adminUser.id,
      tokenHash: tokenData.tokenHash,
      expiresAt,
      requestedIp: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
      requestedUserAgent: req.headers.get('user-agent'),
    });

    const emailSent = await sendRecoveryEmail({
      to: adminUser.email,
      name: adminUser.name,
      token: tokenData.plainToken,
    });

    await recordRecoveryAudit({
      actorUserId: adminUser.id,
      action: 'ADMIN_PASSWORD_RECOVERY_REQUESTED',
      entityId: adminUser.id,
      metadata: {
        correlationId,
        accountMatched: true,
        emailSent,
      },
    });

    return withRequestMeta(ok({ message: GENERIC_RESPONSE_MESSAGE }), {
      correlationId,
      rl,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId },
      );
    }

    logger.error('Unhandled error on admin recovery request route', {
      correlationId,
      route: '/api/auth/admin-recovery/request',
      error,
    });
    return withRequestMeta(ok({ message: GENERIC_RESPONSE_MESSAGE }), {
      correlationId,
    });
  }
}
