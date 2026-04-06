import { AdminHero } from "@/components/admin/layout/admin-hero";
import { LeadsMetricsPanel } from "@/components/admin/dashboard/leads-metrics-panel";
import { ObservabilityMetricsPanel } from "@/components/admin/dashboard/observability-metrics-panel";
import { StatCard } from "@/components/ui/core/stat-card";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/security/logger";

export const metadata = {
  title: "Dashboard - Admin",
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardCardTone = "default" | "info" | "warning" | "success" | "danger";

type StatusSummary = {
  label: string;
  description: string;
  tone: string;
};

function resolveCount(result: PromiseSettledResult<number>) {
  return result.status === "fulfilled" ? result.value : 0;
}

function buildStatusSummary(params: {
  hasCountFailure: boolean;
  totalVisibleStatus: number;
}): StatusSummary {
  if (params.hasCountFailure) {
    return {
      label: "Dados operacionais parcialmente indisponiveis",
      description:
        "Detectamos instabilidade de leitura no banco. O painel segue online com valores de contingencia.",
      tone: "border-amber-200/70 bg-amber-50 text-amber-700",
    };
  }

  if (params.totalVisibleStatus > 0) {
    return {
      label: "Atencao operacional",
      description:
        "Existem avisos publicos publicados. Revise a comunicacao e a clareza do status.",
      tone: "border-amber-200/70 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Operacao estavel",
    description:
      "Nenhum incidente visivel no momento. Painel pronto para acompanhamento continuo.",
    tone: "border-emerald-200/70 bg-emerald-50 text-emerald-700",
  };
}

export default async function DashboardPage() {
  const countResults = await Promise.allSettled([
    prisma.plan.count(),
    prisma.lead.count({
      where: { deletedAt: null },
    }),
    prisma.coverageArea.count(),
    prisma.fAQ.count(),
    prisma.networkStatus.count({ where: { isVisible: true } }),
    prisma.contactMessage.count({
      where: { deletedAt: null },
    }),
  ]);

  const hasCountFailure = countResults.some((result) => result.status === "rejected");

  if (hasCountFailure) {
    logger.error("Admin dashboard degraded due to count query failure", {
      route: "/admin/dashboard",
      failures: countResults
        .map((result, index) =>
          result.status === "rejected"
            ? {
                index,
                reason:
                  result.reason instanceof Error
                    ? result.reason.message
                    : String(result.reason),
              }
            : null,
        )
        .filter(Boolean),
    });
  }

  const totalPlans = resolveCount(countResults[0]);
  const totalLeads = resolveCount(countResults[1]);
  const totalCoverageAreas = resolveCount(countResults[2]);
  const totalFaqs = resolveCount(countResults[3]);
  const totalVisibleStatus = resolveCount(countResults[4]);
  const totalContactMessages = resolveCount(countResults[5]);

  const cards: Array<{
    label: string;
    value: number;
    description: string;
    tone: DashboardCardTone;
  }> = [
    {
      label: "Planos",
      value: totalPlans,
      description: "Planos cadastrados no sistema",
      tone: "success",
    },
    {
      label: "Leads",
      value: totalLeads,
      description: "Leads comerciais recebidos",
      tone: "info",
    },
    {
      label: "Cobertura",
      value: totalCoverageAreas,
      description: "Areas disponiveis cadastradas",
      tone: "default",
    },
    {
      label: "FAQs",
      value: totalFaqs,
      description: "Perguntas frequentes registradas",
      tone: "warning",
    },
    {
      label: "Status visiveis",
      value: totalVisibleStatus,
      description: "Avisos e incidentes publicados",
      tone: "danger",
    },
    {
      label: "Mensagens",
      value: totalContactMessages,
      description: "Mensagens recebidas pelo contato",
      tone: "info",
    },
  ];

  const statusSummary = buildStatusSummary({
    hasCountFailure,
    totalVisibleStatus,
  });

  const primaryCards = cards.slice(0, 4);
  const secondaryCards = cards.slice(4);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminHero
          badge="Admin - Dashboard executivo"
          title="Bem-vindo de volta. Aqui esta o resumo da operacao de hoje."
          description="Acompanhe captacao, conteudo publicado e status operacional em um painel enxuto e pronto para a proxima acao."
        />

        <div className={`rounded-[28px] border p-6 shadow-soft ${statusSummary.tone}`}>
          <p className="text-xs uppercase tracking-[0.2em]">Resumo imediato</p>
          <p className="mt-2 text-lg font-semibold">{statusSummary.label}</p>
          <p className="mt-2 text-sm leading-6 opacity-90">{statusSummary.description}</p>
          <div className="mt-5 rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-secondary">
            {totalLeads} leads ativos - {totalContactMessages} mensagens - {totalPlans} planos
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            description={card.description}
            tone={card.tone}
          />
        ))}
      </section>

      <section className="grid gap-6">
        <LeadsMetricsPanel />
        <ObservabilityMetricsPanel />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {secondaryCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            description={card.description}
            tone={card.tone}
          />
        ))}
      </section>
    </div>
  );
}
