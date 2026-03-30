import Link from "next/link";

import { Container } from "@/components/ui/core/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";
import { StatusBanner } from "@/components/marketing/status-banner";
import { Hero } from "@/components/marketing/hero";

export const metadata = {
  title: "Suporte | Verde Vale",
};

export default function SuportePage() {
  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <Hero
          eyebrow="Atendimento • suporte técnico • orientação comercial"
          badge="Suporte premium"
          title="Canais de suporte com leitura mais rápida e acabamento superior"
          description="Veja os canais disponíveis para atendimento comercial e suporte técnico, além de orientações simples antes de abrir contato."
          primaryCta={{ label: "Falar com o comercial", href: "/contato#formulario-contato" }}
          secondaryCta={{ label: "Ver status da rede", href: "/status#status-lista" }}
          note="Fluxo mais claro para triagem, operação e atendimento."
          stats={[
            { label: "Fluxo", value: "Mais claro" },
            { label: "Triagem", value: "Mais rápida" },
            { label: "Operação", value: "Mais visível" },
            { label: "Retorno", value: "Mais objetivo" },
          ]}
        />

        <StatusBanner
          status="Suporte"
          title="Atendimento mais claro para comercial e operação"
          description="Organize o contato com a equipe certa e reduza atrito antes de abrir atendimento."
        />

        <section className="grid items-stretch gap-6 md:grid-cols-2">
          <Card className="flex h-full flex-col rounded-[28px] border-border public-card">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl">Atendimento comercial</CardTitle>
              <p className="text-sm leading-6 text-secondary">
                Para contratação, mudança de plano, disponibilidade e dúvidas comerciais.
              </p>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4">
                  <p className="text-sm font-medium text-primary">
                    Quando usar este canal
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    Escolha este fluxo quando sua solicitação estiver ligada a
                    contratação, proposta comercial, alteração de plano ou dúvidas
                    antes de fechar o serviço.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-secondary">
                  <p>Horário: segunda a sexta, das 8h às 18h</p>
                  <p>Canal principal: formulário de contato</p>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/contato#formulario-contato">Falar com o comercial</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col rounded-[28px] border-border public-card">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl">Suporte técnico</CardTitle>
              <p className="text-sm leading-6 text-secondary">
                Para instabilidade, lentidão, ausência de conexão e suporte geral.
              </p>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4">
                  <p className="text-sm font-medium text-primary">
                    Antes de abrir contato
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    Verifique a página pública de status, reinicie modem e roteador
                    e tenha seus dados básicos em mãos para agilizar a triagem.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-secondary">
                  <p>Atendimento conforme disponibilidade operacional</p>
                  <p>Priorize a página de status antes de abrir novo contato</p>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/status#status-lista">Ver status da rede</Link>
                </Button>

                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href="/contato#formulario-contato">Abrir contato</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Container>
  );
}
