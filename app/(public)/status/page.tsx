import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { Container } from "@/components/ui/core/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { Hero } from "@/components/marketing/hero";
import { StatusBanner } from "@/components/marketing/status-banner";
import { resolveStatusTone } from "@/components/marketing/status-tone";

async function getStatusData() {
  const incidents = await prisma.networkStatus.findMany({
    where: { isVisible: true },
    orderBy: { startedAt: "desc" },
  });

  return { incidents };
}

type StatusPageData = Awaited<ReturnType<typeof getStatusData>>;
type StatusItem = StatusPageData["incidents"][number];

function getStatusSummary(incidents: StatusItem[]) {
  const activeCount = incidents.filter((item) => !item.resolvedAt).length;
  const resolvedCount = incidents.filter((item) => item.resolvedAt).length;
  const latestUpdate = incidents[0]?.startedAt;

  return {
    activeCount,
    resolvedCount,
    latestUpdate,
  };
}

export default async function StatusPage() {
  const { incidents }: StatusPageData = await getStatusData();
  const summary = getStatusSummary(incidents);

  const bannerStatus =
    incidents.length === 0 ? "Operacional" : incidents[0]?.status ?? "Monitoramento ativo";

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <Hero
          eyebrow="Status da rede | manutenção | atualizações públicas"
          badge="Acompanhamento operacional"
          title="Acompanhe o status da rede com transparência e informação clara"
          description="Consulte incidentes, manutenções e normalizações em andamento para acompanhar o serviço com mais segurança."
          primaryCta={{ label: "Ver status da rede", href: "/status#status-lista" }}
          secondaryCta={{ label: "Acompanhar atualização", href: "/status#status-lista" }}
          note="Comunicados públicos para manter clientes informados sobre ocorrências e atualizações da rede."
          stats={[
            { label: "Ativos", value: `${summary.activeCount}` },
            { label: "Resolvidos", value: `${summary.resolvedCount}` },
            {
              label: "Última atualização",
              value: summary.latestUpdate
                ? summary.latestUpdate.toLocaleString("pt-BR")
                : "Sem registros",
            },
            { label: "Transparência", value: "Atualização pública" },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="rounded-[24px] border-border public-card">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted">Incidentes ativos</p>
                <p className="text-3xl font-semibold tracking-tight text-primary">
                  {summary.activeCount}
                </p>
                <p className="text-sm leading-6 text-secondary">
                  Ocorrências em acompanhamento com atualização operacional pública.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border public-card">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted">Ocorrências resolvidas</p>
                <p className="text-3xl font-semibold tracking-tight text-primary">
                  {summary.resolvedCount}
                </p>
                <p className="text-sm leading-6 text-secondary">
                  Ocorrências finalizadas com histórico recente de normalização.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border public-card sm:col-span-2 xl:col-span-1">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted">Última atualização</p>
                <p className="text-lg font-semibold tracking-tight text-primary md:text-xl">
                  {summary.latestUpdate
                    ? summary.latestUpdate.toLocaleString("pt-BR")
                    : "Sem registros públicos recentes"}
                </p>
                <p className="text-sm leading-6 text-secondary">
                  Esta página exibe as publicações operacionais conforme visibilidade ativa.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <StatusBanner
          status={bannerStatus}
          title="Acompanhamento público do status da rede"
          description="Atualizações operacionais ajudam você a acompanhar manutenção, incidentes e normalização com clareza."
        />

        {incidents.length === 0 ? (
          <Card className="rounded-[28px] border-border public-card">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-lg font-semibold text-primary md:text-xl">
                  Sem incidentes ou manutenções públicas no momento
                </h2>
                <p className="text-sm leading-6 text-secondary">
                  Quando houver manutenção programada, incidente ou nova atualização
                  operacional, esta área será atualizada para consulta.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href="/cobertura#consulta-cobertura">Consultar cobertura</Link>
                </Button>

                <Button asChild className="w-full sm:w-auto">
                  <Link href="/contato#formulario-contato">Falar com suporte</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <section id="status-lista" className="grid scroll-mt-24 gap-4 md:gap-5">
            {incidents.map((item: StatusItem) => {
              const tone = resolveStatusTone(item.status);

              return (
                <Card key={item.id} className="rounded-[24px] border-border public-card">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface-secondary/80 px-3 py-1 text-xs font-medium text-secondary">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${tone.dotClassName}`}
                          />
                          {tone.pillText}
                        </div>

                        <CardTitle className="break-words text-lg leading-7 text-primary md:text-xl">
                          {item.title}
                        </CardTitle>
                      </div>

                      <div
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${tone.cardClassName}`}
                      >
                        {item.status}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className={`rounded-2xl border p-4 ${tone.cardClassName}`}>
                      <p className="text-sm leading-6 text-secondary">
                        {item.description || "Sem detalhes adicionais no momento."}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">
                          Início
                        </p>
                        <p className="mt-2 text-sm font-medium text-primary md:text-base">
                          {item.startedAt
                            ? item.startedAt.toLocaleString("pt-BR")
                            : "Não informado"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-surface-secondary p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">
                          Resolução
                        </p>
                        <p className="mt-2 text-sm font-medium text-primary md:text-base">
                          {item.resolvedAt
                            ? item.resolvedAt.toLocaleString("pt-BR")
                            : "Em andamento"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </Container>
  );
}

