import ContratarClient from "./contratar-client";
import { prisma } from "@/lib/db/prisma";
import { Hero } from "@/components/marketing/hero";
import { PremiumImageGrid } from "@/components/marketing/premium-image-grid";
import { PUBLIC_VISUALS } from "@/components/marketing/public-visuals";

export const metadata = {
  title: "Contratar | Verde Vale Connect",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    plano?: string;
  }>;
};

export default async function ContratarPage({ searchParams }: Props) {
  const params = await searchParams;

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: [{ featured: "desc" }, { priceCents: "asc" }],
  });

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-6 md:px-6 md:pb-8 md:pt-8">
        <Hero
          eyebrow="Contratação • formulário guiado • conversão"
          badge="Solicitação comercial"
          title="Solicite sua internet com uma interface mais premium e objetiva"
          description="Envie seus dados para análise comercial e retorno da equipe. O formulário foi pensado para reduzir atrito e acelerar a conversão."
          primaryCta={{ label: "Ver planos", href: "/planos#comparacao-planos" }}
          secondaryCta={{ label: "Consultar cobertura", href: "/cobertura#consulta-cobertura" }}
          note="Jornada de contratação com mais clareza e menos ruído visual."
          stats={[
            { label: "Jornada", value: "Mais clara" },
            { label: "Retorno", value: "Mais rápido" },
            { label: "Cobertura", value: "Sem atrito" },
            { label: "Produto", value: "Fibra premium" },
          ]}
        />

        <div className="mt-8">
          <PremiumImageGrid
            eyebrow="Conversão premium"
            title="Imagens que deixam a contratação mais clara"
            description="Um bloco visual leve sustenta decisão comercial sem disputar atenção com o formulário."
            items={[
              {
                eyebrow: "Atendimento",
                title: "Canal comercial",
                description:
                  "Ambiente premium para reforçar rapidez, acolhimento e clareza na contratação.",
                imageSrc: PUBLIC_VISUALS.contactPremium,
                imageAlt: "Ambiente executivo com atendimento comercial e fibra",
                href: "/contato#formulario-contato",
                ctaLabel: "Falar com atendimento",
              },
              {
                eyebrow: "Suporte",
                title: "Equipe pronta",
                description:
                  "A equipe de suporte complementa a jornada com triagem e retorno organizado.",
                imageSrc: PUBLIC_VISUALS.supportTeam,
                imageAlt: "Equipe de suporte em ambiente premium com laptops",
                href: "/suporte#status-lista",
                ctaLabel: "Ver suporte",
              },
            ]}
          />
        </div>
      </div>
      <ContratarClient plano={params.plano || ""} plans={plans} />
    </>
  );
}