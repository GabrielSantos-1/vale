import type { Metadata } from 'next'
import LoginForm from '@/components/ui/forms/login-form'

export const metadata: Metadata = {
  title: 'Login - Admin',
}

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const callbackUrl = params?.callbackUrl || '/admin/dashboard'

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <section className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="mt-2 text-sm text-white/70">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <LoginForm callbackUrl={callbackUrl} />
        </section>
      </div>
    </main>
  )
}