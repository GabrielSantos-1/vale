"use client";

import Link from "next/link";
import { Button } from "@/components/ui/core/button";
import { cn } from "@/lib/cn";
import { resolveStatusTone } from "@/components/marketing/status-tone";
import { trackPublicEvent } from "@/lib/telemetry/public-events";

type StatusBannerProps = {
  status?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  telemetryPage?: string;
  telemetryComponent?: string;
  className?: string;
};

export function StatusBanner({
  status,
  title = "Visibilidade operacional da rede",
  description = "Atualizacoes publicas ajudam a reduzir duvidas e melhorar a comunicacao com clientes.",
  ctaLabel = "Ver status da rede",
  ctaHref = "/status#status-lista",
  telemetryPage,
  telemetryComponent = "status_banner",
  className,
}: StatusBannerProps) {
  const tone = resolveStatusTone(status);

  const resolvedTelemetryPage =
    telemetryPage ||
    (typeof window !== "undefined" ? window.location.pathname : "/status");

  return (
    <section
      aria-label="Resumo operacional"
      className={cn(
        "rounded-[32px] border shadow-soft transition-all duration-300",
        tone.panelClassName,
        className
      )}
    >
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/24 bg-slate-950/18 px-3 py-1 text-xs font-medium text-slate-100/90 backdrop-blur-sm">
            <span className={cn("h-2 w-2 rounded-full", tone.dotClassName)} />
            {tone.pillText}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-primary md:text-2xl">
              {title}
            </h3>

            <p className="text-sm leading-6 text-secondary md:text-base">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link
              href={ctaHref}
              onClick={() =>
                trackPublicEvent({
                  eventName: "cta_click",
                  page: resolvedTelemetryPage,
                  component: telemetryComponent,
                  target: ctaHref,
                  status: "click",
                })
              }
            >
              {ctaLabel}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
