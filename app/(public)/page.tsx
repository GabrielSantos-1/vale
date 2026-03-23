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

function formatPrice(priceCents: number) {
  return (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type HomeData = {
  plans: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    featured: boolean;
    downloadMbps: number;
    uploadMbps: number;
    latencyTarget: number;
  }[];
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
    }),
    prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 4,
    }),
    prisma.networkStatus.findMany({
      where: { isVisible: true },
      orderBy: { startedAt: "desc" },
      take: 3,
    }),
  ]);

  return { plans, faqs, visibleStatus };
}

function mapStatusVariant(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("operacional") ||
    normalized.includes("normal") ||
    normalized.includes("online")
  ) {
    return "success";
  }

  if (
    normalized.includes("manutenção") ||
    normalized.includes("manutencao") ||
    normalized.includes("atenção")
  ) {
    return "warning";
  }

  if (
    normalized.includes("incidente") ||
    normalized.includes("indisponível") ||
    normalized.includes("indisponivel") ||
    normalized.includes("offline")
  ) {
    return "danger";
  }

  return "info";
}

export default async function Home() {
  const { plans, faqs, visibleStatus } = await getHomeData();

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-12 md:space-y-16">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface-primary)] px-6 py-10 shadow-[0_16px_40px_rgba(0,0,0,0.28)] md:px-10 md:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,65,0.10),transparent_30%)]" />
          <div className="relative max-w-3xl">
            <Badge variant="default" className="mb-4">
              Fibra óptica • cobertura • status em tempo real
            </Badge>

            <h1 className="text-4xl font-bold leading-tight text-primary md:text-5xl md:leading-tight">
              Internet fibra com transparência, estabilidade e gestão moderna
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-secondary md:text-lg">
              Consulte planos, verifique cobertura, acompanhe o status da rede e
              entre em contato com rapidez em uma experiência clara e confiável.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/planos">Ver planos</Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/contato">Entrar em contato</Link>
              </Button>
            </div>
          </div>
        </section>

                {/* PLANOS */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                Planos
              </p>
              <h2 className="text-2xl font-semibold text-primary md:text-3xl">
                Planos em destaque
              </h2>
            </div>

            <Button asChild variant="ghost">
              <Link href="/planos">Ver todos os planos</Link>
            </Button>
          </div>

          <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex h-full flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.slug}</CardDescription>
                    </div>

                    {plan.featured && <Badge variant="default">Destaque</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-6">
                  <div className="space-y-3">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(plan.priceCents)}
                      <span className="ml-1 text-sm font-medium text-slate-400">
                        /mês
                      </span>
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm text-secondary">
                      <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Download
                        </p>
                        <p className="mt-1 font-semibold text-primary">
                          {plan.downloadMbps} Mbps
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Upload
                        </p>
                        <p className="mt-1 font-semibold text-primary">
                          {plan.uploadMbps} Mbps
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Latência alvo
                      </p>
                      <p className="mt-1 font-semibold text-primary">
                        {plan.latencyTarget} ms
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-2">
                    <Button asChild className="w-full">
                      <Link href="/planos">Contratar plano</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* STATUS */}
        <section className="space-y-6 md:space-y-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Operação
            </p>
            <h2 className="text-2xl font-semibold text-primary md:text-3xl">
              Status da rede
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {visibleStatus.map((item) => (
              <Card key={item.id} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <Badge variant={mapStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm leading-6 text-secondary">
                    {item.description || "Sem descrição adicional no momento."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Dúvidas
            </p>
            <h2 className="text-2xl font-semibold text-primary md:text-3xl">
              Perguntas frequentes
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm leading-6 text-secondary">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}