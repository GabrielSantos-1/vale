"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/core/button';
import { FormField } from '@/components/ui/forms/form-field';
import { Input } from '@/components/ui/forms/input';

type RequestState = {
  email: string;
};

type ResetState = {
  newPassword: string;
  confirmPassword: string;
};

export default function AdminRecoveryForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const hasToken = token.length > 0;

  const [requestForm, setRequestForm] = useState<RequestState>({ email: '' });
  const [resetForm, setResetForm] = useState<ResetState>({
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const email = requestForm.email.trim();

    if (!email) {
      setError('Informe o e-mail administrativo.');
      setMessage(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/admin-recovery/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ??
            'Não foi possível processar a solicitação agora.',
        );
      }

      setMessage(
        payload?.data?.message ??
          'Se o e-mail estiver cadastrado, enviaremos instruções para recuperação.',
      );
      setRequestForm({ email: '' });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao solicitar recuperação de acesso.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submitReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    if (!token) {
      setError('Token de recuperação ausente ou inválido.');
      setMessage(null);
      return;
    }

    if (!resetForm.newPassword || !resetForm.confirmPassword) {
      setError('Preencha os dois campos de senha.');
      setMessage(null);
      return;
    }

    if (resetForm.newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      setMessage(null);
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('A confirmação de senha não confere.');
      setMessage(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/admin-recovery/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: resetForm.newPassword,
          confirmPassword: resetForm.confirmPassword,
        }),
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ?? 'Não foi possível redefinir a senha.',
        );
      }

      setMessage(payload?.data?.message ?? 'Senha redefinida com sucesso.');
      setResetForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao redefinir a senha.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {message ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {hasToken ? (
        <form className="space-y-5" onSubmit={submitReset}>
          <FormField id="newPassword" label="Nova senha" required>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={resetForm.newPassword}
              onChange={(event) =>
                setResetForm((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
              disabled={isLoading}
            />
          </FormField>

          <FormField id="confirmPassword" label="Confirmar nova senha" required>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={resetForm.confirmPassword}
              onChange={(event) =>
                setResetForm((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              disabled={isLoading}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={submitRequest}>
          <FormField id="email" label="E-mail administrativo" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={requestForm.email}
              onChange={(event) =>
                setRequestForm({ email: event.target.value })
              }
              disabled={isLoading}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Solicitar recuperação'}
          </Button>
        </form>
      )}
    </div>
  );
}