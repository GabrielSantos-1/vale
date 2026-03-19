'use client'

import { useMemo, useState } from 'react'

type CoverageArea = {
  id: string
  city: string
  district: string
  cepStart: string
  cepEnd: string
  notes: string | null
  isAvailable: boolean
}

type Props = {
  areas: CoverageArea[]
}

type CoverageForm = {
  cep: string
  city: string
  district: string
}

const initialForm: CoverageForm = {
  cep: '',
  city: '',
  district: '',
}

type CoverageResponse =
  | {
      success: true
      data: {
        available: boolean
        notes: string | null
      }
    }
  | {
      success: false
      error: string | { message?: string }[]
    }

export default function CoberturaClient({ areas }: Props) {
  const [form, setForm] = useState<CoverageForm>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    available: boolean
    notes: string | null
  } | null>(null)

  const isSubmitDisabled = useMemo(() => {
    return (
      loading ||
      (!form.cep.trim() && !form.city.trim() && !form.district.trim())
    )
  }, [form, loading])

  function updateField<K extends keyof CoverageForm>(
    field: K,
    value: CoverageForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/coverage-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: form.cep.trim() || undefined,
          city: form.city.trim() || undefined,
          district: form.district.trim() || undefined,
        }),
      })

      const data: CoverageResponse = await response.json()

      if (!response.ok || !data.success) {
        if (Array.isArray((data as { error?: unknown }).error)) {
          const first = (data as { error: { message?: string }[] }).error[0]
          throw new Error(first?.message || 'Dados inválidos.')
        }

        throw new Error(
          (data as { error?: string }).error || 'Não foi possível consultar a cobertura.'
        )
      }

      setResult(data.data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao consultar cobertura.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-8 max-w-3xl">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-accent">
          Cobertura
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Consulte disponibilidade na sua região
        </h1>

        <p className="mt-3 text-sm leading-6 text-secondary md:text-base">
          Pesquise por CEP, cidade ou bairro e veja se já existe cobertura disponível.
          Abaixo, você também encontra a listagem atual de áreas atendidas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-primary">Consulta rápida</h2>
          <p className="mt-2 text-sm text-secondary">
            Informe pelo menos um dos campos para buscar disponibilidade.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="cep" className="mb-1.5 block text-sm font-medium text-primary">
                CEP
              </label>
              <input
                id="cep"
                value={form.cep}
                onChange={(e) => updateField('cep', e.target.value)}
                placeholder="00000-000"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-primary">
                  Cidade
                </label>
                <input
                  id="city"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Sua cidade"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label htmlFor="district" className="mb-1.5 block text-sm font-medium text-primary">
                  Bairro
                </label>
                <input
                  id="district"
                  value={form.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  placeholder="Seu bairro"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {result && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  result.available
                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                    : 'border border-yellow-500/20 bg-yellow-500/10 text-yellow-200'
                }`}
              >
                <p className="font-semibold">
                  {result.available
                    ? 'Cobertura disponível para a região informada.'
                    : 'Ainda não encontramos cobertura disponível para a região informada.'}
                </p>

                {result.notes && <p className="mt-2">{result.notes}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Consultando...' : 'Consultar cobertura'}
            </button>
          </form>
        </section>

        <aside className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">Resumo</h2>
          <div className="mt-4 space-y-3 text-sm text-secondary">
            <p>Total de áreas disponíveis: {areas.length}</p>
            <p>
              A consulta rápida usa os dados cadastrados no sistema e pode variar conforme
              atualização operacional.
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-primary">Áreas atendidas</h2>
          <p className="mt-2 text-sm text-secondary">
            Lista pública das regiões atualmente marcadas como disponíveis.
          </p>
        </div>

        {areas.length === 0 ? (
          <div className="rounded-xl border border-border bg-background px-4 py-4 text-sm text-secondary">
            Ainda não há áreas cadastradas.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {areas.map((area) => (
              <article
                key={area.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <h3 className="text-base font-semibold text-primary">
                  {area.city} — {area.district}
                </h3>

                <p className="mt-2 text-sm text-secondary">
                  CEP: {area.cepStart} até {area.cepEnd}
                </p>

                {area.notes && (
                  <p className="mt-3 text-sm leading-6 text-secondary">{area.notes}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}