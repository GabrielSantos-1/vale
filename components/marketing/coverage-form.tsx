"use client";

import * as React from "react";
import { useState } from "react";
import { MapPin, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/core/button";
import { cn } from "@/lib/cn";

interface CoverageResult {
  available: boolean;
  notes?: string | null;
}

export function CoverageForm() {
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoverageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasSearchInput = cep.trim() || city.trim() || district.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSearchInput) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/coverage-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep: cep.trim() || undefined,
          city: city.trim() || undefined,
          district: district.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(
          json?.error?.message ?? "Não foi possível verificar a cobertura."
        );
        return;
      }

      setResult(json.data as CoverageResult);
    } catch {
      setError("Erro ao conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="coverage-cep" className="mb-1 block text-xs font-medium text-muted">
            CEP
          </label>
          <Input
            id="coverage-cep"
            type="text"
            placeholder="00000-000"
            value={cep}
            maxLength={9}
            onChange={(e) => setCep(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="coverage-city" className="mb-1 block text-xs font-medium text-muted">
            Cidade
          </label>
          <Input
            id="coverage-city"
            type="text"
            placeholder="Sua cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="coverage-district" className="mb-1 block text-xs font-medium text-muted">
            Bairro
          </label>
          <Input
            id="coverage-district"
            type="text"
            placeholder="Seu bairro"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          isLoading={loading}
          disabled={!hasSearchInput || loading}
          className="h-11"
        >
          {loading ? "Verificando..." : "Verificar"}
        </Button>
      </form>

      {error ? (
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--danger-border)] bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger-text)]">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {result && result.available ? (
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--success-border)] bg-[var(--success-bg)] p-4 text-sm text-[var(--success-text)]">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Cobertura disponível nessa região!
            {result.notes ? ` ${result.notes}` : ""}
          </span>
        </div>
      ) : null}

      {result && !result.available ? (
        <div
          className={cn(
            "rounded-[var(--radius-md)] border p-4 text-sm",
            "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]"
          )}
        >
          Não identificamos cobertura na região informada no momento.{" "}
          {result.notes ? result.notes : "Entre em contato para mais detalhes."}
        </div>
      ) : null}
    </div>
  );
}
