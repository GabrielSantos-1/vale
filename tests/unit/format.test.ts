import { it, expect } from 'vitest';
import { formatCurrency } from '../../lib/utils/format';

it('formats cents correctly', () => {
  expect(formatCurrency(12345)).toBe('123.45');
});
