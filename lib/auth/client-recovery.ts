import { createHash, randomBytes } from "crypto";

import { logger } from "@/lib/security/logger";

type RecoveryEntry = {
  clientUserId: string;
  tokenHash: string;
  expiresAt: number;
};

const RECOVERY_TTL_MS = 15 * 60 * 1000;
const recoveryStore = new Map<string, RecoveryEntry>();

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function tokenKey(tokenHash: string) {
  return `client:${tokenHash}`;
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of recoveryStore.entries()) {
    if (value.expiresAt <= now) {
      recoveryStore.delete(key);
    }
  }
}

export function issueClientRecoveryToken(clientUserId: string) {
  cleanupExpired();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);

  recoveryStore.set(tokenKey(tokenHash), {
    clientUserId,
    tokenHash,
    expiresAt: Date.now() + RECOVERY_TTL_MS,
  });

  return {
    token,
    expiresAt: new Date(Date.now() + RECOVERY_TTL_MS),
  };
}

export function consumeClientRecoveryToken(rawToken: string) {
  cleanupExpired();
  const tokenHash = hashToken(rawToken);
  const key = tokenKey(tokenHash);
  const entry = recoveryStore.get(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    recoveryStore.delete(key);
    return null;
  }

  recoveryStore.delete(key);
  return entry;
}

export async function sendClientRecoveryEmail(params: {
  email: string;
  token: string;
}) {
  const baseUrl =
    process.env.CLIENT_RECOVERY_BASE_URL ?? process.env.NEXTAUTH_URL;

  if (!baseUrl) {
    logger.warn("Client recovery base URL is missing", {
      route: "/api/client/password-recovery/request",
    });
    return false;
  }

  const resetUrl = new URL("/cliente/recuperar-senha", baseUrl);
  resetUrl.searchParams.set("token", params.token);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CLIENT_RECOVERY_FROM_EMAIL;

  if (!apiKey || !from) {
    logger.info("Client recovery email stub (provider not configured)", {
      route: "/api/client/password-recovery/request",
      email: params.email,
      hasResendApiKey: Boolean(apiKey),
      hasFromEmail: Boolean(from),
      resetUrl: resetUrl.toString(),
    });
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.email,
        subject: "Redefinicao de senha - Central do Cliente",
        html: `<p>Use o link para redefinir sua senha:</p><p><a href="${resetUrl.toString()}">Redefinir senha</a></p>`,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      logger.warn("Client recovery email provider rejected request", {
        route: "/api/client/password-recovery/request",
        status: response.status,
        errorPayload,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Client recovery email send failed", {
      route: "/api/client/password-recovery/request",
      error,
    });
    return false;
  }
}
