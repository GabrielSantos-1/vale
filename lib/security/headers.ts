export function securityHeaders() {
  const isDev = process.env.NODE_ENV === 'development'

  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=()',
    ...(isDev
      ? {}
      : {
          'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        }),
    'Content-Security-Policy': isDev
      ? [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self' data:",
          "connect-src 'self' ws: wss: http: https:",
          "object-src 'none'",
        ].join('; ')
      : [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self'",
          "style-src-elem 'self'",
          "style-src-attr 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self' data:",
          "connect-src 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
  }
}

export default securityHeaders
