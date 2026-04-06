import { NextRequest } from "next/server";

import {
  JsonBodyParseError,
  parseJsonBodyWithLimit,
} from "@/lib/security/json-body";
import { logger } from "@/lib/security/logger";
import { getCorrelationId, withRequestMeta } from "@/lib/security/request-meta";
import { fail } from "@/lib/security/response";
import { getClientSession } from "@/lib/auth/client-session";

export async function requireClient(req: NextRequest) {
  return getClientSession({
    cookies: {
      get: (name: string) => req.cookies.get(name),
    },
  });
}

type ParseBodySuccess<T> = {
  ok: true;
  data: T;
};

type ParseBodyFailure = {
  ok: false;
  response: Response;
};

export async function parseClientJsonBody<T = unknown>(
  req: Request,
  {
    maxBytes,
    correlationId = getCorrelationId(req),
  }: { maxBytes: number; correlationId?: string }
): Promise<ParseBodySuccess<T> | ParseBodyFailure> {
  try {
    const parsed = await parseJsonBodyWithLimit<T>(req, {
      maxBytes,
      requireJsonContentType: true,
    });

    return { ok: true, data: parsed };
  } catch (error) {
    if (error instanceof JsonBodyParseError) {
      const status =
        error.code === "UNSUPPORTED_MEDIA_TYPE"
          ? 415
          : error.code === "PAYLOAD_TOO_LARGE"
            ? 413
            : 400;

      return {
        ok: false,
        response: withRequestMeta(
          fail(error.message, {
            status,
            code: error.code,
            correlationId,
          }),
          { correlationId }
        ),
      };
    }

    logger.error("Unexpected error while parsing client JSON body", {
      correlationId,
      error,
    });

    return {
      ok: false,
      response: withRequestMeta(
        fail("JSON invalido.", {
          status: 400,
          code: "INVALID_JSON",
          correlationId,
        }),
        { correlationId }
      ),
    };
  }
}
