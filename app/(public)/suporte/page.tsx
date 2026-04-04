import Link from "next/link";

import { Container } from "@/components/ui/core/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { StatusBanner } from "@/components/marketing/status-banner";
import { Hero } from "@/components/marketing/hero";

export const metadata = {
  title: "Suporte | Verde Vale Connect",
};

export default function SuportePage() {
  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <Hero
          eyebrow="Atendimento • suporte técnico • orientação comercial"
          badge="Suporte"
          title="Canais de suporte com atendimento claro e direto"
          description="Veja os canais disponíveis para atendimento comercial e suporte técnico, além de orientações simples antes de abrir contato."
          primaryCta={{ label: "Falar com suporte", href: "/contato#formulario-contato" }}
          secondaryCta={{ label: "Ver status da rede", href: "/status#status-lista" }}
          note="Fluxo mais claro para triagem, operação e atendimento."
          stats={[
            {
              label: "Triagem inicial",
              value: "Encaminhamento claro",
              description: "Separação entre demandas comerciais e técnicas.",
            },
            {
              label: "Suporte técnico",
              value: "Fluxo objetivo",
              description: "Orientações práticas antes de abrir solicitação.",
            },
            {
              label: "Atendimento regional",
              value: "Contato próximo",
              description: "Equipe local para reduzir atrito no atendimento.",
            },
          ]}
        />

        <StatusBanner
          status="Suporte"
          title="Atendimento mais claro para comercial e operação"
          description="Organize o contato com a equipe certa e reduza atrito antes de abrir atendimento."
        />

        <section className="grid items-stretch gap-6 md:grid-cols-2">
          <Card className="flex h-full flex-col rounded-[28px] border-cyan-100/16 public-card">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl">Atendimento comercial</CardTitle>
              <p className="text-sm leading-6 text-secondary">
                Para contratação, mudança de plano, disponibilidade e dúvidas comerciais.
              </p>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-100/20 bg-slate-950/14 p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-primary">
                    Quando usar este canal
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    Escolha este fluxo quando sua solicitação estiver ligada a
                    contratação, proposta comercial, alteração de plano ou dúvidas
                    antes de fechar o serviço.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-slate-200/90">
                  <p>Horário: segunda a sexta, das 8h às 18h</p>
                  <p>Canal principal: formulário de contato</p>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/contato#formulario-contato">Pedir atendimento</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col rounded-[28px] border-cyan-100/16 public-card">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl">Suporte técnico</CardTitle>
              <p className="text-sm leading-6 text-secondary">
                Para instabilidade, lentidão, ausência de conexão e suporte geral.
              </p>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-100/20 bg-slate-950/14 p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-primary">
                    Antes de abrir contato
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    Verifique a página pública de status, reinicie modem e roteador
                    e tenha seus dados básicos em mãos para agilizar a triagem.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-slate-200/90">
                  <p>Atendimento conforme disponibilidade operacional</p>
                  <p>Priorize a página de status antes de abrir novo contato</p>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <Button asChild variant="outline" className="w-full border-cyan-100/24 bg-slate-950/14 text-slate-100 hover:bg-slate-900/24 sm:w-auto">
                  <Link href="/status#status-lista">Ver status da rede</Link>
                </Button>

                <Button asChild variant="secondary" className="w-full border-cyan-100/18 bg-slate-950/16 text-slate-100 hover:bg-slate-900/26 sm:w-auto">
                  <Link href="/contato#formulario-contato">Abrir solicitação</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Container>
  );
}
