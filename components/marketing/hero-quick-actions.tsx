"use client";

import Link from "next/link";
import { Headset, MessageCircle, Radar, Wifi } from "lucide-react";
import type { ComponentType } from "react";

import { PUBLIC_CONTACT_ACTIONS, whatsappSupportUrl } from "@/lib/constants/contact";
import { cn } from "@/lib/cn";
import { trackPublicEvent } from "@/lib/telemetry/public-events";

type HeroQuickActionItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
};

type HeroQuickActionsProps = {
  supportText?: string;
  className?: string;
};

const QUICK_ACTIONS: HeroQuickActionItem[] = [
  {
    label: "Consultar cobertura",
    href: PUBLIC_CONTACT_ACTIONS.coverage.href,
    icon: Radar,
  },
  {
    label: "Ver status da rede",
    href: "/status#status-lista",
    icon: Wifi,
  },
  {
    label: "Falar com suporte",
    href: PUBLIC_CONTACT_ACTIONS.support.href,
    icon: Headset,
  },
  {
    label: "WhatsApp rapido",
    href: whatsappSupportUrl,
    icon: MessageCircle,
    external: true,
  },
];

function QuickActionLink({ item }: { item: HeroQuickActionItem }) {
  const Icon = item.icon;
  const baseClassName =
    "group flex min-h-[92px] flex-col justify-between rounded-2xl border border-white/24 bg-white/[0.08] p-3 shadow-[0_8px_20px_rgba(2,6,23,0.1)] backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/80";

  function handleTrackClick() {
    trackPublicEvent({
      eventName: "cta_click",
      page: "/",
      component: "hero_quick_actions",
      target: item.label,
      status: "click",
    });
  }

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClassName}
        onClick={handleTrackClick}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/24 bg-white/[0.1] text-white/95">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold leading-5 text-white">{item.label}</span>
      </a>
    );
  }

  return (
    <Link href={item.href} className={baseClassName} onClick={handleTrackClick}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/24 bg-white/[0.1] text-white/95">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold leading-5 text-white">{item.label}</span>
    </Link>
  );
}

export function HeroQuickActions({
  supportText = "Acesse cobertura, status e atendimento rapido sem sair da pagina inicial.",
  className,
}: HeroQuickActionsProps) {
  return (
    <div className={cn("relative z-10 space-y-4", className)}>
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/82">
          Acesso rapido
        </p>
        <p className="text-xl font-semibold leading-6 tracking-tight text-white">
          Servicos essenciais para cobertura, status, suporte e atendimento imediato.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {QUICK_ACTIONS.map((item) => (
          <QuickActionLink key={item.label} item={item} />
        ))}
      </div>

      <div className="rounded-2xl border border-white/24 bg-white/[0.08] p-3 text-xs leading-5 text-white/88 shadow-[0_6px_14px_rgba(2,6,23,0.1)] backdrop-blur-md">
        {supportText}
      </div>
    </div>
  );
}

export default HeroQuickActions;
