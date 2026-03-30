import { prisma } from "@/lib/db/prisma";
import { Hero } from "@/components/marketing/hero";
import CoberturaClient from "./cobertura-client";

export const metadata = {
  title: "Cobertura | Verde Vale",
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
          eyebrow="Cobertura • disponibilidade • consulta rápida"
          badge="Rede verificável"
          title="Confirme cobertura com um hero mais sofisticado e confiável"
          description="Pesquise por CEP, cidade ou bairro para verificar disponibilidade antes de avançar para contratação."
          primaryCta={{ label: "Quero contratar", href: "/contratar#formulario-solicitacao" }}
          secondaryCta={{ label: "Falar com atendimento", href: "/contato#formulario-contato" }}
          note="Consulta pública para reduzir atrito e aumentar confiança."
          stats={[
            { label: "Áreas", value: `${areas.length}` },
            { label: "Cidades", value: "Mapeadas" },
            { label: "Regiões", value: "Publicadas" },
            { label: "Fluxo", value: "Sem atrito" },
          ]}
        />
      </div>
      <CoberturaClient areas={areas} />
    </>
  );
}
