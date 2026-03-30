import { test, expect, vi } from 'vitest';
import { POST } from '../../app/api/contact/route';

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn().mockResolvedValue({ id: 'msg_1' }),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    contactMessage: {
      create: createMock,
    },
  },
}));

test('contact POST returns success', async () => {
  createMock.mockClear();

  const req = new Request('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Ana',
      email: 'ana@example.com',
      message: 'Mensagem de teste valida',
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  const res = await POST(req as any);
  const data = await res.json();

  expect(data.success).toBe(true);
  expect(createMock).toHaveBeenCalledTimes(1);
});
