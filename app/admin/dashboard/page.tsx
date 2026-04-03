import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/ui/core/stat-card";
import { LeadsMetricsPanel } from "@/components/admin/dashboard/leads-metrics-panel";
import { ObservabilityMetricsPanel } from "@/components/admin/dashboard/observability-metrics-panel";
import { AdminHero } from "@/components/admin/layout/admin-hero";

export const metadata = {
  title: "Dashboard - Admin",
};

type DashboardCardTone = "default" | "info" | "warning" | "success" | "danger";

export default async function DashboardPage() {
  const [
    totalPlans,
    totalLeads,
    totalCoverageAreas,
    totalFaqs,
    totalVisibleStatus,
    totalContactMessages,
  ] = await Promise.all([
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
      description: "Áreas disponíveis cadastradas",
      tone: "default",
    },
    {
      label: "FAQs",
      value: totalFaqs,
      description: "Perguntas frequentes registradas",
      tone: "warning",
    },
    {
      label: "Status visíveis",
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

  const statusSummary =
    totalVisibleStatus > 0
      ? {
          label: "Atenção operacional",
          description:
            "Existem avisos públicos publicados. Revise a comunicação e a clareza do status.",
          tone: "border-amber-200/70 bg-amber-50 text-amber-700",
        }
      : {
          label: "Operação estável",
          description:
            "Nenhum incidente visível no momento. Painel pronto para acompanhamento contínuo.",
          tone: "border-emerald-200/70 bg-emerald-50 text-emerald-700",
        };

  const primaryCards = cards.slice(0, 4);
  const secondaryCards = cards.slice(4);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminHero
          badge="Admin - Dashboard executivo"
          title="Bem-vindo de volta. Aqui está o resumo da operação de hoje."
          description="Acompanhe captação, conteúdo publicado e status operacional em um painel enxuto e pronto para a próxima ação."
        />

        <div className={`rounded-[28px] border p-6 shadow-soft ${statusSummary.tone}`}>
          <p className="text-xs uppercase tracking-[0.2em]">Resumo imediato</p>
          <p className="mt-2 text-lg font-semibold">{statusSummary.label}</p>
          <p className="mt-2 text-sm leading-6 opacity-90">
            {statusSummary.description}
          </p>
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
