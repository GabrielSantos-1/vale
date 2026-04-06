"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { LoadingState } from "@/components/ui/feedback/loading-state";
import { FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { extractApiErrorMessage } from "@/lib/utils/api-error-message";
import { PasswordChangeCard } from "./password-change-card";

type ClientProfile = {
  name: string;
  email: string;
  phone: string | null;
  cpfCnpj: string | null;
  isActive: boolean;
  createdAt: string;
};

type ApiEnvelope = {
  success?: boolean;
  data?: ClientProfile & {
    message?: string;
  };
  error?: unknown;
} | null;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function ClientProfileView() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadProfile() {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/client/me", {
        method: "GET",
        cache: "no-store",
      });

      let payload: ApiEnvelope = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.data) {
        setError(
          extractApiErrorMessage(
            payload,
            "Nao foi possivel carregar seus dados de perfil."
          )
        );
        return;
      }

      setProfile(payload.data);
      setName(payload.data.name ?? "");
      setPhone(payload.data.phone ?? "");
      setCpfCnpj(payload.data.cpfCnpj ?? "");
    } catch {
      setError("Erro de conexao ao carregar seu perfil.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  const isDirty = useMemo(() => {
    if (!profile) return false;

    return (
      name.trim() !== profile.name ||
      phone.trim() !== (profile.phone ?? "") ||
      cpfCnpj.trim() !== (profile.cpfCnpj ?? "")
    );
  }, [cpfCnpj, name, phone, profile]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || isSaving) return;

    setError(null);
    setMessage(null);

    if (name.trim().length < 2) {
      setError("Nome deve ter ao menos 2 caracteres.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/client/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          cpfCnpj: cpfCnpj.trim(),
        }),
      });

      let payload: ApiEnvelope = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.data) {
        setError(
          extractApiErrorMessage(
            payload,
            "Nao foi possivel atualizar seu cadastro."
          )
        );
        return;
      }

      setProfile(payload.data);
      setName(payload.data.name ?? "");
      setPhone(payload.data.phone ?? "");
      setCpfCnpj(payload.data.cpfCnpj ?? "");
      setMessage("Cadastro atualizado com sucesso.");
    } catch {
      setError("Erro de conexao ao atualizar o cadastro.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meu cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState label="Carregando dados do perfil..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meu cadastro</CardTitle>
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

          {!profile ? (
            <div className="space-y-3">
              <p className="text-sm text-secondary">
                Nao foi possivel carregar seu perfil no momento.
              </p>
              <Button type="button" variant="outline" onClick={() => void loadProfile()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <FormField id="client-profile-name" label="Nome" required>
                <Input
                  id="client-profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={120}
                  disabled={isSaving}
                />
              </FormField>

              <FormField id="client-profile-email" label="E-mail">
                <Input
                  id="client-profile-email"
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                />
              </FormField>

              <FormField id="client-profile-phone" label="Telefone">
                <Input
                  id="client-profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  maxLength={20}
                  disabled={isSaving}
                />
              </FormField>

              <FormField id="client-profile-cpfcnpj" label="CPF/CNPJ">
                <Input
                  id="client-profile-cpfcnpj"
                  type="text"
                  value={cpfCnpj}
                  onChange={(event) => setCpfCnpj(event.target.value)}
                  maxLength={20}
                  disabled={isSaving}
                />
              </FormField>

              <div className="rounded-lg border border-border bg-surface-secondary p-3 text-sm text-secondary">
                <p>Status da conta: {profile.isActive ? "Ativa" : "Inativa"}</p>
                <p>Criada em: {formatDate(profile.createdAt)}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  isLoading={isSaving}
                  disabled={!isDirty || isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar alteracoes"}
                </Button>
                <Button asChild type="button" variant="outline" disabled={isSaving}>
                  <Link href="/cliente/dashboard">Voltar ao dashboard</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <PasswordChangeCard />
    </div>
  );
}
