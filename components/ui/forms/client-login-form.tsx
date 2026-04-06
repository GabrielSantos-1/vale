"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/core/button";
import { FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";

const DEFAULT_CALLBACK_URL = "/cliente/dashboard";

function resolveSafeCallbackUrl(callbackUrlParam: string | null): string {
  if (!callbackUrlParam) return DEFAULT_CALLBACK_URL;

  if (!callbackUrlParam.startsWith("/")) return DEFAULT_CALLBACK_URL;
  if (!callbackUrlParam.startsWith("/cliente/")) return DEFAULT_CALLBACK_URL;
  if (callbackUrlParam.startsWith("/cliente/login")) return DEFAULT_CALLBACK_URL;

  return callbackUrlParam;
}

type ClientLoginFormProps = {
  callbackUrl?: string | null;
  showRegisterSuccess?: boolean;
};

export default function ClientLoginForm({
  callbackUrl,
  showRegisterSuccess = false,
}: ClientLoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate() {
    const next: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      next.email = "E-mail e obrigatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = "Informe um e-mail valido.";
    }

    if (!password) {
      next.password = "Senha e obrigatoria.";
    }

    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "E-mail ou senha invalidos.");
        return;
      }

      const safeCallbackUrl = resolveSafeCallbackUrl(callbackUrl ?? null);
      router.push(safeCallbackUrl);
      router.refresh();
    } catch {
      setError("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {showRegisterSuccess ? (
        <div
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          role="status"
          aria-live="polite"
        >
          Conta criada com sucesso. Entre para acessar o dashboard.
        </div>
      ) : null}

      {error ? (
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      ) : null}

      <FormField id="client-email" label="E-mail" required error={errors.email}>
        <Input
          id="client-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={160}
          disabled={loading}
        />
      </FormField>

      <FormField
        id="client-password"
        label="Senha"
        required
        error={errors.password}
      >
        <Input
          id="client-password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          maxLength={255}
          disabled={loading}
        />
      </FormField>

      <div className="flex justify-end">
        <Link
          href="/cliente/recuperar-senha"
          className="text-sm text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <Button type="submit" className="w-full" isLoading={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="text-center text-sm text-secondary">
        Nao tem conta?{" "}
        <Link
          href="/cliente/registro"
          className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-accent"
        >
          Criar conta
        </Link>
      </div>
    </form>
  );
}
