import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/security/logger";
import { Container } from "@/components/ui/core/container";
import { Card, CardContent } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { Hero } from "@/components/marketing/hero";
import { PlanCard } from "@/components/marketing/plan-card";

export const metadata = {
  title: "Planos | Verde Vale Connect",
};

export const dynamic = "force-dynamic";

async function getPlansData() {
  const correlationId = crypto.randomUUID();

  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ featured: "desc" }, { priceCents: "asc" }, { createdAt: "desc" }],
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
        benefitsJson: true,
      },
    });

    return { plans };
  } catch (error) {
    logger.error("Failed to load public plans", {
      correlationId,
      route: "/planos",
      error,
    });

    return { plans: [] };
  }
}

type PlansPageData = Awaited<ReturnType<typeof getPlansData>>;
type PublicPlan = PlansPageData["plans"][number];

function mapBenefits(plan: PublicPlan): string[] {
  const rawBenefits = Array.isArray(plan.benefitsJson) ? (plan.benefitsJson as unknown[]) : [];
  return rawBenefits.filter((item: unknown): item is string => typeof item === "string");
}

export default async function PlanosPage() {
  const { plans }: PlansPageData = await getPlansData();

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <Hero
          eyebrow="Internet fibra | planos para casa e empresa | cobertura regional"
          badge="Planos de internet fibra"
          title="Planos de internet fibra com leitura clara e contratacao sem atrito"
          description="Compare opcoes por velocidade, preco e latencia para escolher o plano ideal com mais seguranca."
          primaryCta={{ label: "Contratar agora", href: "/contratar#formulario-solicitacao" }}
          secondaryCta={{ label: "Consultar cobertura", href: "/cobertura#consulta-cobertura" }}
          note="Fluxo comercial direto do comparativo para contratacao, com suporte regional."
          stats={[
            {
              label: "Plano principal",
              value: "Destaque equilibrado",
              description: "A leitura comparativa prioriza clareza e decisao rapida.",
            },
            {
              label: "Instalacao",
              value: "Agendamento agil",
              description: "Da escolha do plano ao contato comercial sem ruído.",
            },
            {
              label: "Operacao local",
              value: "Atendimento proximo",
              description: "Equipe regional no pre e pos-contratacao.",
            },
          ]}
        />

        {plans.length === 0 ? (
          <Card className="rounded-[28px] border-cyan-100/16 public-card">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-lg font-semibold text-primary md:text-xl">
                  Nenhum plano disponivel no momento
                </h2>
                <p className="text-sm leading-6 text-secondary">
                  Estamos atualizando a grade comercial. Enquanto isso, consulte cobertura ou fale
                  com nosso atendimento.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="secondary"
                  className="w-full border-cyan-100/18 bg-slate-950/30 text-slate-100 hover:bg-slate-900/45 sm:w-auto"
                >
                  <Link href="/cobertura#consulta-cobertura">Consultar cobertura</Link>
                </Button>

                <Button asChild className="w-full sm:w-auto">
                  <Link href="/contato#formulario-contato">Entrar em contato</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <section id="comparacao-planos" className="space-y-6 scroll-mt-24 md:scroll-mt-28">
            <div className="public-card rounded-[24px] border-cyan-100/20 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
                    Compare os planos disponiveis na sua regiao
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-secondary md:text-base">
                    Analise velocidade, latencia e beneficios para contratar com mais confianca.
                  </p>
                </div>

                <p className="text-sm text-muted">
                  {plans.length}{" "}
                  {plans.length === 1
                    ? "opcao pronta para contratacao"
                    : "opcoes prontas para contratacao"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan: PublicPlan) => (
                <PlanCard
                  key={plan.id}
                  plan={{
                    id: plan.id,
                    name: plan.name,
                    slug: plan.slug,
                    priceCents: plan.priceCents,
                    featured: plan.featured,
                    badge: plan.badge,
                    downloadMbps: plan.downloadMbps,
                    uploadMbps: plan.uploadMbps,
                    latencyTarget: plan.latencyTarget,
                    benefits: mapBenefits(plan),
                  }}
                  ctaLabel="Contratar agora"
                  telemetryPage="/planos"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
