export type CspMode = 'report-only' | 'enforce';

export function resolveCspMode(): CspMode {
  const mode = process.env.CSP_MODE?.trim().toLowerCase();
  if (mode === 'enforce') return 'enforce';
  return 'report-only';
}

export function buildCspPolicy() {
  const isDev = process.env.NODE_ENV === 'development';
  const connectSrc = isDev ? "connect-src 'self' ws: wss:" : "connect-src 'self'";

  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "style-src-elem 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    connectSrc,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  const reportUri = process.env.CSP_REPORT_URI?.trim();
  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }

  return directives.join('; ');
}

export function getCspHeaderValue(cspOverride?: string): {
  name: 'Content-Security-Policy' | 'Content-Security-Policy-Report-Only';
  value: string;
} {
  const mode = resolveCspMode();

  return {
    name:
      mode === 'enforce'
        ? 'Content-Security-Policy'
        : 'Content-Security-Policy-Report-Only',
    value: cspOverride ?? buildCspPolicy(),
  };
}

export function securityHeaders() {
  const isDev = process.env.NODE_ENV === 'development';
  const cspHeader = getCspHeaderValue();

  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=()',
    ...(isDev
      ? {}
      : {
          'Strict-Transport-Security':
            'max-age=63072000; includeSubDomains; preload',
        }),
    [cspHeader.name]: cspHeader.value,
  };
}

export default securityHeaders;
