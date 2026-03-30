"use client";

import Link from "next/link";
import { Button } from "@/components/ui/core/button";
import { cn } from "@/lib/cn";
import { resolveStatusTone } from "@/components/marketing/status-tone";

type StatusBannerProps = {
  status?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

export function StatusBanner({
  status,
  title = "Visibilidade operacional da rede",
  description = "Atualizações públicas ajudam a reduzir dúvidas e melhorar a comunicação com clientes.",
  ctaLabel = "Ver status da rede",
  ctaHref = "/status#status-lista",
  className,
}: StatusBannerProps) {
  const tone = resolveStatusTone(status);

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
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-secondary backdrop-blur-sm">
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
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
