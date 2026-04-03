import { describe, expect, it } from 'vitest';

import { sanitizeOperationalText } from '@/lib/observability/audit';

describe('observability metadata sanitization', () => {
  it('normalizes whitespace and trims oversized values', () => {
    const value = sanitizeOperationalText('   rota    com   espacos   ', {
      maxLength: 8,
    });

    expect(value).toBe('rota com');
  });

  it('returns undefined for invalid text input', () => {
    const value = sanitizeOperationalText(123, { maxLength: 8 });
    expect(value).toBeUndefined();
  });
});
