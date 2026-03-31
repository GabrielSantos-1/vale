import type { Metadata } from 'next';
import { Suspense } from 'react';

import AdminRecoveryForm from '@/components/ui/forms/admin-recovery-form';

export const metadata: Metadata = {
  title: 'Recuperar acesso administrativo',
};

function RecoveryFormFallback() {
  return (
    <div className="rounded-2xl border border-border bg-surface-secondary p-4 text-sm text-secondary">
      Carregando recuperação de acesso...
    </div>
  );
}

export default function AdminRecoveryPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <section className="w-full rounded-[28px] border border-border bg-surface p-6 shadow-soft">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-primary">
              Recuperar acesso administrativo
            </h1>
            <p className="mt-2 text-sm text-secondary">
              Solicite a recuperação ou redefina a senha com um token válido.
            </p>
          </div>

          <Suspense fallback={<RecoveryFormFallback />}>
            <AdminRecoveryForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}