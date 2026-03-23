"use client";

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
import { Label } from "@/components/ui/forms/label";
import { Badge } from "@/components/ui/core/badge";

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

  const isSubmitDisabled = useMemo(() => {
    return (
      loading ||
      (!form.cep.trim() && !form.city.trim() && !form.district.trim())
    );
  }, [form, loading]);

  function updateField<K extends keyof CoverageForm>(
    field: K,
    value: CoverageForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8">
        <header className="space-y-3">
          <Badge variant="default">Cobertura</Badge>

          <div className="max-w-3xl">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Consulte disponibilidade na sua região
            </h1>

            <p className="mt-3 text-sm leading-6 text-secondary md:text-base">
              Pesquise por CEP, cidade ou bairro e veja se já existe cobertura
              disponível. Abaixo, você também encontra a listagem atual de áreas
              atendidas.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader>
              <CardTitle>Consulta rápida</CardTitle>
              <p className="text-sm text-secondary">
                Informe pelo menos um dos campos para buscar disponibilidade.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={form.cep}
                    onChange={(e) => updateField("cep", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="district">Bairro</Label>
                    <Input
                      id="district"
                      value={form.district}
                      onChange={(e) => updateField("district", e.target.value)}
                      placeholder="Seu bairro"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {result && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      result.available
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border border-yellow-500/20 bg-yellow-500/10 text-yellow-200"
                    }`}
                  >
                    <p className="font-semibold">
                      {result.available
                        ? "Cobertura disponível para a região informada."
                        : "Ainda não encontramos cobertura disponível para a região informada."}
                    </p>

                    {result.notes && <p className="mt-2">{result.notes}</p>}
                  </div>
                )}

                <Button type="submit" disabled={isSubmitDisabled} isLoading={loading}>
                  {loading ? "Consultando..." : "Consultar cobertura"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 text-sm text-secondary">
                <p>Total de áreas disponíveis: {areas.length}</p>
                <p>
                  A consulta rápida usa os dados cadastrados no sistema e pode
                  variar conforme atualização operacional.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Áreas atendidas</CardTitle>
            <p className="text-sm text-secondary">
              Lista pública das regiões atualmente marcadas como disponíveis.
            </p>
          </CardHeader>

          <CardContent>
            {areas.length === 0 ? (
              <div className="rounded-xl border border-border bg-background px-4 py-4 text-sm text-secondary">
                Ainda não há áreas cadastradas.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {areas.map((area) => (
                  <article
                    key={area.id}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-primary">
                        {area.city} — {area.district}
                      </h3>
                      <Badge variant="success">Disponível</Badge>
                    </div>

                    <p className="mt-2 text-sm text-secondary">
                      CEP: {area.cepStart} até {area.cepEnd}
                    </p>

                    {area.notes && (
                      <p className="mt-3 text-sm leading-6 text-secondary">
                        {area.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}