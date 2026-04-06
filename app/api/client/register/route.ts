import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/security/logger";
import { normalizeEmail, sanitizeString } from "@/lib/security/sanitize";
import {
  rateLimit,
  buildRateLimitKey,
} from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const rlKey = buildRateLimitKey("client_register", req);
  const rl = await rateLimit({
    key: rlKey,
    limit: 3,
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
      { error: "Dados inválidos." },
      { status: 400 }
    );
  }

  if (!data || typeof data !== "object") {
    return NextResponse.json(
      { error: "Dados inválidos." },
      { status: 400 }
    );
  }

  const raw = data as Record<string, unknown>;
  const rawName = raw.name as string | undefined;
  const rawEmail = raw.email as string | undefined;
  const rawPhone = raw.phone as string | undefined;
  const rawPassword = raw.password as string | undefined;

  const errors: string[] = [];

  if (!rawName || typeof rawName !== "string") {
    errors.push("Nome é obrigatório.");
  } else if (rawName.trim().length < 2) {
    errors.push("Nome deve ter pelo menos 2 caracteres.");
  }

  if (!rawEmail || typeof rawEmail !== "string") {
    errors.push("E-mail é obrigatório.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    errors.push("E-mail inválido.");
  }

  if (rawPhone && typeof rawPhone === "string" && rawPhone.length > 20) {
    errors.push("Telefone inválido.");
  }

  if (!rawPassword || typeof rawPassword !== "string" || rawPassword.length < 8) {
    errors.push("Senha deve ter no mínimo 8 caracteres.");
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors[0] },
      { status: 422 }
    );
  }

  const name = sanitizeString(rawName!, { maxLength: 120 });
  const email = normalizeEmail(rawEmail!);
  const phone = rawPhone ? sanitizeString(rawPhone, { maxLength: 20 }) : null;
  const password = rawPassword!;

  const passwordHash = await hash(password, 12);

  try {
    await prisma.clientUser.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
      },
    });
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma conta com este e-mail." },
        { status: 409 }
      );
    }
    logger.error("Client registration failed: database error", {
      route: "/api/client/register",
    });
    return NextResponse.json(
      { error: "Não foi possível criar a conta." },
      { status: 500 }
    );
  }

  logger.info("Client registered", {
    route: "/api/client/register",
    email,
  });

  return NextResponse.json({ success: true } as { success: boolean }, { status: 201 });
}
