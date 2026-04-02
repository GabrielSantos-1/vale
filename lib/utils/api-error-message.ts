type ApiErrorPayload =
  | {
      success?: boolean;
      error?: unknown;
    }
  | null
  | undefined;

function normalizeErrorItem(item: unknown): string | null {
  if (typeof item === 'string') return item;

  if (item && typeof item === 'object') {
    const maybeMessage = (item as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
  }

  return null;
}

export function extractApiErrorMessage(
  payload: ApiErrorPayload,
  fallback: string,
): string {
  if (!payload || typeof payload !== 'object') return fallback;

  const { error } = payload;

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (Array.isArray(error)) {
    for (const item of error) {
      const message = normalizeErrorItem(item);
      if (message) return message;
    }
  }

  if (error && typeof error === 'object') {
    const message = normalizeErrorItem(error);
    if (message) return message;
  }

  return fallback;
}
