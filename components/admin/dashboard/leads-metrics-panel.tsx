"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";
import { ChartCard, type ChartPoint } from "@/components/ui/core/chart-card";

type MetricsView = "daily" | "weekly" | "monthly";

type MetricsSummary = {
  view: MetricsView;
  total: number;
  max: number;
  average: number;
  rangeLabel: string;
};

type MetricsResponse = {
  success: boolean;
  data?: Array<ChartPoint & { date: string }>;
  meta?: {
    summary?: MetricsSummary;
  };
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    correlationId?: string;
  };
};

const viewOptions: Array<{ value: MetricsView; label: string }> = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

function logClientError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

export function LeadsMetricsPanel() {
  const [view, setView] = useState<MetricsView>("daily");
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | undefined>();

  const loadMetrics = useCallback(async (selectedView: MetricsView) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/metrics/leads?view=${selectedView}`, {
        credentials: "include",
        cache: "no-store",
      });

      const payload: MetricsResponse = await response.json();

      if (!payload.success) {
        setError(payload.error?.message || "Erro ao carregar metricas.");
        setData([]);
        setSummary(undefined);
        return;
      }

      setData(payload.data ?? []);
      setSummary(payload.meta?.summary);
    } catch (err) {
      logClientError(err);
      setError("Erro ao carregar metricas.");
      setData([]);
      setSummary(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMetrics(view);
  }, [view, loadMetrics]);

  const title = useMemo(() => {
    switch (view) {
      case "weekly":
        return "Leads por semana";
      case "monthly":
        return "Leads por mês";
      default:
        return "Leads por dia";
    }
  }, [view]);

  const description = useMemo(() => {
    switch (view) {
      case "weekly":
        return "Acompanhe a evolução semanal das entradas comerciais para identificar tendência média do funil.";
      case "monthly":
        return "Visualize a distribuição mensal dos leads para entender sazonalidade e comportamento comercial.";
      default:
        return "Acompanhe o volume diário de entradas comerciais recentes para identificar queda, pico ou estabilidade operacional.";
    }
  }, [view]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-soft">
      <div className="border-b border-border/80 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="w-fit">
              Admin - Performance comercial
            </Badge>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-[1.75rem]">
                Capta o ritmo de entrada de leads
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-secondary md:text-base">
                Monitore a entrada comercial no periodo selecionado e acompanhe
                a intensidade do funil sem sair do dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {viewOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={view === option.value ? "default" : "outline"}
                onClick={() => setView(option.value)}
                disabled={loading}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <ChartCard
          title={title}
          description={description}
          data={data}
          className="border-0 bg-transparent shadow-none"
          rightSlot={
            summary ? (
              <Badge variant="success" className="whitespace-nowrap">
                {summary.total} no periodo
              </Badge>
            ) : null
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricsInfoCard
            label="Periodo"
            value={summary?.rangeLabel ?? (loading ? "Carregando..." : "Sem dados")}
            accent="info"
          />
          <MetricsNumberCard
            label="Total"
            value={summary?.total ?? 0}
            tone="default"
          />
          <MetricsNumberCard
            label="Media por Dia"
            value={summary?.average ?? 0}
            tone="info"
          />
          <MetricsNumberCard
            label="Pico"
            value={summary?.max ?? 0}
            tone="success"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MetricsInfoCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "info" | "success";
}) {
  const accentClass =
    accent === "success"
      ? "border-emerald-200 bg-emerald-50"
      : "border-border bg-white/70";

  return (
    <div className={`rounded-3xl border p-4 ${accentClass}`}>
      <p className="text-xs uppercase tracking-[0.14em] text-secondary">{label}</p>
      <p className="mt-2 text-base font-semibold text-primary">{value}</p>
    </div>
  );
}

function MetricsNumberCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "default" | "info" | "success";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700"
      : tone === "info"
      ? "text-cyan-700"
      : "text-primary";

  return (
    <div className="rounded-3xl border border-border bg-white/70 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.14em] text-secondary">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

