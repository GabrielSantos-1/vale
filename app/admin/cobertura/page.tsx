'use client'

import { useEffect, useMemo, useState } from 'react'

type CoverageArea = {
  id: string
  city: string
  district: string
  cepStart: string
  cepEnd: string
  isAvailable: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

type ApiErrorItem = {
  message?: string
  path?: string[]
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string | ApiErrorItem[]
}

type CoverageFormState = {
  city: string
  district: string
  cepStart: string
  cepEnd: string
  isAvailable: boolean
  notes: string
}

const initialForm: CoverageFormState = {
  city: '',
  district: '',
  cepStart: '',
  cepEnd: '',
  isAvailable: true,
  notes: '',
}

function normalizeCep(value: string) {
  return value.replace(/\D/g, '').slice(0, 8)
}

function formatCep(value: string) {
  const digits = normalizeCep(value)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function normalizeApiError(error: unknown, fallback: string) {
  if (Array.isArray(error)) {
    return error
      .map((item) => item?.message)
      .filter(Boolean)
      .join(', ') || fallback
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return fallback
}

export default function CoberturaPage() {
  const [areas, setAreas] = useState<CoverageArea[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<CoverageFormState>(initialForm)

  const isEditing = editingId !== null

  async function loadCoverage() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/coverage', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      const result: ApiResponse<CoverageArea[]> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          normalizeApiError(result.error, 'Falha ao carregar áreas de cobertura')
        )
      }

      setAreas(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar áreas de cobertura'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCoverage()
  }, [])

  function updateField<K extends keyof CoverageFormState>(
    field: K,
    value: CoverageFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function resetFormState() {
    setForm(initialForm)
    setEditingId(null)
  }

  function handleEdit(area: CoverageArea) {
    setEditingId(area.id)
    setForm({
      city: area.city,
      district: area.district,
      cepStart: area.cepStart,
      cepEnd: area.cepEnd,
      isAvailable: area.isAvailable,
      notes: area.notes || '',
    })
    setError(null)
    setSuccess(null)
  }

  function handleCancelEdit() {
    resetFormState()
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        city: form.city.trim(),
        district: form.district.trim(),
        cepStart: normalizeCep(form.cepStart),
        cepEnd: normalizeCep(form.cepEnd),
        isAvailable: Boolean(form.isAvailable),
        notes: form.notes.trim() || undefined,
      }

      if (!payload.city) {
        throw new Error('Cidade é obrigatória.')
      }

      if (!payload.district) {
        throw new Error('Bairro é obrigatório.')
      }

      if (payload.cepStart.length !== 8 || payload.cepEnd.length !== 8) {
        throw new Error('CEP inicial e CEP final devem ter 8 dígitos.')
      }

      if (Number(payload.cepStart) > Number(payload.cepEnd)) {
        throw new Error('O CEP inicial não pode ser maior que o CEP final.')
      }

      const url = isEditing
        ? `/api/admin/coverage/${editingId}`
        : '/api/admin/coverage'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const result: ApiResponse<CoverageArea> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          normalizeApiError(result.error, 'Falha ao salvar área de cobertura')
        )
      }

      setSuccess(
        isEditing
          ? 'Área de cobertura atualizada com sucesso.'
          : 'Área de cobertura cadastrada com sucesso.'
      )

      resetFormState()
      await loadCoverage()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar área de cobertura'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(area: CoverageArea) {
    const confirmed = window.confirm(
      `Deseja excluir a área "${area.city} - ${area.district}"? Esta ação não pode ser desfeita.`
    )

    if (!confirmed) return
    if (deletingId) return

    try {
      setDeletingId(area.id)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/admin/coverage/${area.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const result: ApiResponse<null> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          normalizeApiError(result.error, 'Falha ao excluir área de cobertura')
        )
      }

      if (editingId === area.id) {
        resetFormState()
      }

      setSuccess('Área de cobertura excluída com sucesso.')
      await loadCoverage()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao excluir área de cobertura'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const totalAreas = useMemo(() => areas.length, [areas])
  const totalAvailable = useMemo(
    () => areas.filter((area) => area.isAvailable).length,
    [areas]
  )

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gestão de Cobertura</h1>
          <p className="mt-2 text-sm text-white/70">
            Cadastre e visualize cidades, bairros e faixas de CEP atendidas.
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/70">Total de áreas</p>
            <p className="mt-3 text-3xl font-bold">{totalAreas}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/70">Áreas disponíveis</p>
            <p className="mt-3 text-3xl font-bold">{totalAvailable}</p>
          </article>
        </section>

        <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar área de cobertura' : 'Nova área de cobertura'}
            </h2>

            <p className="mt-2 text-sm text-white/70">
              {isEditing
                ? 'Atualize os dados da área selecionada.'
                : 'Preencha os dados da região atendida.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="city" className="mb-1 block text-sm text-white/80">
                  Cidade
                </label>
                <input
                  id="city"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Ex.: Peruíbe"
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label htmlFor="district" className="mb-1 block text-sm text-white/80">
                  Bairro
                </label>
                <input
                  id="district"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  placeholder="Ex.: Centro"
                  maxLength={120}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cepStart" className="mb-1 block text-sm text-white/80">
                    CEP inicial
                  </label>
                  <input
                    id="cepStart"
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                    value={formatCep(form.cepStart)}
                    onChange={(e) =>
                      updateField('cepStart', normalizeCep(e.target.value))
                    }
                    placeholder="11750-000"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cepEnd" className="mb-1 block text-sm text-white/80">
                    CEP final
                  </label>
                  <input
                    id="cepEnd"
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                    value={formatCep(form.cepEnd)}
                    onChange={(e) =>
                      updateField('cepEnd', normalizeCep(e.target.value))
                    }
                    placeholder="11759-999"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="mb-1 block text-sm text-white/80">
                  Observações
                </label>
                <textarea
                  id="notes"
                  className="min-h-[110px] w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Ex.: Atendimento disponível apenas em algumas ruas."
                  maxLength={2000}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => updateField('isAvailable', e.target.checked)}
                />
                Marcar como disponível
              </label>

              {error ? (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {error}
                </div>
              ) : null}

              {success ? (
                <div
                  role="status"
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                >
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-black transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting
                  ? 'Salvando...'
                  : isEditing
                    ? 'Salvar alterações'
                    : 'Cadastrar área'}
              </button>

              {isEditing ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-60"
                >
                  Cancelar edição
                </button>
              ) : null}
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Áreas cadastradas</h2>
              <button
                type="button"
                onClick={() => void loadCoverage()}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm"
              >
                Atualizar
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-white/70">Carregando áreas...</p>
            ) : areas.length === 0 ? (
              <p className="text-sm text-white/70">
                Nenhuma área cadastrada ainda.
              </p>
            ) : (
              <div className="grid gap-4">
                {areas.map((area) => (
                  <article
                    key={area.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {area.city} — {area.district}
                        </h3>
                        <p className="text-sm text-white/60">
                          CEP: {formatCep(area.cepStart)} até {formatCep(area.cepEnd)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          area.isAvailable
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {area.isAvailable ? 'Disponível' : 'Indisponível'}
                      </span>
                    </div>

                    {area.notes ? (
                      <div className="mt-4">
                        <p className="mb-1 text-xs text-white/50">Observações</p>
                        <p className="text-sm text-white/80 whitespace-pre-line">
                          {area.notes}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(area)}
                        disabled={submitting || deletingId === area.id}
                        className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 disabled:opacity-60"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(area)}
                        disabled={submitting || deletingId === area.id}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 disabled:opacity-60"
                      >
                        {deletingId === area.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}