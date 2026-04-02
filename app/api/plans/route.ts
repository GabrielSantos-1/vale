import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';
import { internalError, ok } from '@/lib/security/response';
import { getCorrelationId, withRequestMeta } from '@/lib/security/request-meta';

export async function GET(req: Request) {
  const correlationId = getCorrelationId(req);

  try {
    const plans = await prisma.plan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        priceCents: 'asc',
      },
    });

    return withRequestMeta(ok(plans), { correlationId });
  } catch (error) {
    logger.error('Unhandled error on plans route', {
      correlationId,
      route: '/api/plans',
      error,
    });

    return withRequestMeta(internalError(correlationId), {
      correlationId,
    });
  }
}

