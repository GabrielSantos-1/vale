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
          eyebrow="Status da rede | manutencao | atualizacoes publicas"
          badge="Acompanhamento operacional"
          title="Acompanhe o status da rede com transparencia e leitura rapida"
          description="Consulte incidentes, manutencoes e normalizacoes em andamento com informacao clara."
          primaryCta={{ label: "Ver status da rede", href: "/status#status-lista" }}
          secondaryCta={{ label: "Acompanhar atualizacao", href: "/status#status-lista" }}
          note="Comunicados publicos para manter clientes informados sobre ocorrencias da rede."
          stats={[
            {
              label: "Incidentes ativos",
              value: `${summary.activeCount}`,
              description: "Ocorrencias em acompanhamento com atualizacao publica.",
            },
            {
              label: "Ocorrencias resolvidas",
              value: `${summary.resolvedCount}`,
              description: "Historico recente com normalizacao registrada.",
            },
            {
              label: "Ultima atualizacao publica",
              value: summary.latestUpdate
                ? summary.latestUpdate.toLocaleString("pt-BR")
                : "Sem registros",
              description: "Painel atualizado conforme visibilidade ativa.",
            },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="rounded-[24px] border-cyan-100/16 public-card">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">Incidentes ativos</p>
                <p className="text-3xl font-semibold tracking-tight text-primary">
                  {summary.activeCount}
                </p>
                <p className="text-sm leading-6 text-slate-200/90">
                  Ocorrencias em acompanhamento com atualizacao operacional publica.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-cyan-100/16 public-card">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">Ocorrencias resolvidas</p>
                <p className="text-3xl font-semibold tracking-tight text-primary">
                  {summary.resolvedCount}
                </p>
                <p className="text-sm leading-6 text-slate-200/90">
                  Ocorrencias finalizadas com historico recente de normalizacao.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-cyan-100/16 public-card sm:col-span-2 xl:col-span-1">
            <CardContent className="p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">Ultima atualizacao</p>
                <p className="text-lg font-semibold tracking-tight text-primary md:text-xl">
                  {summary.latestUpdate
                    ? summary.latestUpdate.toLocaleString("pt-BR")
                    : "Sem registros publicos recentes"}
                </p>
                <p className="text-sm leading-6 text-slate-200/90">
                  Esta pagina exibe publicacoes operacionais conforme visibilidade ativa.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <StatusBanner
          status={bannerStatus}
          title="Acompanhamento publico do status da rede"
          description="Atualizacoes operacionais ajudam voce a acompanhar manutencao, incidentes e normalizacao com clareza."
          telemetryComponent="status_page_banner"
        />

        {incidents.length === 0 ? (
          <Card className="rounded-[28px] border-cyan-100/16 public-card">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-lg font-semibold text-primary md:text-xl">
                  Sem incidentes ou manutencoes publicas no momento
                </h2>
                <p className="text-sm leading-6 text-secondary">
                  Quando houver manutencao programada, incidente ou nova atualizacao operacional,
                  esta area sera atualizada para consulta.
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
                <Card key={item.id} className="rounded-[24px] border-cyan-100/16 public-card">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-100/24 bg-slate-950/14 px-3 py-1 text-xs font-medium text-slate-100/90 backdrop-blur-sm">
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
                      <div className="rounded-2xl border border-cyan-100/20 bg-slate-950/14 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">Inicio</p>
                        <p className="mt-2 text-sm font-medium text-primary md:text-base">
                          {item.startedAt
                            ? item.startedAt.toLocaleString("pt-BR")
                            : "Nao informado"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-100/20 bg-slate-950/14 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">Resolucao</p>
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
