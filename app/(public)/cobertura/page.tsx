import { prisma } from "@/lib/db/prisma";
import { Hero } from "@/components/marketing/hero";
import { logger } from "@/lib/security/logger";
import { sanitizeOptionalString } from "@/lib/security/sanitize";
import CoberturaClient from "./cobertura-client";

export const metadata = {
  title: "Cobertura | Verde Vale Connect",
};

export const dynamic = "force-dynamic";

export default async function CoberturaPage() {
  const correlationId = crypto.randomUUID();
  let areas: Awaited<ReturnType<typeof prisma.coverageArea.findMany>> = [];
  let coverageListUnavailable = false;

  try {
    const dbAreas = await prisma.coverageArea.findMany({
      where: { isAvailable: true },
      orderBy: [{ city: "asc" }, { district: "asc" }],
    });

    areas = dbAreas.map((area) => ({
      ...area,
      notes: sanitizeOptionalString(area.notes, {
        maxLength: 500,
        collapseWhitespace: true,
        removeAngleBrackets: true,
        removeControlChars: true,
      }),
    }));
  } catch (error) {
    coverageListUnavailable = true;

    logger.error("Failed to load public coverage areas", {
      correlationId,
      route: "/cobertura",
      error,
    });
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8">
        <Hero
          eyebrow="Internet fibra | cobertura regional | consulta de disponibilidade"
          badge="Consulta de cobertura"
          title="Consulte cobertura de internet fibra na sua região com rapidez e clareza"
          description="Pesquise por CEP, cidade ou bairro para verificar disponibilidade antes de contratar internet para casa ou empresa."
          primaryCta={{ label: "Quero contratar", href: "/contratar#formulario-solicitacao" }}
          secondaryCta={{ label: "Falar com atendimento", href: "/contato#formulario-contato" }}
          note="Processo simples para consultar disponibilidade e seguir com atendimento comercial quando houver cobertura."
          stats={[
            {
              label: "Áreas publicadas",
              value: `${areas.length}`,
              description: "Base atualizada para consulta pública de cobertura.",
            },
            {
              label: "Status operacional",
              value: coverageListUnavailable ? "Lista em atualizacao" : "Com cobertura publicada",
              description: "Consulta disponível com retorno rápido para decisão.",
            },
            {
              label: "Fluxo comercial",
              value: "Da consulta à contratação",
              description: "Continuidade entre disponibilidade, suporte e venda.",
            },
          ]}
        />
      </div>
      <CoberturaClient areas={areas} />
    </>
  );
}
