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
import { trackPublicEvent } from "@/lib/telemetry/public-events";
import { extractApiErrorMessage } from "@/lib/utils/api-error-message";

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
        throw new Error(
          extractApiErrorMessage(
            result as { success?: boolean; error?: unknown },
            "Falha ao enviar contato."
          )
        );
      }

      trackPublicEvent({
        eventName: "contact_submit",
        page: "/contato",
        component: "contact_form",
        target: "contact",
        status: "success",
      });

      setSuccess(
        "Mensagem enviada com sucesso. Nossa equipe poderá retornar em breve."
      );
      setForm(initialForm);
    } catch (err) {
      trackPublicEvent({
        eventName: "contact_submit",
        page: "/contato",
        component: "contact_form",
        target: "contact",
        status: "error",
      });
      setError(err instanceof Error ? err.message : "Erro ao enviar contato.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <Hero
          eyebrow="Contato | atendimento | suporte comercial"
          badge="Atendimento Verde Vale Connect"
          title="Fale com nosso atendimento para contratar internet fibra ou tirar dúvidas"
          description="Use este canal para atendimento comercial, suporte inicial e orientação sobre cobertura. Nossa equipe analisa sua solicitação com retorno claro."
          primaryCta={{ label: "Entrar em contato", href: "#formulario-contato" }}
          secondaryCta={{ label: "Consultar cobertura", href: "/cobertura#consulta-cobertura" }}
          note="Canal direto para atendimento regional com comunicação objetiva do primeiro contato ao próximo passo."
          stats={[
            {
              label: "Retorno inicial",
              value: "Fluxo orientado",
              description: "Solicitações com triagem clara para o canal certo.",
            },
            {
              label: "Atendimento humano",
              value: "Equipe regional",
              description: "Comunicação próxima do primeiro contato ao encaminhamento.",
            },
            {
              label: "Canal único",
              value: "Comercial e suporte",
              description: "Entrada padronizada para reduzir ruído na operação.",
            },
          ]}
        />

        <StatusBanner
          status="Atendimento"
          title="Atendimento comercial e suporte em um único canal"
          description="Informe seus dados corretamente para facilitar o retorno da equipe e agilizar o encaminhamento da sua solicitação."
        />

        <Card
          id="formulario-contato"
          className="scroll-mt-24 rounded-[28px] border-cyan-100/16 public-card"
        >
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Entrar em contato</CardTitle>
            <p className="text-sm leading-6 text-secondary">
              Informe seus dados para receber atendimento com retorno mais rápido e objetivo.
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
                    placeholder="Nome completo"
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
                    placeholder="Ex.: Contratação, suporte, cobertura"
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
                  placeholder="Descreva sua necessidade para ajudarmos com mais precisão."
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  maxLength={1000}
                  required
                />
              </div>

              <div className="rounded-2xl border border-cyan-100/20 bg-slate-950/14 backdrop-blur-sm p-4">
                <p className="text-sm font-medium text-primary">
                  Antes de enviar
                </p>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  Informe nome completo, e-mail válido e detalhes da sua
                  solicitação. Isso ajuda nossa equipe a direcionar o atendimento
                  comercial ou suporte com mais agilidade.
                </p>
              </div>

              {error ? (
                <div
                  className="rounded-2xl border border-red-400/45 bg-red-500/12 px-4 py-3 text-sm text-red-100"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              {success ? (
                <div
                  className="rounded-2xl border border-emerald-300/45 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100"
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
                  {submitting ? "Enviando solicitação..." : "Enviar solicitação"}
                </Button>

                <p className="text-xs leading-5 text-secondary">
                  Ao enviar, seus dados serão usados apenas para contato sobre
                  esta solicitação.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm leading-6 text-secondary">
          Para contratar internet fibra, acesse{" "}
          <Link className="text-primary underline" href="/contratar#formulario-solicitacao">
            /contratar
          </Link>
          . Para consultar disponibilidade de cobertura, use{" "}
          <Link className="text-primary underline" href="/cobertura#consulta-cobertura">
            /cobertura
          </Link>
          . Para acompanhar status da rede e manutenções, confira{" "}
          <Link className="text-primary underline" href="/status#status-lista">
            /status
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}


