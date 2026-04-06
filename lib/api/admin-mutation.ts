import type { Session } from 'next-auth';

import {
  JsonBodyParseError,
  parseJsonBodyWithLimit,
} from '@/lib/security/json-body';
import { logger } from '@/lib/security/logger';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';
import { fail } from '@/lib/security/response';
import { verifyCsrf } from '@/lib/security/csrf';
import { getSessionActorUserId, logAudit } from '@/lib/security/audit';

type AdminMutationGuardOptions = {
  req: Request;
  session: Session;
  correlationId: string;
  route: string;
  entity: string;
};

export async function enforceAdminCsrf({
  req,
  session,
  correlationId,
  route,
  entity,
}: AdminMutationGuardOptions) {
  const csrf = verifyCsrf(req);
  if (csrf.ok) return null;

  const actorUserId = getSessionActorUserId(session);

  logger.warn('CSRF validation failed on admin mutation', {
    correlationId,
    route,
    entity,
    reason: csrf.reason,
    actorUserId,
  });

  await logAudit({
    actorUserId,
    action: 'ADMIN_CSRF_BLOCKED',
    entity,
    metadata: {
      correlationId,
      route,
      reason: csrf.reason,
    },
  });

  return withRequestMeta(
    fail('Falha de validação CSRF.', {
      status: 403,
      code: 'CSRF_VALIDATION_FAILED',
      correlationId,
    }),
    { correlationId },
  );
}

type ParseBodySuccess<T> = {
  ok: true;
  data: T;
};

type ParseBodyFailure = {
  ok: false;
  response: Response;
};

export async function parseAdminJsonBody<T = unknown>(
  req: Request,
  {
    maxBytes,
    correlationId = getCorrelationId(req),
  }: { maxBytes: number; correlationId?: string },
): Promise<ParseBodySuccess<T> | ParseBodyFailure> {
  try {
    const parsed = await parseJsonBodyWithLimit<T>(req, {
      maxBytes,
      requireJsonContentType: true,
    });

    return {
      ok: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof JsonBodyParseError) {
      const status =
        error.code === 'UNSUPPORTED_MEDIA_TYPE'
          ? 415
          : error.code === 'PAYLOAD_TOO_LARGE'
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
          { correlationId },
        ),
      };
    }

    logger.error('Unexpected error while parsing admin JSON body', {
      correlationId,
      error,
    });

    return {
      ok: false,
      response: withRequestMeta(
        fail('JSON inválido.', {
          status: 400,
          code: 'INVALID_JSON',
          correlationId,
        }),
        { correlationId },
      ),
    };
  }
}
