'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

import { Input } from '../ui/input'
import { Button } from '../ui/button'

type LoginFormProps = {
  callbackUrl?: string
}

export function LoginForm({ callbackUrl = '/admin/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setLoading(false)

    if (!result) {
      setError('Falha ao processar login.')
      return
    }

    if (result.error) {
      setError('Credenciais inválidas.')
      return
    }

    window.location.href = result.url || callbackUrl
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-white/80">
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@empresa.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-white/80">
          Senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Sua senha"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}