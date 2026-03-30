// lib/security/sanitize.ts

type SanitizeStringOptions = {
  trim?: boolean;
  collapseWhitespace?: boolean;
  removeAngleBrackets?: boolean;
  removeControlChars?: boolean;
  maxLength?: number;
};

const DEFAULT_OPTIONS: Required<SanitizeStringOptions> = {
  trim: true,
  collapseWhitespace: true,
  removeAngleBrackets: true,
  removeControlChars: true,
  maxLength: 5000,
};

function isControlChar(codePoint: number): boolean {
  return (
    (codePoint >= 0x00 && codePoint <= 0x1f) ||
    (codePoint >= 0x7f && codePoint <= 0x9f)
  );
}

function stripControlChars(input: string): string {
  let output = '';

  for (const char of input) {
    const codePoint = char.codePointAt(0);

    if (codePoint == null || isControlChar(codePoint)) {
      continue;
    }

    output += char;
  }

  return output;
}

export function sanitizeString(
  input: string,
  options: SanitizeStringOptions = {},
): string {
  const config = { ...DEFAULT_OPTIONS, ...options };

  let value = input;

  if (config.removeControlChars) {
    value = stripControlChars(value);
  }

  if (config.removeAngleBrackets) {
    value = value.replace(/[<>]/g, '');
  }

  if (config.collapseWhitespace) {
    value = value.replace(/\s+/g, ' ');
  }

  if (config.trim) {
    value = value.trim();
  }

  if (config.maxLength > 0) {
    value = value.slice(0, config.maxLength);
  }

  return value;
}

export function sanitizeOptionalString(
  input: string | null | undefined,
  options?: SanitizeStringOptions,
): string | null {
  if (input == null) return null;

  const sanitized = sanitizeString(input, options);
  return sanitized.length > 0 ? sanitized : null;
}

export function normalizeEmail(email: string): string {
  return sanitizeString(email, {
    maxLength: 254,
    collapseWhitespace: false,
  }).toLowerCase();
}

export function normalizeSlug(slug: string): string {
  return sanitizeString(slug, {
    maxLength: 120,
    collapseWhitespace: false,
  })
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}

export function normalizePhone(phone: string): string {
  return sanitizeString(phone, {
    maxLength: 20,
    collapseWhitespace: false,
  }).replace(/\D/g, '');
}

export function normalizeCep(cep: string): string {
  return sanitizeString(cep, {
    maxLength: 8,
    collapseWhitespace: false,
  }).replace(/\D/g, '');
}
