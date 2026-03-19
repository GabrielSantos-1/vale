'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  plano: string
}

type LeadForm = {
  name: string
  phone: string
  city: string
  message: string
  planSlug: string
}

const initialForm: LeadForm = {
  name: '',
  phone: '',
  city: '',
  message: '',
  planSlug: '',
}

export default function ContratarClient({ plano }: Props) {
  const [form, setForm] = useState<LeadForm>(initialForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (plano) {
      setForm((prev) => ({ ...prev, planSlug: plano }))
    }
  }, [plano])

  const isSubmitDisabled = useMemo(() => {
    return loading || !form.name.trim() || !form.phone.trim()
  }, [form, loading])

  function updateField<K extends keyof LeadForm>(field: K, value: LeadForm[K]) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim() || undefined,
        message: form.message.trim() || undefined,
        planSlug: form.planSlug.trim() || undefined,
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (Array.isArray(data.error)) {
          throw new Error(data.error[0]?.message || 'Dados inválidos.')
        }

        throw new Error(data.error || 'Não foi possível enviar sua solicitação.')
      }

      setSuccess('Solicitação enviada com sucesso. Nossa equipe entrará em contato em breve.')
      setForm({
        ...initialForm,
        planSlug: plano || '',
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao enviar sua solicitação.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8 max-w-3xl">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-accent">
          Contratação
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Solicite sua internet
        </h1>

        <p className="mt-3 text-sm leading-6 text-secondary md:text-base">
          Envie seus dados para análise comercial e contato da equipe. O formulário
          foi pensado para reduzir atrito e acelerar a conversão.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {plano && (
            <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Plano selecionado: <strong>{plano}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-primary">
                  Nome *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-primary">
                  Telefone *
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-primary">
                Cidade
              </label>
              <input
                id="city"
                type="text"
                placeholder="Sua cidade"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-primary">
                Observações
              </label>
              <textarea
                id="message"
                placeholder="Ex.: melhor horário para contato, bairro, referência ou dúvida."
                value={form.message}
                onChange={(e) => updateField('message', e.target.value)}
                className="min-h-[160px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Enviando solicitação...' : 'Enviar solicitação'}
              </button>

              <Link
                href="/planos"
                className="text-sm text-secondary transition hover:text-primary"
              >
                Voltar para planos
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-primary">Como funciona</h2>
            <div className="mt-4 space-y-3 text-sm text-secondary">
              <p>1. Você envia sua solicitação.</p>
              <p>2. A equipe avalia disponibilidade comercial e técnica.</p>
              <p>3. O retorno é feito com os próximos passos de instalação.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-primary">Antes de contratar</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/cobertura"
                className="rounded-xl border border-border px-4 py-3 text-sm text-primary transition hover:bg-white/5"
              >
                Consultar cobertura
              </Link>
              <Link
                href="/contato"
                className="rounded-xl border border-border px-4 py-3 text-sm text-primary transition hover:bg-white/5"
              >
                Falar com atendimento
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}