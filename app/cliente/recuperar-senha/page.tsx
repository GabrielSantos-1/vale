import Link from "next/link";
import { Suspense } from "react";
import { KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { LoadingState } from "@/components/ui/feedback/loading-state";
import ClientRecoveryForm from "@/components/ui/forms/client-recovery-form";

export const metadata = {
  title: "Recuperar Senha | Central do Cliente - Verde Vale Connect",
};

export default function ClientRecoveryPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-primary md:px-6 md:py-14">
      <div className="mx-auto w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <KeyRound className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Recuperar senha
          </h1>
          <p className="text-sm text-secondary">
            Solicite a recuperacao da conta ou redefina sua senha com o token recebido.
          </p>
        </header>

        <Card className="rounded-[var(--radius-lg)] border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Acesso da Central do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingState label="Carregando formulario..." size="sm" className="py-8" />}>
              <ClientRecoveryForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-secondary">
          Lembrou a senha?{" "}
          <Link
            href="/cliente/login"
            className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-accent"
          >
            Voltar para login
          </Link>
        </p>
      </div>
    </main>
  );
}
