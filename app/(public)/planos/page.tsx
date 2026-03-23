import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Container } from "@/components/ui/core/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/core/card";
import { Badge } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";

export const metadata = {
  title: "Planos | Verde Vale",
};

export const dynamic = "force-dynamic";

function formatPrice(priceCents: number) {
  return (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function getPlansData() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [
      { featured: "desc" },
      { priceCents: "asc" },
      { createdAt: "desc" },
    ],
  });

  return { plans };
}

type PlansPageData = Awaited<ReturnType<typeof getPlansData>>;
type PublicPlan = PlansPageData["plans"][number];

export default async function PlanosPage() {
  const { plans }: PlansPageData = await getPlansData();

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Comercial
          </p>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-primary md:text-4xl">
              Planos de internet para casa e empresa
            </h1>
            <p className="mt-3 text-base leading-7 text-secondary">
              Escolha o plano ideal para sua necessidade com velocidade,
              estabilidade e informações claras para contratação.
            </p>
          </div>
        </header>

        {plans.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-secondary">
                Nenhum plano disponível no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan: PublicPlan) => {
              const rawBenefits = Array.isArray(plan.benefitsJson)
                ? (plan.benefitsJson as unknown[])
                : [];

              const benefits: string[] = rawBenefits.filter(
                (item: unknown): item is string => typeof item === "string"
              );

              return (
                <Card
                  key={plan.id}
                  className={
                    plan.featured
                      ? "flex h-full flex-col border-[rgba(0,255,65,0.22)] shadow-[0_16px_40px_rgba(0,255,65,0.08)]"
                      : "flex h-full flex-col"
                  }
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-xl text-primary">{plan.name}</CardTitle>
                        <CardDescription className="mt-1">{plan.slug}</CardDescription>
                      </div>

                      {plan.featured && <Badge variant="default">Mais popular</Badge>}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-6">
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-4 md:p-5">
                        <p className="text-sm font-medium text-slate-500">Preço mensal</p>

                        <div className="mt-3 flex items-end gap-2">
                          <p className="text-3xl font-bold leading-none text-primary md:text-4xl">
                            {formatPrice(plan.priceCents)}
                          </p>
                          <span className="text-sm font-medium text-slate-400">/mês</span>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Download
                            </p>
                            <p className="mt-2 text-sm font-semibold text-primary md:text-base">
                              {plan.downloadMbps} Mbps
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Upload
                            </p>
                            <p className="mt-2 text-sm font-semibold text-primary md:text-base">
                              {plan.uploadMbps} Mbps
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Latência
                            </p>
                            <p className="mt-2 text-sm font-semibold text-primary md:text-base">
                              {plan.latencyTarget} ms
                            </p>
                          </div>
                        </div>
                      </div>

                      {benefits.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-primary">
                            Benefícios incluídos
                          </p>

                          <ul className="space-y-2 text-sm leading-6 text-secondary">
                            {benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-2">
                      <Button
                        asChild
                        className="w-full"
                        variant={plan.featured ? "default" : "secondary"}
                      >
                        <Link href={`/contratar?plano=${plan.slug}`}>Contratar</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}