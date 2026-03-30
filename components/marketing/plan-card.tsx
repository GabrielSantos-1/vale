import Link from "next/link";

import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { cn } from "@/lib/cn";

export type PlanCardData = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  featured: boolean;
  downloadMbps: number;
  uploadMbps: number;
  latencyTarget: number;
  benefits?: string[];
};

type PlanCardProps = {
  plan: PlanCardData;
  ctaLabel?: string;
  compact?: boolean;
  className?: string;
};

function formatPrice(priceCents: number) {
  return (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getPlanHint(plan: PlanCardData) {
  if (plan.featured) return "Mais escolhido para uso diário";
  if (plan.downloadMbps >= 500) {
    return "Ideal para streaming, trabalho e múltiplos dispositivos";
  }
  return "Boa opção para navegação, estudo e uso residencial";
}

function getPlanEyebrow(plan: PlanCardData) {
  if (plan.featured) return "Plano em destaque";
  if (plan.downloadMbps >= 500) return "Alta performance";
  return "Plano residencial";
}

export function PlanCard({
  plan,
  ctaLabel = "Contratar plano",
  compact = false,
  className,
}: PlanCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[30px] border border-border public-card transition-all duration-300",
        "hover:-translate-y-[3px] hover:shadow-soft-lg",
        plan.featured
          ? "border-emerald-300/90 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(243,255,247,0.96)_100%)] shadow-[0_18px_55px_rgba(47,158,68,0.12)]"
          : "hover:border-border-strong",
        className
      )}
    >
      {plan.featured ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(47,158,68,0.95),rgba(16,185,129,0.65),rgba(47,158,68,0.95))]"
        />
      ) : null}

      <CardHeader className="space-y-5 border-b border-border/70 p-5 sm:p-6">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {getPlanEyebrow(plan)}
          </p>

          <CardTitle className="break-words text-2xl tracking-tight text-primary">
            {plan.name}
          </CardTitle>
        </div>

        <div className="rounded-[24px] border border-border bg-surface-secondary/80 p-4 sm:p-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted">Preço mensal</p>

            <div className="flex flex-wrap items-end gap-2">
              <p className="text-4xl font-bold leading-none tracking-tight text-primary">
                {formatPrice(plan.priceCents)}
              </p>
              <span className="pb-1 text-sm font-medium text-muted">/mês</span>
            </div>

            <p className="text-xs leading-5 text-secondary">{getPlanHint(plan)}</p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                Download
              </p>
              <p className="mt-2 break-words text-base font-semibold text-primary">
                {plan.downloadMbps} Mbps
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                Upload
              </p>
              <p className="mt-2 break-words text-base font-semibold text-primary">
                {plan.uploadMbps} Mbps
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                Latência
              </p>
              <p className="mt-2 break-words text-base font-semibold text-primary">
                {plan.latencyTarget} ms
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        {!compact && plan.benefits && plan.benefits.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">Benefícios incluídos</p>

            <ul className="space-y-2.5 text-sm leading-6 text-secondary">
              {plan.benefits.map((benefit, index) => (
                <li key={`${plan.id}-${index}`} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span className="break-words">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/60 p-4">
            <p className="text-sm leading-6 text-secondary">
              Ideal para quem busca velocidade, estabilidade e contratação com informações claras.
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              Sujeito à disponibilidade de cobertura na região.
            </p>
          </div>
        )}

        <div className="mt-auto space-y-3 pt-1">
          <Button asChild className="w-full" variant="default" size="lg">
            <Link
              href={{
                pathname: "/contratar",
                query: { plano: plan.slug },
                hash: "formulario-solicitacao",
              }}
            >
              {ctaLabel}
            </Link>
          </Button>

          <p className="text-center text-xs text-muted">
            Instalação rápida • Atendimento comercial
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
