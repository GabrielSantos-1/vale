import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { encode as jwtEncode } from "next-auth/jwt";

import {
  getClientAuthCookieName,
  shouldUseSecureClientCookie,
} from "@/lib/auth/client-session";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/security/logger";
import { normalizeEmail, sanitizeString } from "@/lib/security/sanitize";
import {
  rateLimit,
  getClientIp,
  buildRateLimitKey,
} from "@/lib/security/rate-limit";

const authSecret =
  process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error("Missing NEXTAUTH_SECRET/AUTH_SECRET for client login");
}

export async function POST(req: NextRequest) {
  const rlKey = buildRateLimitKey("client_login", req);
  const rl = await rateLimit({
    key: rlKey,
    limit: 5,
    windowMs: 60 * 1000,
  });

  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns segundos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Credenciais inválidas." },
      { status: 400 }
    );
  }

  if (
    !data ||
    typeof data !== "object" ||
    !("email" in data) ||
    !("password" in data)
  ) {
    return NextResponse.json(
      { error: "Credenciais inválidas." },
      { status: 400 }
    );
  }

  const raw = data as Record<string, unknown>;
  const rawEmail = raw.email as string | undefined;
  const password = raw.password as string | undefined;

  if (
    !rawEmail ||
    typeof rawEmail !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { error: "Credenciais inválidas." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(rawEmail);
  let client: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    passwordHash: string;
  } | null = null;
  let databaseUnavailable = false;

  try {
    client = await prisma.clientUser.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        passwordHash: true,
      },
    });
  } catch {
    databaseUnavailable = true;
    logger.error("Client login failed: database error", {
      route: "/api/client/auth/login",
    });
  }

  if (databaseUnavailable) {
    return NextResponse.json(
      { error: "Serviço de autenticação temporariamente indisponível." },
      { status: 500 }
    );
  }

  const isValid =
    !!client &&
    client.isActive &&
    (await compare(password, client.passwordHash));

  if (!isValid || !client) {
    logger.warn("Client login rejected: invalid credentials", {
      route: "/api/client/auth/login",
      email,
    });
    return NextResponse.json(
      { error: "Credenciais inválidas." },
      { status: 401 }
    );
  }

  const safeName = client.name
    ? sanitizeString(client.name, { maxLength: 120 })
    : "Cliente";

  const ip = getClientIp(req);
  const prod = shouldUseSecureClientCookie();
  const cookieKey = getClientAuthCookieName();

  const jwt = await jwtEncode({
    token: {
      sub: client.id,
      id: client.id,
      email: client.email,
      name: safeName,
    },
    secret: authSecret as string,
    maxAge: 60 * 60 * 8,
  });

  const response = NextResponse.json({ success: true }, { status: 200 });

  response.headers.set("X-RateLimit-Limit", String(rl.limit));
  response.headers.set("X-RateLimit-Remaining", String(rl.remaining));
  response.headers.set("X-RateLimit-Reset", String(rl.resetAt));

  response.cookies.set({
    name: cookieKey,
    value: jwt,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: prod,
    maxAge: 60 * 60 * 8,
  });

  response.cookies.set({
    name: "client_session_established",
    value: "1",
    path: "/",
    sameSite: "lax",
    secure: prod,
    httpOnly: false,
    maxAge: 60 * 60 * 8,
  });

  logger.info("Client login successful", {
    route: "/api/client/auth/login",
    clientId: client.id,
    email: client.email,
    ip,
  });

  return response;
}
