import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  buildCspPolicy,
  getCspHeaderValue,
  securityHeaders,
} from '@/lib/security/headers';

const ORIGINAL_ENV = { ...process.env };

describe('security headers CSP rollout', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.CSP_MODE;
    delete process.env.CSP_REPORT_URI;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('uses report-only mode by default', () => {
    const headers = securityHeaders() as Record<string, string | undefined>;

    expect(headers['Content-Security-Policy-Report-Only']).toBeDefined();
    expect(headers['Content-Security-Policy']).toBeUndefined();
  });

  it('uses enforce mode when configured', () => {
    process.env.CSP_MODE = 'enforce';

    const headers = securityHeaders() as Record<string, string | undefined>;

    expect(headers['Content-Security-Policy']).toBeDefined();
    expect(headers['Content-Security-Policy-Report-Only']).toBeUndefined();
  });

  it('uses ws/wss in connect-src on development', () => {
    process.env = { ...process.env, NODE_ENV: 'development' };
    const policy = buildCspPolicy();
    expect(policy).toContain("connect-src 'self' ws: wss:");
  });

  it('uses self-only connect-src on production', () => {
    process.env = { ...process.env, NODE_ENV: 'production' };
    const policy = buildCspPolicy();
    expect(policy).toContain("connect-src 'self'");
    expect(policy).not.toContain('ws:');
  });

  it('includes report-uri when provided', () => {
    process.env.CSP_REPORT_URI = 'https://example.com/csp-report';
    const policy = buildCspPolicy();
    expect(policy).toContain('report-uri https://example.com/csp-report');
  });

  it('returns correct header key for each mode', () => {
    process.env.CSP_MODE = 'report-only';
    const reportOnly = getCspHeaderValue();
    expect(reportOnly.name).toBe('Content-Security-Policy-Report-Only');

    process.env.CSP_MODE = 'enforce';
    const enforce = getCspHeaderValue();
    expect(enforce.name).toBe('Content-Security-Policy');
  });
});
