import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";

import { ClientProfileView } from "@/components/client/profile/client-profile-view";
import { getClientSession } from "@/lib/auth/client-session";

export const metadata = {
  title: "Meu Perfil | Central do Cliente - Verde Vale Connect",
};

export default async function ClientProfilePage() {
  const cookieStore = await cookies();
  const session = await getClientSession({
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
  });

  if (!session?.id) {
    redirect("/cliente/login?callbackUrl=/cliente/perfil");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-primary md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs text-secondary">
            <UserCog className="h-4 w-4 text-accent" aria-hidden="true" />
            Central do Cliente
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Perfil e seguranca da conta
          </h1>
          <p className="text-sm text-secondary">
            Atualize seus dados cadastrais e gerencie sua senha com seguranca.
          </p>
        </header>

        <ClientProfileView />
      </div>
    </main>
  );
}

