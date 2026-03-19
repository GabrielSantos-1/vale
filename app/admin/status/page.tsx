'use client'

import { useEffect, useMemo, useState } from 'react'

type NetworkStatusItem = {
  id: string
  title: string
  slug: string
  status: string
  description?: string | null
  startedAt?: string | null
  resolvedAt?: string | null
  isVisible: boolean
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

type StatusFormState = {
  title: string
  slug: string
  status: string
  description: string
  startedAt: string
  resolvedAt: string
  isVisible: boolean
}

const initialForm: StatusFormState = {
  title: '',
  slug: '',
  status: 'monitorando',
  description: '',
  startedAt: '',
  resolvedAt: '',
  isVisible: true,
}

function toDatetimeLocalValue(value?: string | null) {
  if (!value) return ''

  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR')
}

function normalizeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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

export default function StatusAdminPage() {
  const [items, setItems] = useState<NetworkStatusItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<StatusFormState>(initialForm)

  const isEditing = editingId !== null

  async function loadStatusItems() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/status', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      const result: ApiResponse<NetworkStatusItem[]> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          normalizeApiError(result.error, 'Falha ao carregar status da rede')
        )
      }

      setItems(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar status da rede'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStatusItems()
  }, [])

  function updateField<K extends keyof StatusFormState>(
    field: K,
    value: StatusFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function resetFormState() {
    setForm(initialForm)
    setEditingId(null)
  }

  function handleEdit(item: NetworkStatusItem) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      slug: item.slug,
      status: item.status,
      description: item.description || '',
      startedAt: toDatetimeLocalValue(item.startedAt),
      resolvedAt: toDatetimeLocalValue(item.resolvedAt),
      isVisible: item.isVisible,
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
      const normalizedSlug = normalizeSlug(form.slug || form.title)

      const payload = {
        title: form.title.trim(),
        slug: normalizedSlug,
        status: form.status.trim(),
        description: form.description.trim() || undefined,
        startedAt: form.startedAt
          ? new Date(form.startedAt).toISOString()
          : undefined,
        resolvedAt: form.resolvedAt
          ? new Date(form.resolvedAt).toISOString()
          : undefined,
        isVisible: Boolean(form.isVisible),
      }

      if (!payload.title) {
        throw new Error('Título é obrigatório.')
      }

      if (!payload.slug) {
        throw new Error('Slug é obrigatório.')
      }

      if (!payload.status) {
        throw new Error('Status é obrigatório.')
      }

      if (
        payload.startedAt &&
        payload.resolvedAt &&
        new Date(payload.resolvedAt).getTime() < new Date(payload.startedAt).getTime()
      ) {
        throw new Error('A data de resolução não pode ser anterior à data de início.')
      }

      const url = isEditing
        ? `/api/admin/status/${editingId}`
        : '/api/admin/status'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const result: ApiResponse<NetworkStatusItem> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, 'Falha ao salvar status'))
      }

      setSuccess(
        isEditing
          ? 'Status atualizado com sucesso.'
          : 'Status cadastrado com sucesso.'
      )

      resetFormState()
      await loadStatusItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar status')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: NetworkStatusItem) {
    const confirmed = window.confirm(
      `Deseja excluir o status "${item.title}"? Esta ação não pode ser desfeita.`
    )

    if (!confirmed) return
    if (deletingId) return

    try {
      setDeletingId(item.id)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/admin/status/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const result: ApiResponse<null> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, 'Falha ao excluir status'))
      }

      if (editingId === item.id) {
        resetFormState()
      }

      setSuccess('Status excluído com sucesso.')
      await loadStatusItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir status')
    } finally {
      setDeletingId(null)
    }
  }

  const totalItems = useMemo(() => items.length, [items])
  const totalVisible = useMemo(
    () => items.filter((item) => item.isVisible).length,
    [items]
  )

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gestão de Status da Rede</h1>
          <p className="mt-2 text-sm text-white/70">
            Cadastre incidentes, manutenções e avisos para exibição no site.
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/70">Total de registros</p>
            <p className="mt-3 text-3xl font-bold">{totalItems}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/70">Visíveis no site</p>
            <p className="mt-3 text-3xl font-bold">{totalVisible}</p>
          </article>
        </section>

        <div className="grid gap-8 xl:grid-cols-[440px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar status' : 'Novo status'}
            </h2>

            <p className="mt-2 text-sm text-white/70">
              {isEditing
                ? 'Atualize os dados do registro selecionado.'
                : 'Registre um aviso, incidente ou manutenção programada.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="title" className="mb-1 block text-sm text-white/80">
                  Título
                </label>
                <input
                  id="title"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value
                    updateField('title', title)

                    if (!isEditing && (!form.slug || normalizeSlug(form.slug) === normalizeSlug(form.title))) {
                      updateField('slug', normalizeSlug(title))
                    }
                  }}
                  placeholder="Ex.: Instabilidade em Peruíbe"
                  maxLength={180}
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-1 block text-sm text-white/80">
                  Slug
                </label>
                <input
                  id="slug"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.slug}
                  onChange={(e) => updateField('slug', normalizeSlug(e.target.value))}
                  placeholder="instabilidade-peruibe"
                  maxLength={180}
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="mb-1 block text-sm text-white/80">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                >
                  <option value="monitorando">Monitorando</option>
                  <option value="degradado">Serviço degradado</option>
                  <option value="indisponivel">Indisponível</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="mb-1 block text-sm text-white/80">
                  Descrição
                </label>
                <textarea
                  id="description"
                  className="min-h-[130px] w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Ex.: Clientes podem notar lentidão e instabilidade temporária."
                  maxLength={3000}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="startedAt" className="mb-1 block text-sm text-white/80">
                    Início
                  </label>
                  <input
                    id="startedAt"
                    type="datetime-local"
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                    value={form.startedAt}
                    onChange={(e) => updateField('startedAt', e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="resolvedAt" className="mb-1 block text-sm text-white/80">
                    Resolução
                  </label>
                  <input
                    id="resolvedAt"
                    type="datetime-local"
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                    value={form.resolvedAt}
                    onChange={(e) => updateField('resolvedAt', e.target.value)}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => updateField('isVisible', e.target.checked)}
                />
                Exibir no site
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
                    : 'Cadastrar status'}
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
              <h2 className="text-xl font-semibold">Status cadastrados</h2>
              <button
                type="button"
                onClick={() => void loadStatusItems()}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm"
              >
                Atualizar
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-white/70">Carregando status...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-white/70">
                Nenhum status cadastrado ainda.
              </p>
            ) : (
              <div className="grid gap-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-white/60">Slug: {item.slug}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.isVisible
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {item.isVisible ? 'Visível' : 'Oculto'}
                        </span>

                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {item.description ? (
                      <div className="mt-4">
                        <p className="text-sm text-white/80 whitespace-pre-line">
                          {item.description}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-white/50">Início</p>
                        <p className="text-sm text-white/80">
                          {formatDateTime(item.startedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/50">Resolução</p>
                        <p className="text-sm text-white/80">
                          {formatDateTime(item.resolvedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        disabled={submitting || deletingId === item.id}
                        className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 disabled:opacity-60"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={submitting || deletingId === item.id}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 disabled:opacity-60"
                      >
                        {deletingId === item.id ? 'Excluindo...' : 'Excluir'}
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