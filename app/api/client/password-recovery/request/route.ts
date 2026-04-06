import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { parseClientJsonBody } from "@/lib/api/client";
import {
  issueClientRecoveryToken,
  sendClientRecoveryEmail,
} from "@/lib/auth/client-recovery";
import { prisma } from "@/lib/db/prisma";
import { logAudit } from "@/lib/security/audit";
import { logger } from "@/lib/security/logger";
import { getCorrelationId, withRequestMeta } from "@/lib/security/request-meta";
import { fail, ok, validationError } from "@/lib/security/response";
import { buildRateLimitKey, rateLimit } from "@/lib/security/rate-limit";
import { normalizeEmail } from "@/lib/security/sanitize";
import { clientRecoveryRequestSchema } from "@/lib/validations/client-password";

const CLIENT_RECOVERY_REQUEST_JSON_LIMIT_BYTES = 4 * 1024;
const GENERIC_RECOVERY_MESSAGE =
  "Se o e-mail estiver cadastrado, enviaremos instrucoes para recuperacao.";

function hashForRateLimit(email: string) {
  return createHash("sha256").update(email).digest("hex").slice(0, 24);
}

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function POST(req: NextRequest) {
  const correlationId = getCorrelationId(req);

  const rl = await rateLimit({
    key: buildRateLimitKey("client_password_recovery_request", req),
    limit: 3,
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
      maxBytes: CLIENT_RECOVERY_REQUEST_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = clientRecoveryRequestSchema.parse(parsedBody.data);
    const email = normalizeEmail(parsed.email);

    const emailRl = await rateLimit({
      key: `${buildRateLimitKey("client_password_recovery_request_email", req)}:${hashForRateLimit(email)}`,
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (!emailRl.ok) {
      return withRequestMeta(
        fail("Muitas solicitacoes. Tente novamente mais tarde.", {
          status: 429,
          code: "RATE_LIMITED",
          correlationId,
        }),
        { correlationId, rl: emailRl }
      );
    }

    const client = await prisma.clientUser.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (client && client.isActive) {
      const { token } = issueClientRecoveryToken(client.id);
      const emailSent = await sendClientRecoveryEmail({
        email: client.email,
        token,
      });

      await logAudit({
        actorUserId: client.id,
        action: "CLIENT_PASSWORD_RECOVERY_REQUESTED",
        entity: "ClientUser",
        entityId: client.id,
        metadata: {
          correlationId,
          emailSent,
        },
      });
    } else {
      await logAudit({
        actorUserId: null,
        action: "CLIENT_PASSWORD_RECOVERY_REQUESTED",
        entity: "ClientUser",
        entityId: null,
        metadata: {
          correlationId,
          accountMatched: false,
        },
      });
    }

    return withRequestMeta(
      ok({ message: GENERIC_RECOVERY_MESSAGE }),
      { correlationId, rl: emailRl }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId, rl }
      );
    }

    logger.error("Unhandled error on client recovery request route", {
      correlationId,
      route: "/api/client/password-recovery/request",
      error,
    });

    return withRequestMeta(
      ok({ message: GENERIC_RECOVERY_MESSAGE }),
      { correlationId, rl }
    );
  }
}

