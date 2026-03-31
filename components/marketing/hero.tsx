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
    "border-white/20 bg-[linear-gradient(180deg,rgba(10,20,36,0.72)_0%,rgba(15,42,74,0.62)_46%,rgba(24,84,140,0.48)_100%)]",
  imageSrc: "/images/public/fiber-hero-panel-wave.png",
  imageClassName:
    "object-cover object-center opacity-42 saturate-110 contrast-105 brightness-105",
  overlayClassName:
    "bg-[linear-gradient(180deg,rgba(8,18,36,0.48)_0%,rgba(10,28,54,0.30)_42%,rgba(15,55,102,0.18)_100%)]",
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
        "relative isolate overflow-hidden rounded-[36px] border border-white/18 bg-[linear-gradient(180deg,#0b1a2f_0%,#123059_52%,#19487f_100%)] shadow-[0_28px_80px_rgba(2,6,23,0.24)]",
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
          className="object-cover object-center opacity-46 saturate-120 brightness-105"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(47,158,68,0.14),transparent_24%),radial-gradient(circle_at_84%_12%,rgba(14,165,233,0.18),transparent_24%),linear-gradient(90deg,rgba(8,22,44,0.76)_0%,rgba(10,30,60,0.58)_48%,rgba(10,36,72,0.34)_76%,rgba(10,42,82,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_32%,rgba(9,27,54,0.08))]" />
      </div>

      <div className="relative grid gap-6 px-5 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 xl:grid-cols-[1.08fr_0.82fr] xl:gap-8 xl:px-8 xl:py-10">
        <div className="min-w-0 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {badge}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
            {eyebrow}
          </p>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-[4.25rem]">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/88 sm:text-base md:text-lg">
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
                className="w-full border-white/25 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
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
              "relative isolate w-full max-w-[360px] overflow-hidden rounded-[28px] border p-5 text-white shadow-[0_18px_42px_rgba(2,6,23,0.18)] backdrop-blur-2xl xl:ml-auto",
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
                  "Acesse cobertura, status, suporte e teste de velocidade em um único painel."
                }
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Hero;
