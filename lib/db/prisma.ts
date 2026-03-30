import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/security/logger';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';

  const prisma = new PrismaClient({
    log: isDev
      ? [
          { level: 'warn', emit: 'event' },
          { level: 'error', emit: 'event' },
          ...(process.env.PRISMA_LOG_QUERIES === 'true'
            ? [{ level: 'query', emit: 'event' } as const]
            : []),
        ]
      : [{ level: 'error', emit: 'event' }],
  });

  /**
   * 🔎 Observabilidade controlada
   */
  prisma.$on('error', (e) => {
    logger.error('Prisma error', {
      target: e.target,
      message: e.message,
    });
  });

  prisma.$on('warn', (e) => {
    logger.warn('Prisma warning', {
      target: e.target,
      message: e.message,
    });
  });

  /**
   * ⚠️ Query logging (APENAS se necessário)
   */
  if (isDev && process.env.PRISMA_LOG_QUERIES === 'true') {
    prisma.$on('query', (e) => {
      logger.info('Prisma query', {
        query: sanitizeQuery(e.query),
        duration: e.duration,
      });
    });
  }

  return prisma;
}

/**
 * 🔐 Evita logar dados sensíveis em queries
 */
function sanitizeQuery(query: string) {
  return query
    .replace(/\bVALUES\s*\(.+\)/gi, 'VALUES (?)')
    .replace(/\bIN\s*\(.+\)/gi, 'IN (?)')
    .slice(0, 500); // evita log gigante
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
