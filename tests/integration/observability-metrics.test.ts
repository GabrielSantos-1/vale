import { expect, test, vi } from 'vitest';

import { GET } from '../../app/api/admin/metrics/observability/route';

const { requireAdminMock, findManyMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock('@/lib/api/admin', () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    auditLog: {
      findMany: findManyMock,
    },
  },
}));

test('observability metrics returns 401 without admin session', async () => {
  requireAdminMock.mockReset();
  findManyMock.mockReset();
  requireAdminMock.mockResolvedValueOnce(null);

  const req = new Request('http://localhost/api/admin/metrics/observability');
  const res = await GET(req as any);
  const body = await res.json();

  expect(res.status).toBe(401);
  expect(body.success).toBe(false);
  expect(body.error?.code).toBe('UNAUTHORIZED');
});

test('observability metrics returns aggregated payload for admin', async () => {
  requireAdminMock.mockReset();
  findManyMock.mockReset();
  requireAdminMock.mockResolvedValueOnce({
    user: { role: 'ADMIN' },
  });

  findManyMock.mockResolvedValueOnce([
    {
      action: 'PUBLIC_EVENT_TRACKED',
      createdAt: new Date('2026-04-03T10:00:00.000Z'),
      metadataJson: { route: '/api/events' },
    },
    {
      action: 'PUBLIC_API_RATE_LIMITED',
      createdAt: new Date('2026-04-03T10:10:00.000Z'),
      metadataJson: { route: '/api/leads' },
    },
    {
      action: 'PUBLIC_API_ERROR',
      createdAt: new Date('2026-04-03T10:15:00.000Z'),
      metadataJson: { route: '/api/contact' },
    },
  ]);

  const req = new Request(
    'http://localhost/api/admin/metrics/observability?view=daily',
  );
  const res = await GET(req as any);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.success).toBe(true);
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.meta?.summary?.totalEvents).toBe(1);
  expect(body.meta?.summary?.totalRateLimited).toBe(1);
  expect(body.meta?.summary?.totalErrors).toBe(1);
});
