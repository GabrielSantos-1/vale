"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";
import { ChartCard, type ChartPoint } from "@/components/ui/core/chart-card";

type MetricsView = "daily" | "weekly" | "monthly";

type SummaryStatus = "stable" | "warning" | "critical";

type AlertThreshold = {
  warning: number;
  critical: number;
};

type AlertRuntimeCounters = {
  total: number;
  warning: number;
  critical: number;
};

type ObservabilitySummary = {
  view: MetricsView;
  rangeLabel: string;
  totalEvents: number;
  totalRateLimited: number;
  totalErrors: number;
  errorRate: number;
  publicErrorRate: number;
  status: SummaryStatus;
  rateLimitedByRoute: Record<string, number>;
  errorsByRoute: Record<string, number>;
  publicRateLimited: number;
  publicErrors: number;
  authRateLimited: number;
  authErrors: number;
  authNoiseDetected: boolean;
  lastCriticalEvent: {
    action: string;
    route: string;
    timestamp: string;
  } | null;
};

type AlertCalibration = {
  windowMinutes: number;
  cooldownSeconds: number;
  enabled: boolean;
  hasWebhookUrl: boolean;
  thresholds: {
    rateLimit: AlertThreshold;
    error: AlertThreshold;
  };
};

type AlertHealth = {
  status: SummaryStatus;
  dispatched: AlertRuntimeCounters;
  suppressed: AlertRuntimeCounters;
};

type MetricsResponse = {
  success: boolean;
  data?: Array<ChartPoint & { date: string }>;
  meta?: {
    summary?: ObservabilitySummary;
    calibration?: AlertCalibration;
    alertHealth?: AlertHealth;
  };
  error?: {
    message?: string;
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

function statusBadgeVariant(status?: SummaryStatus) {
  if (status === "critical") return "danger";
  if (status === "warning") return "warning";
  return "success";
}

function statusLabel(status?: SummaryStatus) {
  if (status === "critical") return "Critico";
  if (status === "warning") return "Atencao";
  return "Estavel";
}

export function ObservabilityMetricsPanel() {
  const [view, setView] = useState<MetricsView>("daily");
  const [data, setData] = useState<ChartPoint[]>([]);
  const [summary, setSummary] = useState<ObservabilitySummary | undefined>();
  const [calibration, setCalibration] = useState<AlertCalibration | undefined>();
  const [alertHealth, setAlertHealth] = useState<AlertHealth | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async (selectedView: MetricsView) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/metrics/observability?view=${selectedView}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      const payload: MetricsResponse = await response.json();

      if (!payload.success) {
        setError(payload.error?.message ?? "Erro ao carregar observabilidade.");
        setData([]);
        setSummary(undefined);
        setCalibration(undefined);
        setAlertHealth(undefined);
        return;
      }

      setData(payload.data ?? []);
      setSummary(payload.meta?.summary);
      setCalibration(payload.meta?.calibration);
      setAlertHealth(payload.meta?.alertHealth);
    } catch (err) {
      logClientError(err);
      setError("Erro ao carregar observabilidade.");
      setData([]);
      setSummary(undefined);
      setCalibration(undefined);
      setAlertHealth(undefined);
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
        return "Conversao e incidentes por semana";
      case "monthly":
        return "Conversao e incidentes por mes";
      default:
        return "Conversao e incidentes por dia";
    }
  }, [view]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-soft">
      <div className="border-b border-border/80 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Badge variant="info" className="w-fit">
              Admin - Observabilidade
            </Badge>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-[1.75rem]">
                Sinais operacionais e conversao
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-secondary md:text-base">
                Acompanhe eventos aceitos, picos de bloqueio e erros operacionais
                em uma trilha consolidada e segura.
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
          description="Volume de eventos de conversao aceitos no periodo selecionado."
          data={data}
          className="border-0 bg-transparent shadow-none"
          rightSlot={
            <Badge
              variant={statusBadgeVariant(alertHealth?.status ?? summary?.status)}
              className="whitespace-nowrap"
            >
              Status: {statusLabel(alertHealth?.status ?? summary?.status)}
            </Badge>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Periodo"
            value={summary?.rangeLabel ?? (loading ? "Carregando..." : "Sem dados")}
          />
          <NumberCard label="Eventos aceitos" value={summary?.totalEvents ?? 0} />
          <NumberCard label="Rate-limited" value={summary?.totalRateLimited ?? 0} />
          <NumberCard label="Erros" value={summary?.totalErrors ?? 0} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NumberCard
            label="Incidentes Publicos - Rate-limited"
            value={summary?.publicRateLimited ?? 0}
          />
          <NumberCard
            label="Incidentes Publicos - Erros"
            value={summary?.publicErrors ?? 0}
          />
          <NumberCard
            label="Auth Admin - Rate-limited"
            value={summary?.authRateLimited ?? 0}
          />
          <NumberCard
            label="Auth Admin - Erros"
            value={summary?.authErrors ?? 0}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard
            label="Taxa de erro publica"
            value={`${summary?.publicErrorRate ?? 0}%`}
            accent={
              (alertHealth?.status ?? summary?.status) === "critical"
                ? "danger"
                : (alertHealth?.status ?? summary?.status) === "warning"
                  ? "warning"
                  : "success"
            }
          />
          <InfoCard
            label="Ultimo evento critico publico"
            value={
              summary?.lastCriticalEvent
                ? `${summary.lastCriticalEvent.route} (${new Date(summary.lastCriticalEvent.timestamp).toLocaleString("pt-BR")})`
                : "Nenhum"
            }
          />
        </div>

        <InfoCard
          label="Auth Admin (seguranca)"
          value={
            summary?.authNoiseDetected
              ? "Incidentes de auth detectados. Pode incluir teste controlado ou bloqueio de brute-force."
              : "Sem ruido de autenticacao admin no periodo."
          }
          accent={summary?.authNoiseDetected ? "warning" : "success"}
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NumberCard
            label="Alertas disparados"
            value={alertHealth?.dispatched.total ?? 0}
          />
          <NumberCard
            label="Alertas suprimidos"
            value={alertHealth?.suppressed.total ?? 0}
          />
          <InfoCard
            label="Janela / Cooldown"
            value={`${calibration?.windowMinutes ?? 5}m / ${calibration?.cooldownSeconds ?? 300}s`}
          />
          <InfoCard
            label="Webhook"
            value={
              calibration?.enabled
                ? calibration?.hasWebhookUrl
                  ? "Configurado"
                  : "Ativado sem URL"
                : "Desativado"
            }
            accent={
              calibration?.enabled
                ? calibration?.hasWebhookUrl
                  ? "success"
                  : "warning"
                : "default"
            }
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard
            label="Thresholds - Rate limit"
            value={`warning ${calibration?.thresholds?.rateLimit?.warning ?? "-"} | critical ${calibration?.thresholds?.rateLimit?.critical ?? "-"}`}
          />
          <InfoCard
            label="Thresholds - Erro"
            value={`warning ${calibration?.thresholds?.error?.warning ?? "-"} | critical ${calibration?.thresholds?.error?.critical ?? "-"}`}
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

function NumberCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-white/70 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.14em] text-secondary">{label}</p>
      <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: string;
  accent?: "default" | "success" | "warning" | "danger";
}) {
  const accentClass =
    accent === "success"
      ? "border-emerald-200 bg-emerald-50"
      : accent === "warning"
        ? "border-amber-200 bg-amber-50"
        : accent === "danger"
          ? "border-red-200 bg-red-50"
          : "border-border bg-white/70";

  return (
    <div className={`rounded-3xl border p-4 ${accentClass}`}>
      <p className="text-xs uppercase tracking-[0.14em] text-secondary">{label}</p>
      <p className="mt-2 text-base font-semibold text-primary">{value}</p>
    </div>
  );
}
