// lib/security/logger.ts

type LogLevel = 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

function safeSerialize(context?: LogContext) {
  if (!context) return undefined;

  const redactedKeys = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'cookie',
    'secret',
    'apiKey',
  ];

  const sanitizedEntries = Object.entries(context).map(([key, value]) => {
    const shouldRedact = redactedKeys.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey.toLowerCase()),
    );

    if (shouldRedact) {
      return [key, '[REDACTED]'];
    }

    if (value instanceof Error) {
      return [
        key,
        {
          name: value.name,
          message: value.message,
        },
      ];
    }

    return [key, value];
  });

  return Object.fromEntries(sanitizedEntries);
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context: safeSerialize(context) } : {}),
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}

export const logger = {
  info(message: string, context?: LogContext) {
    log('info', message, context);
  },

  warn(message: string, context?: LogContext) {
    log('warn', message, context);
  },

  error(message: string, context?: LogContext) {
    log('error', message, context);
  },
};
