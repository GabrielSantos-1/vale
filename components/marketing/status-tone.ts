export type StatusTone = {
  dotClassName: string;
  pillText: string;
  panelClassName: string;
  cardClassName: string;
};

export function resolveStatusTone(status?: string): StatusTone {
  const normalized = (status ?? "").toLowerCase();

  if (
    normalized.includes("operacional") ||
    normalized.includes("normal") ||
    normalized.includes("online")
  ) {
    return {
      dotClassName: "bg-emerald-400",
      pillText: "Operando normalmente",
      panelClassName:
        "border-emerald-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(243,255,248,0.95)_100%)]",
      cardClassName: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
    };
  }

  if (
    normalized.includes("manutenção") ||
    normalized.includes("manutencao") ||
    normalized.includes("atenção") ||
    normalized.includes("atencao")
  ) {
    return {
      dotClassName: "bg-amber-400",
      pillText: "Monitoramento e manutenção",
      panelClassName:
        "border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,250,240,0.96)_100%)]",
      cardClassName: "border-amber-200 bg-amber-50/80 text-amber-900",
    };
  }

  if (
    normalized.includes("incidente") ||
    normalized.includes("offline") ||
    normalized.includes("indisponivel")
  ) {
    return {
      dotClassName: "bg-red-400",
      pillText: "Incidentes em acompanhamento",
      panelClassName:
        "border-red-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,245,245,0.96)_100%)]",
      cardClassName: "border-red-200 bg-red-50/80 text-red-900",
    };
  }

  return {
    dotClassName: "bg-sky-400",
      pillText: "Status público disponível",
    panelClassName:
      "border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,251,255,0.96)_100%)]",
    cardClassName: "border-sky-200 bg-sky-50/80 text-sky-900",
  };
}
