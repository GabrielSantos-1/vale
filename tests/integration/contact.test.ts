import { test, expect } from 'vitest';
import { POST } from '../../app/api/contact/route';

test('contact POST returns success', async () => {
  const req = new Request('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify({ name: 'a', email: 'a@a.com', message: 'hi' }),
    headers: { 'Content-Type': 'application/json' },
  });
  const res = await POST(req as any);
  const data = await res.json();
  expect(data.success).toBe(true);
});
