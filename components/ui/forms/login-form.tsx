'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/core/button'
import { FormField } from '@/components/ui/forms/form-field'
import { Input } from '@/components/ui/forms/input'

type LoginFormProps = {
  callbackUrl?: string
}

type FormState = {
  email: string
  password: string
}

type FormErrors = {
  email?: string
  password?: string
}

const DEFAULT_CALLBACK_URL = '/admin/dashboard'

function sanitizeAdminCallbackUrl(value?: string): string {
  if (!value) return DEFAULT_CALLBACK_URL
  if (!value.startsWith('/')) return DEFAULT_CALLBACK_URL
  if (!value.startsWith('/admin')) return DEFAULT_CALLBACK_URL
  if (value.startsWith('/admin/login')) return DEFAULT_CALLBACK_URL
  return value
}

export default function LoginForm({
  callbackUrl = DEFAULT_CALLBACK_URL,
}: LoginFormProps) {
  const router = useRouter()

  const safeCallbackUrl = useMemo(
    () => sanitizeAdminCallbackUrl(callbackUrl),
    [callbackUrl],
  )

  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (error) {
      setError(null)
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {}

    const email = form.email.trim()
    const password = form.password

    if (!email) {
      nextErrors.email = 'E-mail é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Informe um e-mail válido.'
    } else if (email.length > 160) {
      nextErrors.email = 'E-mail inválido.'
    }

    if (!password.trim()) {
      nextErrors.password = 'Senha é obrigatória.'
    } else if (password.length > 255) {
      nextErrors.password = 'Senha inválida.'
    }

    return nextErrors
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setError(null)

    const nextErrors = validateForm()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        callbackUrl: safeCallbackUrl,
        redirect: false,
      })

      if (!result) {
        throw new Error('Não foi possível iniciar a autenticação.')
      }

      if (result.error) {
        throw new Error('Credenciais inválidas.')
      }

      const nextUrl =
        result.url && result.url.startsWith('/admin') && !result.url.startsWith('/admin/login')
          ? result.url
          : safeCallbackUrl

      router.push(nextUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error ? (
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      ) : null}

      <FormField
        id="email"
        label="E-mail"
        required
        error={errors.email}
        hint="Use o e-mail administrativo cadastrado."
      >
        <Input
          type="email"
          placeholder="admin@exemplo.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={160}
          disabled={loading}
        />
      </FormField>

      <FormField
        id="password"
        label="Senha"
        required
        error={errors.password}
      >
        <Input
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          autoComplete="current-password"
          maxLength={255}
          disabled={loading}
        />
      </FormField>

      <div className="flex justify-end">
        <Link
          href="/recuperar-admin"
          className="text-sm text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
