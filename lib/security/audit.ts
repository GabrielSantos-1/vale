import { Prisma } from '@prisma/client';
import type { Session } from 'next-auth';

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/security/logger';

type AuditMetadata = Record<string, unknown>;

export type AuditLogEntry = {
  actorUserId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: AuditMetadata;
};

export function getSessionActorUserId(session: Session | null | undefined) {
  const user = session?.user as { id?: string } | undefined;
  const id = user?.id;

  if (typeof id !== 'string') return null;

  const sanitized = id.trim();
  return sanitized.length > 0 ? sanitized : null;
}

export async function logAudit(entry: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: entry.actorUserId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        metadataJson: (entry.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.error('Failed to persist audit log entry', {
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      actorUserId: entry.actorUserId ?? null,
      error,
    });
  }
}
