import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LoginForm from '@/components/ui/forms/login-form'
import { authOptions } from '@/lib/auth/auth-options'
import { isAdminRole } from '@/lib/auth/roles'

export const metadata: Metadata = {
  title: 'Login | Verde Vale Connect Admin',
}

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string
  }>
}

const DEFAULT_CALLBACK_URL = '/admin/dashboard'

function sanitizeAdminCallbackUrl(value?: string): string {
  if (!value) return DEFAULT_CALLBACK_URL
  if (!value.startsWith('/')) return DEFAULT_CALLBACK_URL
  if (!value.startsWith('/admin')) return DEFAULT_CALLBACK_URL
  if (value.startsWith('/admin/login')) return DEFAULT_CALLBACK_URL
  return value
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions)

  if (session?.user && isAdminRole((session.user as { role?: string }).role)) {
    redirect(DEFAULT_CALLBACK_URL)
  }

  const params = await searchParams
  const callbackUrl = sanitizeAdminCallbackUrl(params?.callbackUrl)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <section className="w-full rounded-[28px] border border-border bg-surface p-6 shadow-soft">
          <div className="mb-6">
            <div className="relative mb-4 h-14 w-44 overflow-hidden md:h-16 md:w-48">
              <Image
                src="/brand/logo-verde-vale-connect.svg"
                alt="Logo Verde Vale Connect"
                fill
                sizes="(max-width: 768px) 176px, 192px"
                className="object-contain object-left"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold text-primary">
              Painel Administrativo Verde Vale Connect
            </h1>
            <p className="mt-2 text-sm text-secondary">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <LoginForm callbackUrl={callbackUrl} />
        </section>
      </div>
    </main>
  )
}


