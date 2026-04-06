import Link from "next/link";
import { UserPlus } from "lucide-react";

import ClientRegisterForm from "@/components/ui/forms/client-register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";

export const metadata = {
  title: "Criar Conta | Central do Cliente - Verde Vale Connect",
};

export default function ClientRegisterPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-primary md:px-6 md:py-14">
      <div className="mx-auto w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <UserPlus className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Criar Conta
          </h1>
          <p className="text-sm text-secondary">
            Crie sua conta para acessar a Central do Cliente.
          </p>
        </header>

        <Card className="rounded-[var(--radius-lg)] border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Dados da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientRegisterForm />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-secondary">
          Já tem conta?{" "}
          <Link
            href="/cliente/login"
            className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-accent"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
