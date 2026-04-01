import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { Container } from "@/components/ui/core/container";
import { Card, CardContent } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { Hero } from "@/components/marketing/hero";
import { PlanCard, type PlanCardData } from "@/components/marketing/plan-card";
import { StatusBanner } from "@/components/marketing/status-banner";
import { resolveStatusTone } from "@/components/marketing/status-tone";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { FaqPreview } from "@/components/marketing/faq-preview";

type HomeData = {
  plans: PlanCardData[];
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
  visibleStatus: {
    id: string;
    title: string;
    description: string | null;
    status: string;
  }[];
};

async function getHomeData(): Promise<HomeData> {
  const [plans, faqs, visibleStatus] = await Promise.all([
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ featured: "desc" }, { priceCents: "asc" }],
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        priceCents: true,
        featured: true,
        badge: true,
        downloadMbps: true,
        uploadMbps: true,
        latencyTarget: true,
      },
    }),
    prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        question: true,
        answer: true,
      },
    }),
    prisma.networkStatus.findMany({
      where: { isVisible: true },
      orderBy: { startedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
      },
    }),
  ]);

  return { plans, faqs, visibleStatus };
}

const metrics = [
  {
    label: "Clientes atendidos",
    value: "+1.200",
    description: "Base regional atendida com suporte próximo e resposta clara.",
  },
  {
    label: "Instalação",
    value: "Até 24h",
    description: "Agendamento ágil para ativar sua fibra sem burocracia.",
  },
  {
    label: "Disponibilidade",
    value: "99.9%",
    description: "Rede monitorada com comunicação transparente de status.",
  },
  {
    label: "Velocidade",
    value: "Máxima",
    description: "Planos com desempenho estável para rotina, trabalho e streaming.",
  },
] as const;

const fallbackStatusItems = [
  {
    id: "status-fallback",
    title: "Sem incidentes públicos no momento",
    description:
      "Acompanhe esta área para manutenção programada, avisos operacionais e atualizações da rede.",
    status: "Operacional",
  },
];

export default async function Home() {
  const { plans, faqs, visibleStatus } = await getHomeData();

  const statusItems = visibleStatus.length > 0 ? visibleStatus : fallbackStatusItems;

  return (
    <Container as="main" className="py-6 md:py-10">
      <div className="space-y-10 md:space-y-14">
        <Hero
          eyebrow="Internet fibra para residências e empresas da região"
          badge="Provedor regional de fibra"
          title="Fibra óptica estável para sua casa, com atendimento próximo e operação transparente"
          description="Veja se atendemos seu endereço, escolha o plano ideal e acompanhe o status da rede em tempo real."
          primaryCta={{ label: "Consultar cobertura", href: "/planos#comparacao-planos" }}
          secondaryCta={{ label: "Ver planos", href: "/cobertura#consulta-cobertura" }}
          note="Contratação simples, suporte humano e comunicação clara do início ao pós-instalação."
          stats={[
            { label: "Cobertura", value: "Consulta por endereço" },
            { label: "Instalação", value: "Agendamento rápido" },
            { label: "Status", value: "Atualizações em tempo real" },
            { label: "Suporte", value: "Atendimento próximo" },
          ]}
        />

        <section
          aria-label="Indicadores principais"
          className="rounded-[24px] border border-border bg-surface p-4 shadow-soft md:p-5"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-border/80 bg-surface px-4 py-3 shadow-soft"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {metric.label}
                  </p>
                  <p className="text-sm font-semibold tracking-tight text-primary md:text-base">
                    {metric.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <FeaturesGrid
          eyebrow="Diferenciais"
          title="Confiança para contratar e permanecer conectado"
          description="Cobertura consultável, instalação acompanhada e comunicação transparente para você saber exatamente o que esperar do serviço."
          items={[
            {
              title: "Cobertura com consulta por endereço",
              description:
                "Confira se atendemos sua região antes de contratar, com resposta clara e objetiva.",
            },
            {
              title: "Instalação com acompanhamento próximo",
              description:
                "Do agendamento ao pós-instalação, você conta com equipe local para orientar cada etapa.",
            },
            {
              title: "Status da rede com transparência",
              description:
                "Comunicados públicos de manutenção e normalização para reduzir dúvidas no dia a dia.",
            },
          ]}
        />

        <section className="space-y-6 md:space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                Planos de fibra
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
                Escolha o plano ideal para sua rotina
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-secondary md:text-base">
                Compare velocidade, latência e valor mensal com clareza para contratar com segurança.
              </p>
            </div>

            <Button asChild variant="ghost">
              <Link href="/planos#comparacao-planos">Comparar todos os planos</Link>
            </Button>
          </div>

          {plans.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  compact
                  ctaLabel="Quero este plano"
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-[28px] border-border public-card">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl space-y-2">
                  <h3 className="text-lg font-semibold text-primary md:text-xl">
                    Planos em atualização
                  </h3>
                  <p className="text-sm leading-6 text-secondary">
                    Estamos organizando as opções públicas para exibir cobertura, velocidade e contratação de forma mais clara.
                  </p>
                </div>

                <Button asChild className="w-full md:w-auto">
                  <Link href="/contato#formulario-contato">Falar com atendimento</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-6 md:space-y-8">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Operação
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
              Status da rede
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-secondary md:text-base">
              Transparência operacional para manutenção, normalização e comunicação com o cliente.
            </p>
          </div>

          <StatusBanner status={statusItems[0]?.status} />

          <div className="grid gap-4 lg:grid-cols-3">
            {statusItems.map((item) => {
              const tone = resolveStatusTone(item.status);

              return (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-border bg-surface p-5 shadow-soft sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dotClassName}`}
                    />
                    <div className="space-y-1">
                      <h3 className="text-base leading-6 text-primary">
                        {item.title}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                        {item.status}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 rounded-2xl border p-4 ${tone.cardClassName}`}>
                    <p className="text-sm leading-6 text-secondary">
                      {item.description || "Sem descrição adicional no momento."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <FaqPreview items={faqs} />
      </div>
    </Container>
  );
}
