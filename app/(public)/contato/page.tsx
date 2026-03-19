'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

type ContactForm = typeof initialForm

export default function ContatoPage() {
  const [form, setForm] = useState<ContactForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isSubmitDisabled = useMemo(() => {
    return (
      submitting ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.message.trim()
    )
  }, [form, submitting])

  function updateField<K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        if (Array.isArray(result.error)) {
          throw new Error(result.error[0]?.message || 'Dados inválidos.')
        }

        throw new Error(result.error || 'Falha ao enviar contato.')
      }

      setSuccess('Mensagem enviada com sucesso. Nossa equipe poderá retornar em breve.')
      setForm(initialForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar contato.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-8 max-w-3xl">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-accent">
          Atendimento e contato
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Fale com a Verde Vale
        </h1>

        <p className="mt-3 text-sm leading-6 text-secondary md:text-base">
          Envie sua solicitação para atendimento comercial, dúvidas gerais ou suporte.
          Preencha os dados corretamente para facilitar o retorno.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary">Formulário de contato</h2>
            <p className="mt-2 text-sm text-secondary">
              Os campos marcados como obrigatórios precisam ser preenchidos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-primary">
                  Nome *
                </label>
                <input
                  id="name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-primary">
                  E-mail *
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                  placeholder="voce@exemplo.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-primary">
                  Telefone
                </label>
                <input
                  id="phone"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-primary">
                  Assunto
                </label>
                <input
                  id="subject"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                  placeholder="Ex.: Contratação, suporte, dúvidas"
                  value={form.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-primary">
                Mensagem *
              </label>
              <textarea
                id="message"
                className="min-h-[180px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                placeholder="Descreva sua solicitação com o máximo de clareza."
                value={form.message}
                onChange={(e) => updateField('message', e.target.value)}
                required
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
                {submitting ? 'Enviando mensagem...' : 'Enviar contato'}
              </button>

              <p className="text-xs text-secondary">
                Ao enviar, seus dados serão usados apenas para retorno sobre a solicitação.
              </p>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-primary">Atendimento</h2>
            <div className="mt-4 space-y-3 text-sm text-secondary">
              <p>Use dados válidos para facilitar o retorno da equipe.</p>
              <p>Solicitações comerciais e operacionais podem ter fluxos diferentes.</p>
              <p>Para contratação imediata, o ideal é usar a página específica de contratação.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-primary">Acessos rápidos</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/planos"
                className="rounded-xl border border-border px-4 py-3 text-sm text-primary transition hover:bg-white/5"
              >
                Ver planos disponíveis
              </Link>

              <Link
                href="/contratar"
                className="rounded-xl border border-border px-4 py-3 text-sm text-primary transition hover:bg-white/5"
              >
                Solicitar contratação
              </Link>

              <Link
                href="/cobertura"
                className="rounded-xl border border-border px-4 py-3 text-sm text-primary transition hover:bg-white/5"
              >
                Consultar cobertura
              </Link>

              <Link
                href="/status"
                className="rounded-xl border border-border px-4 py-3 text-sm text-primary transition hover:bg-white/5"
              >
                Ver status da rede
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}