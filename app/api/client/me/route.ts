import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { requireClient, parseClientJsonBody } from "@/lib/api/client";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/security/logger";
import { getCorrelationId, withRequestMeta } from "@/lib/security/request-meta";
import { fail, internalError, ok, validationError } from "@/lib/security/response";
import { buildRateLimitKey, rateLimit } from "@/lib/security/rate-limit";
import { sanitizeOptionalString, sanitizeString } from "@/lib/security/sanitize";
import { clientProfileUpdateSchema } from "@/lib/validations/client-profile";

const CLIENT_PROFILE_JSON_LIMIT_BYTES = 8 * 1024;

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function GET(req: NextRequest) {
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

    const client = await prisma.clientUser.findUnique({
      where: { id: session.id },
      select: {
        name: true,
        email: true,
        phone: true,
        cpfCnpj: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!client) {
      return withRequestMeta(
        fail("Cliente nao encontrado.", {
          status: 404,
          code: "NOT_FOUND",
          correlationId,
        }),
        { correlationId }
      );
    }

    return withRequestMeta(
      ok({
        name: sanitizeString(client.name, { maxLength: 120 }),
        email: sanitizeString(client.email, {
          maxLength: 160,
          collapseWhitespace: false,
        }),
        phone: sanitizeOptionalString(client.phone, { maxLength: 20 }),
        cpfCnpj: sanitizeOptionalString(client.cpfCnpj, { maxLength: 20 }),
        isActive: client.isActive,
        createdAt: client.createdAt.toISOString(),
      }),
      { correlationId }
    );
  } catch (error) {
    logger.error("Unhandled error fetching client profile", {
      correlationId,
      route: "/api/client/me",
      error,
    });
    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}

export async function PATCH(req: NextRequest) {
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
      key: buildRateLimitKey("client_profile_update", req),
      limit: 10,
      windowMs: 60 * 1000,
    });

    if (!rl.ok) {
      return withRequestMeta(
        fail("Muitas tentativas. Tente novamente em alguns segundos.", {
          status: 429,
          code: "RATE_LIMITED",
          correlationId,
        }),
        { correlationId, rl }
      );
    }

    const parsedBody = await parseClientJsonBody(req, {
      maxBytes: CLIENT_PROFILE_JSON_LIMIT_BYTES,
      correlationId,
    });

    if (!parsedBody.ok) return parsedBody.response;

    const parsed = clientProfileUpdateSchema.parse(parsedBody.data);

    const updated = await prisma.clientUser.update({
      where: { id: session.id },
      data: {
        ...(parsed.name !== undefined
          ? { name: sanitizeString(parsed.name, { maxLength: 120 }) }
          : {}),
        ...(parsed.phone !== undefined
          ? { phone: sanitizeOptionalString(parsed.phone, { maxLength: 20 }) }
          : {}),
        ...(parsed.cpfCnpj !== undefined
          ? { cpfCnpj: sanitizeOptionalString(parsed.cpfCnpj, { maxLength: 20 }) }
          : {}),
      },
      select: {
        name: true,
        email: true,
        phone: true,
        cpfCnpj: true,
        isActive: true,
        createdAt: true,
      },
    });

    return withRequestMeta(
      ok({
        name: sanitizeString(updated.name, { maxLength: 120 }),
        email: sanitizeString(updated.email, {
          maxLength: 160,
          collapseWhitespace: false,
        }),
        phone: sanitizeOptionalString(updated.phone, { maxLength: 20 }),
        cpfCnpj: sanitizeOptionalString(updated.cpfCnpj, { maxLength: 20 }),
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
      }),
      { correlationId, rl }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return withRequestMeta(
        validationError(formatValidationErrors(error), correlationId),
        { correlationId }
      );
    }

    logger.error("Unhandled error updating client profile", {
      correlationId,
      route: "/api/client/me",
      error,
    });
    return withRequestMeta(internalError(correlationId), { correlationId });
  }
}
