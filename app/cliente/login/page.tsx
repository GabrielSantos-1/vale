import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { whatsappSupportUrl } from "@/lib/constants/contact";

export const metadata = {
  title: "Central do Cliente | Em preparação",
};

export default function ClientLoginPlaceholderPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-primary md:px-6 md:py-14">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Central do Cliente
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Área em preparação
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-secondary md:text-base">
            A Central do Cliente está sendo preparada com separação de segurança dedicada, sem
            reaproveitar o acesso administrativo.
          </p>
        </header>

        <Card className="rounded-[28px] border-border">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
              Acesso seguro em evolução
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-secondary">
              Enquanto finalizamos a estrutura de autenticação do cliente, use nossos canais
              oficiais para suporte, segunda via e atendimento comercial.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/contato#formulario-contato">Falar com atendimento</Link>
              </Button>

              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={whatsappSupportUrl} target="_blank" rel="noopener noreferrer">
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    WhatsApp oficial
                  </span>
                </a>
              </Button>
            </div>

            <p className="text-xs leading-5 text-muted">
              Esta página é informativa e não utiliza login administrativo, sessão de admin ou
              endpoints internos protegidos.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
