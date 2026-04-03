import { ZodError } from 'zod';
import { compare, hash } from 'bcryptjs';

import { prisma } from '@/lib/db/prisma';
import { isAdminRole } from '@/lib/auth/roles';
import { hashRecoveryToken, recordRecoveryAudit } from '@/lib/auth/admin-recovery';
import { logger } from '@/lib/security/logger';
import { fail, internalError, ok, validationError } from '@/lib/security/response';
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { adminRecoveryResetSchema } from '@/lib/validations/admin-recovery';

const RESET_RATE_LIMIT = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
} as const;

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export async function POST(req: Request) {
  const correlationId = getCorrelationId(req);

  const rl = await rateLimit({
    key: buildRateLimitKey('admin-recovery-reset', req),
    limit: RESET_RATE_LIMIT.limit,
    windowMs: RESET_RATE_LIMIT.windowMs,
  });

  if (!rl.ok) {
    logger.warn('Rate limit hit on admin recovery reset route', {
      correlationId,
      route: '/api/auth/admin-recovery/reset',
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
      { correlationId, rl },
    );
  }

  try {
    const parsed = adminRecoveryResetSchema.parse(body);
    const now = new Date();
    const tokenHash = hashRecoveryToken(parsed.token);

    const recoveryTokenModel = (prisma as unknown as {
      adminPasswordRecoveryToken: any;
    }).adminPasswordRecoveryToken;

    const recoveryToken = await recoveryTokenModel.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        adminUserId: true,
        usedAt: true,
        expiresAt: true,
        adminUser: {
          select: {
            id: true,
            role: true,
            isActive: true,
            passwordHash: true,
          },
        },
      },
    });

    const isValidToken =
      recoveryToken &&
      !recoveryToken.usedAt &&
      recoveryToken.expiresAt > now &&
      recoveryToken.adminUser.isActive &&
      isAdminRole(recoveryToken.adminUser.role);

    if (!isValidToken) {
      await recordRecoveryAudit({
        actorUserId: recoveryToken?.adminUserId ?? null,
        action: 'ADMIN_PASSWORD_RECOVERY_RESET_FAILED',
        entityId: recoveryToken?.adminUserId ?? null,
        metadata: {
          correlationId,
          reason: 'invalid_or_expired_token',
        },
      });

      return withRequestMeta(
        fail('Token inválido ou expirado.', {
          status: 400,
          code: 'INVALID_OR_EXPIRED_TOKEN',
          correlationId,
        }),
        { correlationId, rl },
      );
    }

    const isSamePassword = await compare(
      parsed.newPassword,
      recoveryToken.adminUser.passwordHash,
    );

    if (isSamePassword) {
      return withRequestMeta(
        fail('A nova senha deve ser diferente da senha atual.', {
          status: 400,
          code: 'PASSWORD_REUSE_NOT_ALLOWED',
          correlationId,
        }),
        { correlationId, rl },
      );
    }

    const newPasswordHash = await hash(parsed.newPassword, 12);

    await prisma.$transaction(async (tx) => {
      const txRecoveryTokenModel = (tx as unknown as {
        adminPasswordRecoveryToken: any;
      }).adminPasswordRecoveryToken;

      await tx.adminUser.update({
        where: { id: recoveryToken.adminUserId },
        data: { passwordHash: newPasswordHash },
      });

      await txRecoveryTokenModel.update({
        where: { id: recoveryToken.id },
        data: { usedAt: now },
      });

      await txRecoveryTokenModel.updateMany({
        where: {
          adminUserId: recoveryToken.adminUserId,
          id: { not: recoveryToken.id },
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });
    });

    await recordRecoveryAudit({
      actorUserId: recoveryToken.adminUserId,
      action: 'ADMIN_PASSWORD_RECOVERY_RESET_SUCCESS',
      entityId: recoveryToken.adminUserId,
      metadata: {
        correlationId,
      },
    });

    return withRequestMeta(
      ok({ message: 'Senha redefinida com sucesso.' }),
      { correlationId, rl },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId, rl },
      );
    }

    logger.error('Unhandled error on admin recovery reset route', {
      correlationId,
      route: '/api/auth/admin-recovery/reset',
      error,
    });

    return withRequestMeta(internalError(correlationId), { correlationId, rl });
  }
}
