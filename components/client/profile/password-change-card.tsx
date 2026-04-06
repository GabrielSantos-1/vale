"use client";

import { useState } from "react";

import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
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

function validatePassword(newPassword: string, confirmPassword: string) {
  if (!newPassword) return "A nova senha e obrigatoria.";
  if (newPassword.length < 8) return "A nova senha deve ter ao menos 8 caracteres.";
  if (newPassword.length > 200) return "A nova senha excede o limite permitido.";
  if (newPassword !== confirmPassword) return "A confirmacao de senha nao confere.";
  return null;
}

export function PasswordChangeCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setMessage(null);

    if (!currentPassword) {
      setError("Informe sua senha atual.");
      return;
    }

    const validationError = validatePassword(newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/client/password/change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
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
          extractApiErrorMessage(
            payload,
            "Nao foi possivel atualizar sua senha agora."
          )
        );
        return;
      }

      setMessage(payload?.data?.message ?? "Senha atualizada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Erro de conexao ao atualizar senha.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Seguranca</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField id="client-current-password" label="Senha atual" required>
            <Input
              id="client-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              maxLength={255}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            id="client-new-password"
            label="Nova senha"
            required
            hint="Minimo de 8 caracteres."
          >
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

          <FormField
            id="client-confirm-new-password"
            label="Confirmar nova senha"
            required
          >
            <Input
              id="client-confirm-new-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              maxLength={200}
              disabled={isSubmitting}
            />
          </FormField>

          <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
            {isSubmitting ? "Atualizando..." : "Atualizar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

