import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/core/badge";
import { SectionHeader } from "@/components/ui/core/section-header";
import { StatCard } from "@/components/ui/core/stat-card";

export const metadata = {
  title: "Dashboard - Admin",
};

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
    prisma.lead.count(),
    prisma.coverageArea.count(),
    prisma.fAQ.count(),
    prisma.networkStatus.count({ where: { isVisible: true } }),
    prisma.contactMessage.count(),
  ]);

  const cards = [
    {
      label: "Planos",
      value: totalPlans,
      description: "Planos cadastrados no sistema",
      accent: "text-emerald-600",
    },
    {
      label: "Leads",
      value: totalLeads,
      description: "Leads comerciais recebidos",
      accent: "text-blue-600",
    },
    {
      label: "Cobertura",
      value: totalCoverageAreas,
      description: "Áreas disponíveis cadastradas",
      accent: "text-violet-600",
    },
    {
      label: "FAQs",
      value: totalFaqs,
      description: "Perguntas frequentes registradas",
      accent: "text-amber-600",
    },
    {
      label: "Status visíveis",
      value: totalVisibleStatus,
      description: "Avisos e incidentes publicados",
      accent: "text-rose-600",
    },
    {
      label: "Mensagens",
      value: totalContactMessages,
      description: "Mensagens recebidas pelo contato",
      accent: "text-cyan-600",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <SectionHeader
          badge={
            <Badge variant="info" className="w-fit">
              Admin • Dashboard
            </Badge>
          }
          title="Visão geral do painel administrativo"
          description="Acompanhe rapidamente os principais volumes operacionais, comerciais e institucionais do sistema em um painel centralizado."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            description={card.description}
            accent={card.accent}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-surface shadow-soft">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold text-primary">
              Resumo operacional
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Estado atual do painel e dos módulos administrativos.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                Comercial
              </p>
              <p className="mt-2 text-sm leading-6 text-secondary">
                O módulo de leads já registra entrada comercial e pode evoluir com
                filtros, origem e acompanhamento de conversão.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                Atendimento
              </p>
              <p className="mt-2 text-sm leading-6 text-secondary">
                O módulo de contato já permite registrar mensagens recebidas e
                operar fluxo administrativo de leitura e resposta.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                Cobertura
              </p>
              <p className="mt-2 text-sm leading-6 text-secondary">
                A base de cobertura suporta cadastro por cidade, bairro e faixa de
                CEP para alimentar a consulta pública do site.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                Conteúdo
              </p>
              <p className="mt-2 text-sm leading-6 text-secondary">
                FAQ, planos e status formam o núcleo institucional e operacional
                publicado para o cliente final.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-soft">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold text-primary">
              Próximos passos
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Evolução visual e operacional recomendada.
            </p>
          </div>

          <div className="space-y-3 p-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">
                Padronizar listagens do admin
              </p>
              <p className="mt-1 text-sm leading-6 text-secondary">
                Unificar tabela, filtros, paginação e ações para leads, contato,
                planos, FAQ e status.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
              <p className="text-sm font-semibold text-primary">
                Adicionar métricas recentes
              </p>
              <p className="mt-1 text-sm leading-6 text-secondary">
                Exibir últimos leads, mensagens recentes e mudanças de status da
                rede para leitura rápida.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface-secondary p-4">
              <p className="text-sm font-semibold text-primary">
                Consolidar o design system
              </p>
              <p className="mt-1 text-sm leading-6 text-secondary">
                Seguir a Opção A como arquitetura oficial e remover o legado
                visual duplicado do projeto.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}