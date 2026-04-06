import { compare, hash } from "bcryptjs";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { parseClientJsonBody, requireClient } from "@/lib/api/client";
import { prisma } from "@/lib/db/prisma";
import { logAudit } from "@/lib/security/audit";
import { logger } from "@/lib/security/logger";
import { getCorrelationId, withRequestMeta } from "@/lib/security/request-meta";
import { fail, internalError, ok, validationError } from "@/lib/security/response";
import { buildRateLimitKey, rateLimit } from "@/lib/security/rate-limit";
import { clientChangePasswordSchema } from "@/lib/validations/client-password";

const CLIENT_CHANGE_PASSWORD_JSON_LIMIT_BYTES = 8 * 1024;

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function POST(req: NextRequest) {
  const correlationId = getCorrelationId(req);

  try {
    const session = await requireClient(req);
    if (!session?.id) {
      return withRequestMeta(
        fail("Nao autenticado.", {
          status: 401,
          code: "UNAUTHORIZED",
          correlationId,
        }),
        { correlationId }
      );
    }

    const rl = await rateLimit({
      key: buildRateLimitKey("client_password_change", req),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rl.ok) {
      return withRequestMeta(
        fail("Muitas tentativas. Tente novamente mais tarde.", {
          status: 429,
          code: "RATE_LIMITED",
          correlationId,
        }),
        { correlationId, rl }
      );
    }

    const parsedBody = await parseClientJsonBody(req, {
      maxBytes: CLIENT_CHANGE_PASSWORD_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = clientChangePasswordSchema.parse(parsedBody.data);

    const client = await prisma.clientUser.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!client || !client.isActive) {
      return withRequestMeta(
        fail("Nao autenticado.", {
          status: 401,
          code: "UNAUTHORIZED",
          correlationId,
        }),
        { correlationId, rl }
      );
    }

    const isCurrentPasswordValid = await compare(
      parsed.currentPassword,
      client.passwordHash
    );

    if (!isCurrentPasswordValid) {
      await logAudit({
        actorUserId: client.id,
        action: "CLIENT_PASSWORD_CHANGE_FAILED",
        entity: "ClientUser",
        entityId: client.id,
        metadata: {
          correlationId,
          reason: "invalid_current_password",
        },
      });

      return withRequestMeta(
        fail("Credenciais invalidas.", {
          status: 400,
          code: "INVALID_CREDENTIALS",
          correlationId,
        }),
        { correlationId, rl }
      );
    }

    const nextPasswordHash = await hash(parsed.newPassword, 12);

    await prisma.clientUser.update({
      where: { id: client.id },
      data: {
        passwordHash: nextPasswordHash,
      },
    });

    await logAudit({
      actorUserId: client.id,
      action: "CLIENT_PASSWORD_CHANGED",
      entity: "ClientUser",
      entityId: client.id,
      metadata: {
        correlationId,
      },
    });

    return withRequestMeta(
      ok({ message: "Senha atualizada com sucesso." }),
      { correlationId, rl }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId }
      );
    }

    logger.error("Unhandled error on client password change route", {
      correlationId,
      route: "/api/client/password/change",
      error,
    });
    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}

