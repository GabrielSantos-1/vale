import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";

import ClientLoginForm from "@/components/ui/forms/client-login-form";
import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { whatsappSupportUrl } from "@/lib/constants/contact";

export const metadata = {
  title: "Central do Cliente | Verde Vale Connect",
};

type ClientLoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    registro?: string;
  }>;
};

export default async function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : null;
  const showRegisterSuccess = params.registro === "ok";

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-primary md:px-6 md:py-14">
      <div className="mx-auto w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <ShieldCheck
            className="mx-auto h-10 w-10 text-accent"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Central do Cliente
          </h1>
          <p className="text-sm text-secondary">
            Acesse sua conta para gerenciar sua conexão.
          </p>
        </header>

        <Card className="rounded-[var(--radius-lg)] border-border">
          <CardHeader className="pb-4">
          <CardTitle className="text-lg">Entrar</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientLoginForm
              callbackUrl={callbackUrl}
              showRegisterSuccess={showRegisterSuccess}
            />
          </CardContent>
        </Card>

        <div className="space-y-3 text-center">
          <p className="text-xs text-muted">
            Ou use nossos canais oficiais para atendimento:
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/contato#formulario-contato">Falar com atendimento</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={whatsappSupportUrl} target="_blank" rel="noopener noreferrer">
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
