"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/core/button";
import { FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";

export default function ClientRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate() {
    const next: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) next.name = "Nome é obrigatório.";
    else if (trimmedName.length > 120) next.name = "Nome muito longo.";

    if (!trimmedEmail) next.email = "E-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      next.email = "Informe um e-mail válido.";

    if (trimmedPhone && trimmedPhone.length > 20)
      next.phone = "Telefone inválido.";

    if (!password) next.password = "Senha é obrigatória.";
    else if (password.length < 8) next.password = "Mínimo de 8 caracteres.";
    else if (password.length > 200) next.password = "Senha muito longa.";

    if (password !== confirmPassword)
      next.confirmPassword = "As senhas não coincidem.";

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

    const submitName = name.trim();
    const submitEmail = email.trim().toLowerCase();
    const submitPhone = phone.trim();

    try {
      const res = await fetch("/api/client/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: submitName,
          email: submitEmail,
          phone: submitPhone || undefined,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "Não foi possível criar a conta.");
        return;
      }

      router.push("/cliente/login?registro=ok");
    } catch {
      setError("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error ? (
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      ) : null}

      <FormField
        id="client-name"
        label="Nome"
        required
        error={errors["name"]}
      >
        <Input
          id="client-name"
          type="text"
          placeholder="Seu nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={120}
          disabled={loading}
        />
      </FormField>

      <FormField
        id="client-reg-email"
        label="E-mail"
        required
        error={errors["email"]}
      >
        <Input
          id="client-reg-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          maxLength={160}
          disabled={loading}
        />
      </FormField>

      <FormField
        id="client-reg-phone"
        label="Telefone (opcional)"
        error={errors["phone"]}
      >
        <Input
          id="client-reg-phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          maxLength={20}
          disabled={loading}
        />
      </FormField>

      <FormField
        id="client-reg-password"
        label="Senha"
        required
        error={errors["password"]}
        hint="Mínimo de 8 caracteres."
      >
        <Input
          id="client-reg-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          maxLength={200}
          disabled={loading}
        />
      </FormField>

      <FormField
        id="client-confirm-password"
        label="Confirmar Senha"
        required
        error={errors["confirmPassword"]}
      >
        <Input
          id="client-confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          maxLength={200}
          disabled={loading}
        />
      </FormField>

      <Button type="submit" className="w-full" isLoading={loading}>
        {loading ? "Criando conta..." : "Criar Conta"}
      </Button>
    </form>
  );
}
