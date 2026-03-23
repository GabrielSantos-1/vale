import { prisma } from "@/lib/db/prisma";
import { Container } from "@/components/ui/core/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/core/card";
import { Badge } from "@/components/ui/core/badge";

async function getStatusData() {
  const incidents = await prisma.networkStatus.findMany({
    where: {
      isVisible: true,
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  return { incidents };
}

type StatusPageData = Awaited<ReturnType<typeof getStatusData>>;
type StatusItem = StatusPageData["incidents"][number];

function mapStatusVariant(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("operacional") ||
    normalized.includes("normal") ||
    normalized.includes("online")
  ) {
    return "success" as const;
  }

  if (
    normalized.includes("manutenção") ||
    normalized.includes("manutencao") ||
    normalized.includes("atenção")
  ) {
    return "warning" as const;
  }

  if (
    normalized.includes("incidente") ||
    normalized.includes("indisponível") ||
    normalized.includes("indisponivel") ||
    normalized.includes("offline")
  ) {
    return "danger" as const;
  }

  return "info" as const;
}

export default async function StatusPage() {
  const { incidents }: StatusPageData = await getStatusData();

  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Operação
          </p>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-primary md:text-4xl">
              Status da rede
            </h1>
            <p className="mt-3 text-base leading-7 text-secondary">
              Acompanhe incidentes, manutenções e avisos operacionais publicados
              pela equipe.
            </p>
          </div>
        </header>

        {incidents.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-secondary">
                Nenhum incidente ou manutenção no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {incidents.map((item: StatusItem) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge variant={mapStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-secondary">
                    {item.description || "Sem descrição adicional no momento."}
                  </p>

                  <div className="grid gap-3 text-sm text-secondary md:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Início
                      </p>
                      <p className="mt-1 text-primary">
                        {item.startedAt
                          ? item.startedAt.toLocaleString("pt-BR")
                          : "Não informado"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-secondary p-3">
                      <p className="text-xs uppercase tracking-wide text-muted">
                        Resolução
                      </p>
                      <p className="mt-1 text-primary">
                        {item.resolvedAt
                          ? item.resolvedAt.toLocaleString("pt-BR")
                          : "Em andamento"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}