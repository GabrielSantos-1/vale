"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Container } from "@/components/ui/core/container";
import { Button } from "@/components/ui/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/core/card";
import { FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import { StatusBanner } from "@/components/marketing/status-banner";
import { trackPublicEvent } from "@/lib/telemetry/public-events";
import { extractApiErrorMessage } from "@/lib/utils/api-error-message";

type Props = {
  plano: string;
  plans: {
    id: string;
    name: string;
    slug: string;
  }[];
};

type LeadForm = {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  cep: string;
  message: string;
  planSlug: string;
  website: string;
};

type LeadFormErrors = Partial<Record<keyof LeadForm, string>>;

const initialForm: LeadForm = {
  name: "",
  phone: "",
  email: "",
  city: "",
  district: "",
  cep: "",
  message: "",
  planSlug: "",
  website: "",
};

const conversionHighlights = [
  {
    label: "Jornada",
    value: "Mais clara",
    description:
      "SeleÃ§Ã£o de plano, dados de contato e envio em um fluxo direto.",
  },
  {
    label: "Retorno",
    value: "Mais rÃ¡pido",
    description:
      "Dados bem preenchidos ajudam a equipe comercial a responder sem retrabalho.",
  },
  {
    label: "Cobertura",
    value: "Sem atrito",
    description:
      "VocÃª pode validar a regiÃ£o antes de avanÃ§ar para a solicitaÃ§Ã£o comercial.",
  },
] as const;

export default function ContratarClient({ plano, plans }: Props) {
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!plano) return;

    const planExists = plans.some((item) => item.slug === plano);

    setForm((prev) => ({
      ...prev,
      planSlug: planExists ? plano : prev.planSlug,
    }));
  }, [plano, plans]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.location.hash && !plano) return;

    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [plano]);

  const selectedPlan = useMemo(
    () => plans.find((item) => item.slug === form.planSlug),
    [plans, form.planSlug]
  );

  const isSubmitDisabled = useMemo(() => {
    return loading || !form.name.trim() || !form.phone.trim();
  }, [form.name, form.phone, loading]);

  function clearFeedback() {
    if (error) setError(null);
    if (success) setSuccess(null);
  }

  function updateField<K extends keyof LeadForm>(field: K, value: LeadForm[K]) {
    clearFeedback();

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (!digits) {
      updateField("phone", "");
      return;
    }

    if (digits.length <= 10) {
      const formatted = digits
        .replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*$/, (_, ddd, first, second) => {
          if (!ddd) return "";
          if (!first) return `(${ddd}`;
          if (!second) return `(${ddd}) ${first}`;
          return `(${ddd}) ${first}-${second}`;
        })
        .trim();

      updateField("phone", formatted);
      return;
    }

    const formatted = digits.replace(
      /^(\d{2})(\d{5})(\d{4}).*$/,
      "($1) $2-$3"
    );

    updateField("phone", formatted);
  }

  function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (!digits) {
      updateField("cep", "");
      return;
    }

    const formatted =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;

    updateField("cep", formatted);
  }

  function handlePlanChange(value: string) {
    updateField("planSlug", value);

    if (!value) return;

    trackPublicEvent({
      eventName: "plan_interest",
      page: "/contratar",
      component: "contract_form",
      target: value,
      status: "click",
    });
  }

  function validateForm(): LeadFormErrors {
    const nextErrors: LeadFormErrors = {};

    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPlanSlug = form.planSlug.trim();
    const trimmedCep = form.cep.trim();

    if (!trimmedName) {
      nextErrors.name = "Informe seu nome.";
    } else if (trimmedName.length < 3) {
      nextErrors.name = "Informe um nome vÃ¡lido.";
    }

    if (!trimmedPhone) {
      nextErrors.phone = "Informe seu telefone.";
    } else {
      const digits = trimmedPhone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 11) {
        nextErrors.phone = "Informe um telefone vÃ¡lido.";
      }
    }

    if (trimmedEmail) {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
      if (!isEmailValid) {
        nextErrors.email = "Informe um e-mail vÃ¡lido.";
      }
    }

    if (trimmedCep) {
      const digits = trimmedCep.replace(/\D/g, "");
      if (digits.length !== 8) {
        nextErrors.cep = "Informe um CEP vÃ¡lido.";
      }
    }

    if (trimmedPlanSlug) {
      const planExists = plans.some((plan) => plan.slug === trimmedPlanSlug);
      if (!planExists) {
        nextErrors.planSlug = "Selecione um plano vÃ¡lido.";
      }
    }

    if (form.website.trim()) {
      nextErrors.website = "Envio invÃ¡lido.";
    }

    if (form.message.trim().length > 500) {
      nextErrors.message = "ObservaÃ§Ãµes devem ter no mÃ¡ximo 500 caracteres.";
    }

    if (form.city.trim().length > 80) {
      nextErrors.city = "Cidade deve ter no mÃ¡ximo 80 caracteres.";
    }

    if (form.district.trim().length > 80) {
      nextErrors.district = "Bairro deve ter no mÃ¡ximo 80 caracteres.";
    }

    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError(null);
    setSuccess(null);

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      if (form.planSlug.trim()) {
        trackPublicEvent({
          eventName: "plan_interest",
          page: "/contratar",
          component: "contract_form",
          target: form.planSlug.trim(),
          status: "submitted",
        });
      }

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        city: form.city.trim() || undefined,
        district: form.district.trim() || undefined,
        cep: form.cep.trim() || undefined,
        message: form.message.trim() || undefined,
        planSlug: form.planSlug.trim() || undefined,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          extractApiErrorMessage(
            data as { success?: boolean; error?: unknown },
            "Nao foi possivel enviar sua solicitacao."
          )
        );
      }

      setSuccess(
        "SolicitaÃ§Ã£o enviada com sucesso. Nossa equipe entrarÃ¡ em contato em breve."
      );

      setForm({
        ...initialForm,
        planSlug: plano || "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar sua solicitaÃ§Ã£o."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <header className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              ContrataÃ§Ã£o
            </p>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                Solicite sua internet
              </h1>

              <p className="text-sm leading-6 text-secondary md:text-base">
                Envie seus dados para anÃ¡lise comercial e retorno da equipe. O
                formulÃ¡rio foi pensado para reduzir atrito, manter a validaÃ§Ã£o
                clara e acelerar a conversÃ£o.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {conversionHighlights.map((item) => (
              <Card
                key={item.label}
                className="rounded-[24px] border-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted">{item.label}</p>
                    <p className="text-2xl font-semibold tracking-tight text-primary md:text-[1.75rem]">
                      {item.value}
                    </p>
                    <p className="text-sm leading-6 text-secondary">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </header>

        <StatusBanner
          status="Comercial"
          title="Jornada de contrataÃ§Ã£o com menos atrito"
          description="Selecione um plano, envie seus dados e avance com mais clareza no contato comercial."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div
            ref={formSectionRef}
            id="formulario-solicitacao"
            className="scroll-mt-24"
          >
            <Card className="rounded-[28px] border-border">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl">SolicitaÃ§Ã£o comercial</CardTitle>
              <p className="text-sm leading-6 text-secondary">
                Os campos obrigatÃ³rios ajudam a equipe a validar contato,
                disponibilidade e prÃ³ximos passos sem perder contexto.
              </p>
            </CardHeader>

            <CardContent>
              {selectedPlan ? (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                  Plano selecionado: <strong>{selectedPlan.name}</strong>
                </div>
              ) : (
                <div className="mb-5 rounded-2xl border border-border bg-surface-secondary/70 px-4 py-4 text-sm text-secondary">
                  VocÃª pode enviar a solicitaÃ§Ã£o sem plano definido, mas selecionar
                  uma opÃ§Ã£o ajuda a equipe comercial a responder com mais precisÃ£o.
                </div>
              )}

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
                  <FormField
                    id="name"
                    label="Nome"
                    required
                    error={errors.name}
                    hint="Informe seu nome completo."
                  >
                    <Input
                      type="text"
                      placeholder="Seu nome completo"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      autoComplete="name"
                      maxLength={120}
                    />
                  </FormField>

                  <FormField
                    id="phone"
                    label="Telefone"
                    required
                    error={errors.phone}
                    hint="Informe telefone com DDD."
                  >
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="(00) 00000-0000"
                      value={form.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      autoComplete="tel"
                      maxLength={15}
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    id="email"
                    label="E-mail"
                    error={errors.email}
                    hint="Opcional, usado para retorno."
                  >
                    <Input
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      autoComplete="email"
                      maxLength={160}
                    />
                  </FormField>

                  <FormField id="city" label="Cidade" error={errors.city}>
                    <Input
                      type="text"
                      placeholder="Sua cidade"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      autoComplete="address-level2"
                      maxLength={80}
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField id="district" label="Bairro" error={errors.district}>
                    <Input
                      type="text"
                      placeholder="Seu bairro"
                      value={form.district}
                      onChange={(e) => updateField("district", e.target.value)}
                      autoComplete="address-level3"
                      maxLength={80}
                    />
                  </FormField>

                  <FormField
                    id="cep"
                    label="CEP"
                    error={errors.cep}
                    hint="Formato: 00000-000"
                  >
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={form.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      autoComplete="postal-code"
                      maxLength={9}
                    />
                  </FormField>
                </div>

                <FormField
                  id="planSlug"
                  label="Plano de interesse"
                  error={errors.planSlug}
                  hint="Selecione um plano disponÃ­vel."
                >
                  <Select value={form.planSlug} onChange={(e) => handlePlanChange(e.target.value)}>
                    <option value="">Selecione um plano</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.slug}>
                        {plan.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="message"
                  label="ObservaÃ§Ãµes"
                  error={errors.message}
                  hint="Ex.: melhor horÃ¡rio para contato, referÃªncia ou complemento."
                >
                  <Textarea
                    placeholder="Ex.: melhor horÃ¡rio para contato, referÃªncia, complemento de endereÃ§o ou dÃºvida."
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    maxLength={500}
                  />
                </FormField>

                <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4">
                  <p className="text-sm font-medium text-primary">
                    Antes de enviar
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    Dados corretos, telefone vÃ¡lido e plano de interesse ajudam a
                    equipe a responder de forma mais rÃ¡pida e objetiva.
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="submit"
                      disabled={isSubmitDisabled}
                      isLoading={loading}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {loading ? "Enviando solicitaÃ§Ã£o..." : "Enviar solicitaÃ§Ã£o"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setForm({
                          ...initialForm,
                          planSlug: plano || "",
                        });
                        setErrors({});
                        setError(null);
                        setSuccess(null);
                      }}
                    >
                      Limpar formulÃ¡rio
                    </Button>
                  </div>

                  <Link
                    href="/planos#comparacao-planos"
                    className="text-sm text-secondary transition hover:text-primary"
                  >
                    Voltar para planos
                  </Link>
                </div>
              </form>
            </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="rounded-[28px] border-border">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg">Resumo da solicitaÃ§Ã£o</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4">
                  <p className="text-sm font-medium text-primary">
                    Plano selecionado
                  </p>
                  <p className="mt-2 text-lg font-semibold text-primary">
                    {selectedPlan ? selectedPlan.name : "Ainda nÃ£o selecionado"}
                  </p>
                </div>

                <div className="space-y-3 text-sm leading-6 text-secondary">
                  <p>1. VocÃª envia sua solicitaÃ§Ã£o comercial.</p>
                  <p>2. A equipe avalia disponibilidade comercial e tÃ©cnica.</p>
                  <p>3. O retorno Ã© feito com os prÃ³ximos passos de instalaÃ§Ã£o.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-border">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg">Antes de contratar</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button asChild variant="secondary" className="justify-start">
                    <Link href="/cobertura#consulta-cobertura">Consultar cobertura</Link>
                  </Button>

                  <Button asChild variant="secondary" className="justify-start">
                    <Link href="/contato#formulario-contato">Falar com atendimento</Link>
                  </Button>

                  <Button asChild variant="secondary" className="justify-start">
                    <Link href="/planos#comparacao-planos">Comparar planos</Link>
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


