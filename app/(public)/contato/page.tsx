"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Container } from "@/components/ui/core/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { Input } from "@/components/ui/forms/input";
import { Textarea } from "@/components/ui/forms/textarea";
import { Label } from "@/components/ui/forms/label";
import { StatusBanner } from "@/components/marketing/status-banner";
import { Hero } from "@/components/marketing/hero";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
};

type ContactForm = typeof initialForm;

export default function ContatoPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return (
      submitting ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.message.trim()
    );
  }, [form, submitting]);

  function updateField<K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (form.website.trim()) {
        throw new Error("Envio inválido.");
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (Array.isArray(result.error)) {
          throw new Error(result.error[0]?.message || "Dados inválidos.");
        }

        throw new Error(result.error || "Falha ao enviar contato.");
      }

      setSuccess(
        "Mensagem enviada com sucesso. Nossa equipe poderá retornar em breve."
      );
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar contato.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <Hero
          eyebrow="Contato • suporte • contratação guiada"
          badge="Fale com a Verde Vale"
          title="Contato com mais clareza, contraste e acabamento premium"
          description="Envie sua solicitação para atendimento comercial, dúvidas gerais ou suporte inicial. Preencha os dados corretamente para facilitar o retorno da equipe."
          primaryCta={{ label: "Ver planos", href: "/planos#comparacao-planos" }}
          secondaryCta={{ label: "Consultar cobertura", href: "/cobertura#consulta-cobertura" }}
          note="Canais organizados para reduzir atrito e acelerar retorno."
          stats={[
            { label: "Retorno", value: "Mais claro" },
            { label: "Canais", value: "Organizados" },
            { label: "Jornada", value: "Sem atrito" },
            { label: "Atendimento", value: "Mais rápido" },
          ]}
        />

        <StatusBanner
          status="Atendimento"
          title="Canais organizados para contato comercial e suporte"
          description="Use dados válidos para facilitar o retorno e reduzir atrito no atendimento."
        />

        <Card
          id="formulario-contato"
          className="scroll-mt-24 rounded-[28px] border-border public-card"
        >
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Formulário de contato</CardTitle>
            <p className="text-sm leading-6 text-secondary">
              Os campos obrigatórios precisam ser preenchidos corretamente para
              agilizar o retorno.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    autoComplete="name"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    autoComplete="email"
                    maxLength={160}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    autoComplete="tel"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Ex.: Contratação, suporte, dúvidas"
                    value={form.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    maxLength={120}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  className="min-h-[180px]"
                  placeholder="Descreva sua solicitação com clareza para facilitar o retorno."
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  maxLength={1000}
                  required
                />
              </div>

              <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4">
                <p className="text-sm font-medium text-primary">
                  Antes de enviar
                </p>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Prefira informar nome completo, e-mail válido e uma mensagem
                  objetiva. Isso reduz retrabalho e acelera o retorno da equipe.
                </p>
              </div>

              {error ? (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              {success ? (
                <div
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  role="status"
                >
                  {success}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  isLoading={submitting}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {submitting ? "Enviando mensagem..." : "Enviar contato"}
                </Button>

                <p className="text-xs leading-5 text-secondary">
                  Ao enviar, seus dados serão usados apenas para retorno sobre a
                  solicitação.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm leading-6 text-secondary">
          Para contratação direta, use{" "}
          <Link className="text-primary underline" href="/contratar#formulario-solicitacao">
            /contratar
          </Link>
          . Para cobertura, consulte{" "}
          <Link className="text-primary underline" href="/cobertura#consulta-cobertura">
            /cobertura
          </Link>
          . Para incidentes públicos, confira{" "}
          <Link className="text-primary underline" href="/status#status-lista">
            /status
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
