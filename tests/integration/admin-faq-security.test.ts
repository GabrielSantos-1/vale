import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/admin/faq/route';

const {
  requireAdminMock,
  faqCreateMock,
  auditCreateMock,
} = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  faqCreateMock: vi.fn(),
  auditCreateMock: vi.fn(),
}));

vi.mock('@/lib/api/admin', () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    fAQ: {
      create: faqCreateMock,
      findMany: vi.fn(),
    },
    auditLog: {
      create: auditCreateMock,
    },
  },
}));

describe('admin faq POST security', () => {
  beforeEach(() => {
    requireAdminMock.mockReset();
    faqCreateMock.mockReset();
    auditCreateMock.mockReset();

    requireAdminMock.mockResolvedValue({
      user: { id: 'admin-1', role: 'admin' },
    });

    faqCreateMock.mockResolvedValue({
      id: 'faq_1',
      question: 'Q',
      answer: 'A',
      category: null,
      order: 0,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    auditCreateMock.mockResolvedValue({ id: 'audit_1' });
  });

  it('rejects mutation without csrf header token', async () => {
    const token = 'csrf-token-1';
    const req = new Request('http://localhost/api/admin/faq', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost',
        cookie: `vv_csrf_token=${token}`,
      },
      body: JSON.stringify({
        question: 'Pergunta',
        answer: 'Resposta',
        isPublished: true,
      }),
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(403);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('CSRF_VALIDATION_FAILED');
    expect(faqCreateMock).not.toHaveBeenCalled();
  });

  it('accepts mutation with valid csrf token pair', async () => {
    const token = 'csrf-token-1';
    const req = new Request('http://localhost/api/admin/faq', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost',
        cookie: `vv_csrf_token=${token}`,
        'x-csrf-token': token,
      },
      body: JSON.stringify({
        question: 'Pergunta',
        answer: 'Resposta',
        isPublished: true,
      }),
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(faqCreateMock).toHaveBeenCalledTimes(1);
  });
});
