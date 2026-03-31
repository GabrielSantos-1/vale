import { createHash, randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db/prisma';
import { isAdminRole } from '@/lib/auth/roles';
import { logger } from '@/lib/security/logger';

const RECOVERY_TOKEN_BYTES = 32;
const RECOVERY_TOKEN_TTL_MINUTES = 15;

function recoveryTokenModel() {
  return (prisma as unknown as { adminPasswordRecoveryToken: any })
    .adminPasswordRecoveryToken;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createRecoveryToken() {
  const token = randomBytes(RECOVERY_TOKEN_BYTES).toString('base64url');
  return {
    plainToken: token,
    tokenHash: hashToken(token),
  };
}

export function getRecoveryTokenExpiryDate() {
  return new Date(Date.now() + RECOVERY_TOKEN_TTL_MINUTES * 60 * 1000);
}

export function hashRecoveryToken(token: string) {
  return hashToken(token);
}

export async function findRecoverableAdminByEmail(email: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive || !isAdminRole(user.role)) {
    return null;
  }

  return user;
}

export async function invalidateOpenRecoveryTokens(adminUserId: string) {
  const now = new Date();

  await recoveryTokenModel().updateMany({
    where: {
      adminUserId,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: {
      usedAt: now,
    },
  });
}

export async function storeRecoveryToken(params: {
  adminUserId: string;
  tokenHash: string;
  expiresAt: Date;
  requestedIp?: string | null;
  requestedUserAgent?: string | null;
}) {
  await recoveryTokenModel().create({
    data: {
      adminUserId: params.adminUserId,
      tokenHash: params.tokenHash,
      expiresAt: params.expiresAt,
      requestedIp: params.requestedIp ?? null,
      requestedUserAgent: params.requestedUserAgent ?? null,
    },
  });
}

export async function recordRecoveryAudit(params: {
  actorUserId?: string | null;
  action: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: params.actorUserId ?? null,
        action: params.action,
        entity: 'AdminPasswordRecovery',
        entityId: params.entityId ?? null,
        metadataJson: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.error('Failed to persist admin recovery audit log', {
      action: params.action,
      actorUserId: params.actorUserId ?? null,
      entityId: params.entityId ?? null,
      error,
    });
  }
}

export async function sendRecoveryEmail(params: {
  to: string;
  name: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ADMIN_RECOVERY_FROM_EMAIL;
  const baseUrl = process.env.ADMIN_RECOVERY_BASE_URL ?? process.env.NEXTAUTH_URL;

  if (!apiKey || !from || !baseUrl) {
    logger.warn('Admin recovery email configuration is incomplete', {
      hasResendApiKey: Boolean(apiKey),
      hasFromEmail: Boolean(from),
      hasBaseUrl: Boolean(baseUrl),
    });
    return false;
  }

  const resetUrl = new URL('/recuperar-admin', baseUrl);
  resetUrl.searchParams.set('token', params.token);

  const html = [
    `<p>Olá ${params.name || 'Administrador'},</p>`,
    '<p>Recebemos uma solicitação para redefinir sua senha administrativa.</p>',
    `<p><a href="${resetUrl.toString()}">Clique aqui para redefinir sua senha</a></p>`,
    '<p>Este link expira em 15 minutos e pode ser usado apenas uma vez.</p>',
    '<p>Se você não solicitou a redefinição, ignore esta mensagem.</p>',
  ].join('');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: 'Recuperação de acesso administrativo',
        html,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const responseText = await response.text();
      logger.warn('Admin recovery email provider rejected request', {
        status: response.status,
        body: responseText.slice(0, 300),
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Admin recovery email send failed', { error });
    return false;
  }
}
