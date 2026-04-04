import { describe, expect, it } from 'vitest';

import {
  aggregateObservabilityMetrics,
  parseMetricsView,
  type ObservabilityAuditEntry,
} from '@/lib/observability/metrics';

describe('observability metrics aggregation', () => {
  it('parses view with safe fallback', () => {
    expect(parseMetricsView('weekly')).toBe('weekly');
    expect(parseMetricsView('monthly')).toBe('monthly');
    expect(parseMetricsView('invalid')).toBe('daily');
    expect(parseMetricsView(null)).toBe('daily');
  });

  it('aggregates totals and routes for dashboard summary', () => {
    const now = new Date('2026-04-03T12:00:00.000Z');
    const entries: ObservabilityAuditEntry[] = [
      {
        action: 'PUBLIC_EVENT_TRACKED',
        createdAt: new Date('2026-04-03T11:00:00.000Z'),
        metadataJson: { route: '/api/events' },
      },
      {
        action: 'PUBLIC_EVENT_TRACKED',
        createdAt: new Date('2026-04-02T11:00:00.000Z'),
        metadataJson: { route: '/api/events' },
      },
      {
        action: 'PUBLIC_API_RATE_LIMITED',
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        metadataJson: { route: '/api/leads' },
      },
      {
        action: 'PUBLIC_API_ERROR',
        createdAt: new Date('2026-04-03T10:30:00.000Z'),
        metadataJson: { route: '/api/contact' },
      },
    ];

    const result = aggregateObservabilityMetrics({
      entries,
      view: 'daily',
      now,
    });

    expect(result.summary.totalEvents).toBe(2);
    expect(result.summary.totalRateLimited).toBe(1);
    expect(result.summary.totalErrors).toBe(1);
    expect(result.summary.publicRateLimited).toBe(1);
    expect(result.summary.publicErrors).toBe(1);
    expect(result.summary.authRateLimited).toBe(0);
    expect(result.summary.authErrors).toBe(0);
    expect(result.summary.authNoiseDetected).toBe(false);
    expect(result.summary.rateLimitedByRoute['/api/leads']).toBe(1);
    expect(result.summary.errorsByRoute['/api/contact']).toBe(1);
    expect(result.summary.lastCriticalEvent?.route).toBe('/api/contact');
  });

  it('keeps status stable when only auth rate-limit noise exists', () => {
    const now = new Date('2026-04-03T12:00:00.000Z');
    const entries: ObservabilityAuditEntry[] = [
      {
        action: 'PUBLIC_API_RATE_LIMITED',
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        metadataJson: { route: '/api/auth/[...nextauth]' },
      },
    ];

    const result = aggregateObservabilityMetrics({
      entries,
      view: 'daily',
      now,
    });

    expect(result.summary.totalRateLimited).toBe(1);
    expect(result.summary.publicRateLimited).toBe(0);
    expect(result.summary.authRateLimited).toBe(1);
    expect(result.summary.authNoiseDetected).toBe(true);
    expect(result.summary.status).toBe('stable');
  });

  it('uses public incidents to drive status when mixed with auth incidents', () => {
    const now = new Date('2026-04-03T12:00:00.000Z');
    const entries: ObservabilityAuditEntry[] = [
      {
        action: 'PUBLIC_EVENT_TRACKED',
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        metadataJson: { route: '/api/events' },
      },
      {
        action: 'PUBLIC_API_RATE_LIMITED',
        createdAt: new Date('2026-04-03T10:10:00.000Z'),
        metadataJson: { route: '/api/auth/[...nextauth]' },
      },
      {
        action: 'PUBLIC_API_ERROR',
        createdAt: new Date('2026-04-03T10:20:00.000Z'),
        metadataJson: { route: '/api/contact' },
      },
    ];

    const result = aggregateObservabilityMetrics({
      entries,
      view: 'daily',
      now,
    });

    expect(result.summary.authErrors).toBe(0);
    expect(result.summary.authRateLimited).toBe(1);
    expect(result.summary.publicErrors).toBe(1);
    expect(result.summary.publicRateLimited).toBe(0);
    expect(result.summary.status).toBe('critical');
  });

  it('classifies unknown route safely without breaking totals', () => {
    const now = new Date('2026-04-03T12:00:00.000Z');
    const entries: ObservabilityAuditEntry[] = [
      {
        action: 'PUBLIC_API_RATE_LIMITED',
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        metadataJson: { route: '/api/unknown-custom' },
      },
    ];

    const result = aggregateObservabilityMetrics({
      entries,
      view: 'daily',
      now,
    });

    expect(result.summary.totalRateLimited).toBe(1);
    expect(result.summary.publicRateLimited).toBe(0);
    expect(result.summary.authRateLimited).toBe(0);
    expect(result.summary.status).toBe('stable');
  });
});
