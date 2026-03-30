import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { Container } from "@/components/ui/core/container";
import { Card, CardContent } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { Hero } from "@/components/marketing/hero";
import { PlanCard } from "@/components/marketing/plan-card";

export const metadata = {
  title: "Planos | Verde Vale",
};

export const dynamic = "force-dynamic";

async function getPlansData() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [
      { featured: "desc" },
      { priceCents: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      featured: true,
      downloadMbps: true,
      uploadMbps: true,
      latencyTarget: true,
      benefitsJson: true,
    },
  });

  return { plans };
}

type PlansPageData = Awaited<ReturnType<typeof getPlansData>>;
type PublicPlan = PlansPageData["plans"][number];

function mapBenefits(plan: PublicPlan): string[] {
  const rawBenefits = Array.isArray(plan.benefitsJson)
    ? (plan.benefitsJson as unknown[])
    : [];

  return rawBenefits.filter(
    (item: unknown): item is string => typeof item === "string"
  );
}

export default async function PlanosPage() {
  const { plans }: PlansPageData = await getPlansData();

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <Hero
          eyebrow="Comercial • planos premium • contratação clara"
          badge="Planos em destaque"
          title="Planos de internet com linguagem mais premium e decisão mais rápida"
          description="Escolha a melhor opção para sua rotina com velocidade, estabilidade e uma jornada de contratação mais clara."
          primaryCta={{ label: "Quero contratar", href: "/contratar#formulario-solicitacao" }}
          secondaryCta={{ label: "Consultar cobertura", href: "/cobertura#consulta-cobertura" }}
          note="Velocidade, latência e contratação em uma vitrine mais sofisticada."
          stats={[
            { label: "Instalação", value: "Até 24h" },
            { label: "Atendimento", value: "Suporte rápido" },
            { label: "Cobertura", value: "Consulta simples" },
            { label: "Produto", value: "Fibra premium" },
          ]}
        />

        {plans.length === 0 ? (
          <Card className="rounded-[28px] border-border public-card">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-lg font-semibold text-primary md:text-xl">
                  Nenhum plano público disponível no momento
                </h2>
                <p className="text-sm leading-6 text-secondary">
                  Estamos atualizando a vitrine comercial para exibir velocidade,
                  benefícios e contratação de forma mais clara.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href="/cobertura#consulta-cobertura">Consultar cobertura</Link>
                </Button>

                <Button asChild className="w-full sm:w-auto">
                  <Link href="/contato#formulario-contato">Falar com atendimento</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <section id="comparacao-planos" className="space-y-6 scroll-mt-24 md:scroll-mt-28">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
                  Compare os planos disponíveis
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-secondary md:text-base">
                  Veja velocidade, latência, benefícios e escolha a opção mais adequada
                  antes de avançar para contratação.
                </p>
              </div>

              <p className="text-sm text-muted">
                {plans.length} {plans.length === 1 ? "plano disponível" : "planos disponíveis"}
              </p>
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
                    downloadMbps: plan.downloadMbps,
                    uploadMbps: plan.uploadMbps,
                    latencyTarget: plan.latencyTarget,
                    benefits: mapBenefits(plan),
                  }}
                  ctaLabel="Contratar"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
