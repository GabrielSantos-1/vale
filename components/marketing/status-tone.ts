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
        "border-emerald-300/35 bg-[linear-gradient(180deg,rgba(6,28,24,0.28)_0%,rgba(7,32,28,0.22)_100%)] backdrop-blur-md",
      cardClassName: "border-emerald-300/45 bg-emerald-500/12 text-emerald-100",
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
        "border-amber-300/35 bg-[linear-gradient(180deg,rgba(37,27,8,0.3)_0%,rgba(43,30,8,0.24)_100%)] backdrop-blur-md",
      cardClassName: "border-amber-300/45 bg-amber-500/12 text-amber-100",
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
        "border-red-300/35 bg-[linear-gradient(180deg,rgba(43,14,14,0.32)_0%,rgba(51,15,15,0.24)_100%)] backdrop-blur-md",
      cardClassName: "border-red-300/45 bg-red-500/12 text-red-100",
    };
  }

  return {
    dotClassName: "bg-sky-400",
      pillText: "Status público disponível",
    panelClassName:
      "border-cyan-300/30 bg-[linear-gradient(180deg,rgba(8,24,40,0.28)_0%,rgba(10,28,48,0.22)_100%)] backdrop-blur-md",
    cardClassName: "border-sky-300/45 bg-sky-500/12 text-sky-100",
  };
}
