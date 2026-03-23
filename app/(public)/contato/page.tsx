"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/core/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { Input } from "@/components/ui/forms/input";
import { Textarea } from "@/components/ui/forms/textarea";
import { Label } from "@/components/ui/forms/label";
import { Badge } from "@/components/ui/core/badge";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
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
      <div className="space-y-8">
        <header className="space-y-3">
          <Badge variant="default">Atendimento e contato</Badge>

          <div className="max-w-3xl">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Fale com a Verde Vale
            </h1>

            <p className="mt-3 text-sm leading-6 text-secondary md:text-base">
              Envie sua solicitação para atendimento comercial, dúvidas gerais
              ou suporte. Preencha os dados corretamente para facilitar o
              retorno.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Formulário de contato</CardTitle>
              <p className="text-sm text-secondary">
                Os campos marcados como obrigatórios precisam ser preenchidos.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      placeholder="Ex.: Contratação, suporte, dúvidas"
                      value={form.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    className="min-h-45"
                    placeholder="Descreva sua solicitação com o máximo de clareza."
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {success}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="submit" disabled={isSubmitDisabled} isLoading={submitting}>
                    {submitting ? "Enviando mensagem..." : "Enviar contato"}
                  </Button>

                  <p className="text-xs text-secondary">
                    Ao enviar, seus dados serão usados apenas para retorno sobre
                    a solicitação.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atendimento</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 text-sm text-secondary">
                  <p>Use dados válidos para facilitar o retorno da equipe.</p>
                  <p>
                    Solicitações comerciais e operacionais podem ter fluxos
                    diferentes.
                  </p>
                  <p>
                    Para contratação imediata, o ideal é usar a página
                    específica de contratação.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acessos rápidos</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button asChild variant="secondary" className="justify-start">
                    <Link href="/planos">Ver planos disponíveis</Link>
                  </Button>

                  <Button asChild variant="secondary" className="justify-start">
                    <Link href="/contratar">Solicitar contratação</Link>
                  </Button>

                  <Button asChild variant="secondary" className="justify-start">
                    <Link href="/cobertura">Consultar cobertura</Link>
                  </Button>

                  <Button asChild variant="secondary" className="justify-start">
                    <Link href="/status">Ver status da rede</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </Container>
  );
}