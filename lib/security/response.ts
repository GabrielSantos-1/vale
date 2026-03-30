// lib/security/response.ts

import { NextResponse } from 'next/server';

type SuccessMeta = Record<string, unknown> | undefined;

type ErrorOptions = {
  status?: number;
  code?: string;
  details?: unknown;
  correlationId?: string;
};

export function ok<T>(data: T, meta?: SuccessMeta) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status: 200 },
  );
}

export function created<T>(data: T, meta?: SuccessMeta) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status: 201 },
  );
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(message: string, options: ErrorOptions = {}) {
  const {
    status = 400,
    code = 'BAD_REQUEST',
    details,
    correlationId,
  } = options;

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
        ...(correlationId ? { correlationId } : {}),
      },
    },
    { status },
  );
}

export function internalError(correlationId?: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocorreu um erro interno.',
        ...(correlationId ? { correlationId } : {}),
      },
    },
    { status: 500 },
  );
}

export function unauthorized(
  message = 'Não autenticado.',
  correlationId?: string,
) {
  return fail(message, {
    status: 401,
    code: 'UNAUTHORIZED',
    correlationId,
  });
}

export function forbidden(message = 'Acesso negado.', correlationId?: string) {
  return fail(message, {
    status: 403,
    code: 'FORBIDDEN',
    correlationId,
  });
}

export function notFound(
  message = 'Recurso não encontrado.',
  correlationId?: string,
) {
  return fail(message, {
    status: 404,
    code: 'NOT_FOUND',
    correlationId,
  });
}

export function conflict(
  message = 'Conflito de recurso.',
  correlationId?: string,
) {
  return fail(message, {
    status: 409,
    code: 'CONFLICT',
    correlationId,
  });
}

export function validationError(details: unknown, correlationId?: string) {
  return fail('Dados inválidos.', {
    status: 422,
    code: 'VALIDATION_ERROR',
    details,
    correlationId,
  });
}
