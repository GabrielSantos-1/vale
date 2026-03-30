"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Container } from "@/components/ui/core/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { StatusBanner } from "@/components/marketing/status-banner";

type CoverageArea = {
  id: string;
  city: string;
  district: string;
  cepStart: string;
  cepEnd: string;
  notes: string | null;
  isAvailable: boolean;
};

type Props = {
  areas: CoverageArea[];
};

type CoverageForm = {
  cep: string;
  city: string;
  district: string;
};

const initialForm: CoverageForm = {
  cep: "",
  city: "",
  district: "",
};

type CoverageResponse =
  | {
      success: true;
      data: {
        available: boolean;
        notes: string | null;
      };
    }
  | {
      success: false;
      error: string | { message?: string }[];
    };

export default function CoberturaClient({ areas }: Props) {
  const [form, setForm] = useState<CoverageForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    available: boolean;
    notes: string | null;
  } | null>(null);

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const uniqueCities = useMemo(() => {
    return new Set(areas.map((area) => area.city.trim().toLowerCase())).size;
  }, [areas]);

  const uniqueDistricts = useMemo(() => {
    return new Set(
      areas.map(
        (area) =>
          `${area.city.trim().toLowerCase()}::${area.district
            .trim()
            .toLowerCase()}`
      )
    ).size;
  }, [areas]);

  const isSubmitDisabled = useMemo(() => {
    return (
      loading ||
      (!form.cep.trim() && !form.city.trim() && !form.district.trim())
    );
  }, [form, loading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#consulta-cobertura") return;

    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  function updateField<K extends keyof CoverageForm>(
    field: K,
    value: CoverageForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetFeedback() {
    setError(null);
    setResult(null);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/coverage-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          cep: form.cep.trim() || undefined,
          city: form.city.trim() || undefined,
          district: form.district.trim() || undefined,
        }),
      });

      const data: CoverageResponse = await response.json();

      if (!response.ok || !data.success) {
        if (Array.isArray((data as { error?: unknown }).error)) {
          const first = (data as { error: { message?: string }[] }).error[0];
          throw new Error(first?.message || "Dados inválidos.");
        }

        throw new Error(
          (data as { error?: string }).error ||
            "Não foi possível consultar a cobertura."
        );
      }

      setResult(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao consultar cobertura."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClearForm() {
    setForm(initialForm);
    setError(null);
    setResult(null);
  }

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <header className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Cobertura
            </p>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                Consulte disponibilidade na sua região
              </h1>

              <p className="text-sm leading-6 text-secondary md:text-base">
                Pesquise por CEP, cidade ou bairro para verificar disponibilidade
                antes de avançar para contratação. Abaixo, você também encontra a
                listagem pública das áreas já atendidas.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="rounded-[24px] border-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted">
                    Áreas disponíveis
                  </p>
                  <p className="text-3xl font-semibold tracking-tight text-primary">
                    {areas.length}
                  </p>
                  <p className="text-sm leading-6 text-secondary">
                    Regiões públicas marcadas como disponíveis no sistema.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted">
                    Cidades mapeadas
                  </p>
                  <p className="text-3xl font-semibold tracking-tight text-primary">
                    {uniqueCities}
                  </p>
                  <p className="text-sm leading-6 text-secondary">
                    Visão pública por cidade para reduzir atrito na consulta
                    inicial.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] sm:col-span-2 xl:col-span-1">
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted">
                    Regiões listadas
                  </p>
                  <p className="text-3xl font-semibold tracking-tight text-primary">
                    {uniqueDistricts}
                  </p>
                  <p className="text-sm leading-6 text-secondary">
                    Bairros ou combinações públicas de cidade e distrito já
                    visíveis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        <StatusBanner
          status="Consulta pública"
          title="Validação rápida antes da contratação"
          description="Reduza atrito comercial com uma consulta simples e uma visualização clara das áreas disponíveis."
        />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div
            ref={formSectionRef}
            id="consulta-cobertura"
            className="scroll-mt-24"
          >
            <Card className="rounded-[28px] border-border">
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl">Consulta rápida</CardTitle>
                <p className="text-sm leading-6 text-secondary">
                  Informe pelo menos um campo para buscar disponibilidade. O
                  ideal é usar CEP, cidade ou bairro com o máximo de precisão.
                </p>
              </CardHeader>

              <CardContent className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={9}
                        value={form.cep}
                        onChange={(e) => {
                          resetFeedback();
                          handleCepChange(e.target.value);
                        }}
                        placeholder="00000-000"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={form.city}
                          onChange={(e) => {
                            resetFeedback();
                            updateField("city", e.target.value);
                          }}
                          placeholder="Sua cidade"
                          autoComplete="address-level2"
                          maxLength={80}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">Bairro</Label>
                        <Input
                          id="district"
                          value={form.district}
                          onChange={(e) => {
                            resetFeedback();
                            updateField("district", e.target.value);
                          }}
                          placeholder="Seu bairro"
                          autoComplete="address-level3"
                          maxLength={80}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4">
                    <p className="text-sm font-medium text-primary">
                      Como usar a consulta
                    </p>
                    <p className="mt-2 text-sm leading-6 text-secondary">
                      Você pode pesquisar por CEP, cidade ou bairro. Para um
                      retorno mais preciso, prefira informar dados reais da
                      região onde a instalação será feita.
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

                  {result ? (
                    <div
                      className={
                        result.available
                          ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700"
                          : "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700"
                      }
                      role="status"
                    >
                      <p className="font-semibold">
                        {result.available
                          ? "Cobertura disponível para a região informada."
                          : "Ainda não encontramos cobertura disponível para a região informada."}
                      </p>

                      {result.notes ? (
                        <p className="mt-2 leading-6">{result.notes}</p>
                      ) : null}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {result.available ? (
                          <>
                            <Button asChild className="w-full sm:w-auto">
                              <Link href="/contratar#formulario-solicitacao">
                                Avançar para contratação
                              </Link>
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              className="w-full sm:w-auto"
                            >
                              <Link href="/contato#formulario-contato">
                                Tirar dúvidas
                              </Link>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              asChild
                              variant="secondary"
                              className="w-full sm:w-auto"
                            >
                              <Link href="/contato#formulario-contato">
                                Falar com atendimento
                              </Link>
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              className="w-full sm:w-auto"
                            >
                              <Link href="/planos#comparacao-planos">
                                Ver planos
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button
                      type="submit"
                      disabled={isSubmitDisabled}
                      isLoading={loading}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {loading ? "Consultando..." : "Consultar cobertura"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={handleClearForm}
                    >
                      Limpar consulta
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <aside className="xl:sticky xl:top-24">
            <Card className="rounded-[28px] border-border">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4">
                  <p className="text-sm font-medium text-primary">
                    Total de áreas disponíveis
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">
                    {areas.length}
                  </p>
                </div>

                <div className="space-y-3 text-sm leading-6 text-secondary">
                  <p>
                    A consulta rápida usa os dados cadastrados no sistema e pode
                    variar conforme atualização operacional.
                  </p>
                  <p>
                    Após confirmar a disponibilidade, o próximo passo ideal é
                    seguir para a jornada comercial de contratação.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full">
                    <Link href="/contratar#formulario-solicitacao">
                      Quero contratar
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contato#formulario-contato">
                      Falar com atendimento
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Áreas públicas
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
              Regiões atendidas
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-secondary md:text-base">
              Lista pública das regiões atualmente marcadas como disponíveis.
            </p>
          </div>

          <Card className="rounded-[28px] border-border">
            <CardContent className="p-5 sm:p-6">
              {areas.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-secondary">
                  Ainda não há áreas cadastradas publicamente.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {areas.map((area) => (
                    <article
                      key={area.id}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <h3 className="text-base font-semibold leading-6 text-primary">
                        {area.city} — {area.district}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-secondary">
                        CEP: {area.cepStart} até {area.cepEnd}
                      </p>

                      {area.notes ? (
                        <p className="mt-3 text-sm leading-6 text-secondary">
                          {area.notes}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </Container>
  );
}