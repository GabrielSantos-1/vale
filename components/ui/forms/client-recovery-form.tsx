"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/core/button";
import { FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { extractApiErrorMessage } from "@/lib/utils/api-error-message";

type ApiEnvelope = {
  success?: boolean;
  data?: {
    message?: string;
  };
  error?: unknown;
} | null;

const GENERIC_RECOVERY_MESSAGE =
  "Se o e-mail estiver cadastrado, enviaremos instrucoes para recuperacao.";

function validateResetPassword(newPassword: string, confirmPassword: string) {
  if (!newPassword) return "A nova senha e obrigatoria.";
  if (newPassword.length < 8) return "A nova senha deve ter ao menos 8 caracteres.";
  if (newPassword.length > 200) return "A nova senha excede o limite permitido.";
  if (newPassword !== confirmPassword) return "A confirmacao de senha nao confere.";
  return null;
}

export default function ClientRecoveryForm() {
  const searchParams = useSearchParams();
  const token = (searchParams.get("token") ?? "").trim();
  const hasToken = token.length > 0;

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Informe o e-mail da sua conta.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/client/password-recovery/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      let payload: ApiEnvelope = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setError(
          extractApiErrorMessage(
            payload,
            "Nao foi possivel processar sua solicitacao agora."
          )
        );
        return;
      }

      setMessage(payload?.data?.message ?? GENERIC_RECOVERY_MESSAGE);
      setEmail("");
    } catch {
      setError("Erro de conexao ao solicitar recuperacao.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setMessage(null);

    if (!token) {
      setError("Token de recuperacao ausente.");
      return;
    }

    const validationError = validateResetPassword(newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/client/password-recovery/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      let payload: ApiEnvelope = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setError(
          extractApiErrorMessage(payload, "Nao foi possivel redefinir a senha.")
        );
        return;
      }

      setMessage(payload?.data?.message ?? "Senha redefinida com sucesso.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Erro de conexao ao redefinir senha.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {message ? (
        <div
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          role="status"
          aria-live="polite"
        >
          {message}
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

      {hasToken ? (
        <form className="space-y-5" onSubmit={submitReset} noValidate>
          <FormField id="client-new-password" label="Nova senha" required>
            <Input
              id="client-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              maxLength={200}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField id="client-confirm-password" label="Confirmar nova senha" required>
            <Input
              id="client-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              maxLength={200}
              disabled={isSubmitting}
            />
          </FormField>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
          </Button>

          <Button asChild type="button" variant="outline" className="w-full" disabled={isSubmitting}>
            <Link href="/cliente/login">Voltar para login</Link>
          </Button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={submitRequest} noValidate>
          <FormField id="client-recovery-email" label="E-mail da conta" required>
            <Input
              id="client-recovery-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={160}
              disabled={isSubmitting}
            />
          </FormField>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Solicitar recuperacao"}
          </Button>

          <Button asChild type="button" variant="ghost" className="w-full" disabled={isSubmitting}>
            <Link href="/cliente/login">Voltar para login</Link>
          </Button>
        </form>
      )}
    </div>
  );
}

