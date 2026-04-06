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

function buildBaseHeaders(token: string) {
  return {
    origin: 'http://localhost',
    cookie: `vv_csrf_token=${token}`,
    'x-csrf-token': token,
  };
}

describe('security smoke suite for admin mutations', () => {
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

  it('rejects invalid content type', async () => {
    const token = 'csrf-token';
    const req = new Request('http://localhost/api/admin/faq', {
      method: 'POST',
      headers: {
        ...buildBaseHeaders(token),
        'content-type': 'text/plain',
      },
      body: 'invalid',
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(415);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('rejects payload too large', async () => {
    const token = 'csrf-token';
    const largeText = 'a'.repeat(9000);
    const req = new Request('http://localhost/api/admin/faq', {
      method: 'POST',
      headers: {
        ...buildBaseHeaders(token),
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        question: 'Pergunta',
        answer: largeText,
      }),
    });

    const res = await POST(req);
    const payload = await res.json();

    expect(res.status).toBe(413);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('returns security and correlation headers on successful mutation', async () => {
    const token = 'csrf-token';
    const req = new Request('http://localhost/api/admin/faq', {
      method: 'POST',
      headers: {
        ...buildBaseHeaders(token),
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        question: 'Pergunta',
        answer: 'Resposta',
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(res.headers.get('X-Correlation-Id')).toBeTruthy();
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
