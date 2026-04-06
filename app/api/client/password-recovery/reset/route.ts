import { compare, hash } from "bcryptjs";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { parseClientJsonBody } from "@/lib/api/client";
import { consumeClientRecoveryToken } from "@/lib/auth/client-recovery";
import { prisma } from "@/lib/db/prisma";
import { logAudit } from "@/lib/security/audit";
import { logger } from "@/lib/security/logger";
import { getCorrelationId, withRequestMeta } from "@/lib/security/request-meta";
import { fail, internalError, ok, validationError } from "@/lib/security/response";
import { buildRateLimitKey, rateLimit } from "@/lib/security/rate-limit";
import { clientRecoveryResetSchema } from "@/lib/validations/client-password";

const CLIENT_RECOVERY_RESET_JSON_LIMIT_BYTES = 8 * 1024;

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function POST(req: NextRequest) {
  const correlationId = getCorrelationId(req);

  const rl = await rateLimit({
    key: buildRateLimitKey("client_password_recovery_reset", req),
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rl.ok) {
    return withRequestMeta(
      fail("Muitas solicitacoes. Tente novamente mais tarde.", {
        status: 429,
        code: "RATE_LIMITED",
        correlationId,
      }),
      { correlationId, rl }
    );
  }

  try {
    const parsedBody = await parseClientJsonBody(req, {
      maxBytes: CLIENT_RECOVERY_RESET_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = clientRecoveryResetSchema.parse(parsedBody.data);
    const consumed = consumeClientRecoveryToken(parsed.token);

    if (!consumed) {
      await logAudit({
        actorUserId: null,
        action: "CLIENT_PASSWORD_RECOVERY_RESET_FAILED",
        entity: "ClientUser",
        entityId: null,
        metadata: {
          correlationId,
          reason: "invalid_or_expired_token",
        },
      });

      return withRequestMeta(
        fail("Token invalido ou expirado.", {
          status: 400,
          code: "INVALID_OR_EXPIRED_TOKEN",
          correlationId,
        }),
        { correlationId, rl }
      );
    }

    const client = await prisma.clientUser.findUnique({
      where: { id: consumed.clientUserId },
      select: {
        id: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!client || !client.isActive) {
      await logAudit({
        actorUserId: consumed.clientUserId,
        action: "CLIENT_PASSWORD_RECOVERY_RESET_FAILED",
        entity: "ClientUser",
        entityId: consumed.clientUserId,
        metadata: {
          correlationId,
          reason: "inactive_or_missing_user",
        },
      });

      return withRequestMeta(
        fail("Token invalido ou expirado.", {
          status: 400,
          code: "INVALID_OR_EXPIRED_TOKEN",
          correlationId,
        }),
        { correlationId, rl }
      );
    }

    const isSamePassword = await compare(parsed.newPassword, client.passwordHash);
    if (isSamePassword) {
      return withRequestMeta(
        fail("A nova senha deve ser diferente da senha atual.", {
          status: 400,
          code: "PASSWORD_REUSE_NOT_ALLOWED",
          correlationId,
        }),
        { correlationId, rl }
      );
    }

    const nextHash = await hash(parsed.newPassword, 12);

    await prisma.clientUser.update({
      where: { id: client.id },
      data: { passwordHash: nextHash },
    });

    await logAudit({
      actorUserId: client.id,
      action: "CLIENT_PASSWORD_RECOVERY_RESET_SUCCESS",
      entity: "ClientUser",
      entityId: client.id,
      metadata: {
        correlationId,
      },
    });

    return withRequestMeta(
      ok({ message: "Senha redefinida com sucesso." }),
      { correlationId, rl }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId, rl }
      );
    }

    logger.error("Unhandled error on client recovery reset route", {
      correlationId,
      route: "/api/client/password-recovery/reset",
      error,
    });
    return withRequestMeta(internalError(correlationId), { correlationId, rl });
  }
}

