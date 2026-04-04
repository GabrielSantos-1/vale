import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/core/button";
import { Card } from "@/components/ui/core/card";
import { HeroQuickActions } from "@/components/marketing/hero-quick-actions";
import { PUBLIC_VISUALS } from "@/components/marketing/public-visuals";
import { cn } from "@/lib/cn";

export type HeroMetric = {
  label: string;
  value: string;
  description?: string;
};

export type HeroPanelVisual = {
  cardClassName?: string;
  imageSrc?: string | null;
  imageClassName?: string;
  overlayClassName?: string;
  glowClassName?: string;
};

export type HeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  badge?: string;
  note?: string;
  stats?: HeroMetric[];
  imageSrc?: string;
  className?: string;
  children?: ReactNode;
  panelVisual?: HeroPanelVisual;
};

const DEFAULT_PANEL_VISUAL: Required<HeroPanelVisual> = {
  cardClassName:
    "border-white/28 bg-[linear-gradient(180deg,rgba(10,20,36,0.34)_0%,rgba(15,42,74,0.28)_46%,rgba(24,84,140,0.22)_100%)]",
  imageSrc: "/images/fiber-hero-panel-wave.png",
  imageClassName:
    "object-cover object-center opacity-42 saturate-110 contrast-105 brightness-105",
  overlayClassName:
    "bg-[linear-gradient(180deg,rgba(8,18,36,0.32)_0%,rgba(10,28,54,0.2)_42%,rgba(15,55,102,0.12)_100%)]",
  glowClassName:
    "bg-[radial-gradient(circle_at_18%_12%,rgba(125,211,252,0.12),transparent_18%),radial-gradient(circle_at_78%_10%,rgba(96,165,250,0.10),transparent_22%),radial-gradient(circle_at_60%_58%,rgba(45,212,191,0.06),transparent_28%)]",
};

export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  badge = "Premium forte",
  note,
  stats,
  imageSrc = PUBLIC_VISUALS.heroFiber,
  className,
  children,
  panelVisual,
}: HeroProps) {
  const visual = {
    ...DEFAULT_PANEL_VISUAL,
    ...panelVisual,
  };

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[34px] border border-white/20 bg-[linear-gradient(180deg,#061120_0%,#0b1b33_54%,#0e2847_100%)] shadow-[0_28px_88px_rgba(2,6,23,0.4)]",
        className
      )}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="object-cover object-center opacity-52 saturate-120 contrast-105 brightness-95"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(20,184,166,0.12),transparent_24%),radial-gradient(circle_at_80%_12%,rgba(34,197,94,0.1),transparent_26%),linear-gradient(98deg,rgba(3,10,22,0.72)_0%,rgba(6,18,35,0.62)_46%,rgba(7,21,40,0.38)_78%,rgba(8,25,46,0.24)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,19,37,0.4)_0%,rgba(8,19,36,0.18)_34%,rgba(8,22,40,0.46)_100%)]" />
      </div>

      <div className="relative px-5 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 xl:px-9 xl:py-10">
        <div className="grid gap-6 xl:grid-cols-[1.04fr_0.86fr] xl:gap-8">
        <div className="min-w-0 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-slate-950/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/95 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]" />
            {badge}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
            {eyebrow}
          </p>

          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-white sm:text-5xl lg:text-[4.1rem]">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-100/90 sm:text-base md:text-lg">
            {description}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>

            {secondaryCta ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-cyan-100/28 bg-slate-900/35 text-cyan-50 hover:bg-slate-900/55 sm:w-auto"
              >
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>

          {children}
        </div>

        <div className="min-w-0 xl:flex xl:justify-end">
          <Card
            className={cn(
              "relative isolate w-full max-w-[360px] overflow-hidden rounded-[26px] border p-5 text-white shadow-[0_16px_40px_rgba(2,6,23,0.26)] backdrop-blur-lg xl:ml-auto",
              visual.cardClassName
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]"
            >
              {visual.imageSrc ? (
                <Image
                  src={visual.imageSrc}
                  alt=""
                  fill
                  sizes="360px"
                  className={visual.imageClassName}
                />
              ) : null}

              {visual.overlayClassName ? (
                <div className={cn("absolute inset-0", visual.overlayClassName)} />
              ) : null}

              {visual.glowClassName ? (
                <div className={cn("absolute inset-0", visual.glowClassName)} />
              ) : null}
            </div>

            <div className="relative z-10">
              <HeroQuickActions
                supportText={
                  note ??
                  "Acesse cobertura, status, suporte e teste de velocidade em um unico painel."
                }
              />
            </div>
          </Card>
        </div>
      </div>

        {stats && stats.length > 0 ? (
          <div className="mt-6 grid gap-3 rounded-[24px] border border-cyan-100/20 bg-[linear-gradient(180deg,rgba(8,22,40,0.34)_0%,rgba(10,28,50,0.26)_100%)] p-4 shadow-[0_10px_28px_rgba(2,6,23,0.2)] backdrop-blur-md md:grid-cols-3">
            {stats.slice(0, 3).map((metric) => (
              <div
                key={`${metric.label}-${metric.value}`}
                className="rounded-2xl border border-cyan-100/20 bg-slate-950/14 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/75">
                  {metric.label}
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-white">
                  {metric.value}
                </p>
                {metric.description ? (
                  <p className="mt-1 text-xs leading-5 text-slate-200/85">
                    {metric.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default Hero;
