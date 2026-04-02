export type JsonBodyParseErrorCode =
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  | 'INVALID_JSON';

export class JsonBodyParseError extends Error {
  readonly code: JsonBodyParseErrorCode;

  constructor(code: JsonBodyParseErrorCode, message: string) {
    super(message);
    this.name = 'JsonBodyParseError';
    this.code = code;
  }
}

type ParseJsonBodyOptions = {
  maxBytes: number;
  requireJsonContentType?: boolean;
};

function getUtf8ByteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

export async function parseJsonBodyWithLimit<T = unknown>(
  req: Request,
  options: ParseJsonBodyOptions,
) {
  const { maxBytes, requireJsonContentType = true } = options;

  if (requireJsonContentType) {
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new JsonBodyParseError(
        'UNSUPPORTED_MEDIA_TYPE',
        'Content-Type inválido.',
      );
    }
  }

  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);

    if (!Number.isFinite(contentLength) || contentLength > maxBytes) {
      throw new JsonBodyParseError(
        'PAYLOAD_TOO_LARGE',
        'Payload excede o tamanho permitido.',
      );
    }
  }

  const rawBody = await req.text();
  if (!rawBody.trim()) {
    throw new JsonBodyParseError('INVALID_JSON', 'JSON inválido.');
  }

  if (getUtf8ByteLength(rawBody) > maxBytes) {
    throw new JsonBodyParseError(
      'PAYLOAD_TOO_LARGE',
      'Payload excede o tamanho permitido.',
    );
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    throw new JsonBodyParseError('INVALID_JSON', 'JSON inválido.');
  }
}
