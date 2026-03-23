'use client'

import { useState } from 'react'
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

export default function LoginForm({
  callbackUrl = '/admin/dashboard',
}: LoginFormProps) {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {}

    const email = form.email.trim()
    const password = form.password.trim()

    if (!email) {
      nextErrors.email = 'E-mail é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Informe um e-mail válido.'
    }

    if (!password) {
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
        callbackUrl,
        redirect: false,
      })

      if (!result || result.error) {
        throw new Error('Credenciais inválidas.')
      }

      router.push(result.url || callbackUrl)
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
          placeholder="admin@verdevale.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          autoComplete="email"
          maxLength={160}
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
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}