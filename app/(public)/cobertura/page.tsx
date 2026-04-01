import { prisma } from "@/lib/db/prisma";
import { Hero } from "@/components/marketing/hero";
import CoberturaClient from "./cobertura-client";

export const metadata = {
  title: "Cobertura | Verde Vale Connect",
};

export const dynamic = "force-dynamic";

export default async function CoberturaPage() {
  const areas = await prisma.coverageArea.findMany({
    where: { isAvailable: true },
    orderBy: [{ city: "asc" }, { district: "asc" }],
  });

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
            { label: "Áreas", value: `${areas.length}` },
            { label: "Cidades", value: "Com cobertura publicada" },
            { label: "Regiões", value: "Em acompanhamento" },
            { label: "Consulta", value: "Rápida e objetiva" },
          ]}
        />
      </div>
      <CoberturaClient areas={areas} />
    </>
  );
}



