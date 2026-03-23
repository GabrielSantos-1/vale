import Link from "next/link";
import { Container } from "@/components/ui/core/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/core/card";
import { Button } from "@/components/ui/core/button";

export const metadata = {
  title: "Suporte | Verde Vale",
};

export default function SuportePage() {
  return (
    <Container as="main" className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Atendimento
          </p>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-bold text-primary md:text-4xl">
              Canais de suporte e atendimento
            </h1>

            <p className="text-base leading-7 text-secondary">
              Veja os canais disponíveis para atendimento comercial e suporte
              técnico, além de orientações antes de abrir contato.
            </p>
          </div>
        </header>

        <section className="grid items-stretch gap-6 md:grid-cols-2">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Atendimento comercial</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-6">
              <div className="space-y-4">
                <p className="text-sm leading-6 text-secondary">
                  Para contratação, mudança de plano e informações comerciais.
                </p>

                <div className="space-y-2 text-sm text-secondary">
                  <p>Horário: segunda a sexta, das 8h às 18h</p>
                  <p>Canal principal: formulário de contato</p>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/contato">Falar com o comercial</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Suporte técnico</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-6">
              <div className="space-y-4">
                <p className="text-sm leading-6 text-secondary">
                  Para instabilidade, lentidão, ausência de conexão e suporte
                  geral.
                </p>

                <div className="space-y-2 text-sm text-secondary">
                  <p>Horário: atendimento conforme disponibilidade operacional</p>
                  <p>
                    Antes de abrir chamado, consulte a página de status da rede.
                  </p>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/status">Ver status da rede</Link>
                </Button>

                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <Link href="/contato">Abrir contato</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Antes de solicitar suporte</CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>
                    Verifique se há aviso publicado na página de status da rede.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>Reinicie modem e roteador antes de abrir chamado.</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>Teste a conexão em outro dispositivo, se possível.</span>
                </li>

                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>
                    Tenha em mãos endereço, bairro e um contato atualizado.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </Container>
  );
}