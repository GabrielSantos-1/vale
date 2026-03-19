'use client'

import { useEffect, useMemo, useState } from 'react'

type FAQItem = {
  id: string
  question: string
  answer: string
  category?: string | null
  order: number
  isPublished: boolean
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

type FaqFormState = {
  question: string
  answer: string
  category: string
  order: number
  isPublished: boolean
}

const initialForm: FaqFormState = {
  question: '',
  answer: '',
  category: '',
  order: 0,
  isPublished: true,
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

export default function FaqAdminPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<FaqFormState>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const isEditing = editingId !== null

  async function loadFaqs() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/faq', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      const result: ApiResponse<FAQItem[]> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, 'Falha ao carregar FAQs'))
      }

      setFaqs(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar FAQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFaqs()
  }, [])

  function updateField<K extends keyof FaqFormState>(
    field: K,
    value: FaqFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function resetFormState() {
    setForm(initialForm)
    setEditingId(null)
  }

  function handleEdit(item: FAQItem) {
    setEditingId(item.id)
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category || '',
      order: item.order,
      isPublished: item.isPublished,
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
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || undefined,
        order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
        isPublished: Boolean(form.isPublished),
      }

      if (!payload.question) {
        throw new Error('Pergunta é obrigatória.')
      }

      if (!payload.answer) {
        throw new Error('Resposta é obrigatória.')
      }

      if (payload.order < 0) {
        throw new Error('A ordem de exibição não pode ser negativa.')
      }

      const url = isEditing ? `/api/admin/faq/${editingId}` : '/api/admin/faq'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const result: ApiResponse<FAQItem> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, 'Falha ao salvar FAQ'))
      }

      setSuccess(isEditing ? 'FAQ atualizada com sucesso.' : 'FAQ cadastrada com sucesso.')
      resetFormState()
      await loadFaqs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar FAQ')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: FAQItem) {
    const confirmed = window.confirm(
      `Deseja excluir a FAQ "${item.question}"? Esta ação não pode ser desfeita.`
    )

    if (!confirmed) return
    if (deletingId) return

    try {
      setDeletingId(item.id)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/admin/faq/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const result: ApiResponse<null> = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, 'Falha ao excluir FAQ'))
      }

      if (editingId === item.id) {
        resetFormState()
      }

      setSuccess('FAQ excluída com sucesso.')
      await loadFaqs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir FAQ')
    } finally {
      setDeletingId(null)
    }
  }

  const totalFaqs = useMemo(() => faqs.length, [faqs])
  const totalPublished = useMemo(
    () => faqs.filter((item) => item.isPublished).length,
    [faqs]
  )

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gestão de FAQ</h1>
          <p className="mt-2 text-sm text-white/70">
            Gerencie perguntas frequentes exibidas no site público.
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/70">Total de FAQs</p>
            <p className="mt-3 text-3xl font-bold">{totalFaqs}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/70">Publicadas</p>
            <p className="mt-3 text-3xl font-bold">{totalPublished}</p>
          </article>
        </section>

        <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar FAQ' : 'Nova FAQ'}
            </h2>

            <p className="mt-2 text-sm text-white/70">
              {isEditing
                ? 'Atualize os dados da FAQ selecionada.'
                : 'Preencha pergunta e resposta para adicionar ao site.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="question" className="mb-1 block text-sm text-white/80">
                  Pergunta
                </label>
                <input
                  id="question"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.question}
                  onChange={(e) => updateField('question', e.target.value)}
                  placeholder="Ex.: Qual o prazo de instalação?"
                  maxLength={180}
                  required
                />
              </div>

              <div>
                <label htmlFor="answer" className="mb-1 block text-sm text-white/80">
                  Resposta
                </label>
                <textarea
                  id="answer"
                  className="min-h-[140px] w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.answer}
                  onChange={(e) => updateField('answer', e.target.value)}
                  placeholder="Ex.: A instalação é realizada em até 48 horas úteis."
                  maxLength={3000}
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="mb-1 block text-sm text-white/80">
                  Categoria
                </label>
                <input
                  id="category"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  placeholder="Ex.: instalação"
                  maxLength={80}
                />
              </div>

              <div>
                <label htmlFor="order" className="mb-1 block text-sm text-white/80">
                  Ordem de exibição
                </label>
                <input
                  id="order"
                  type="number"
                  min={0}
                  step={1}
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 outline-none"
                  value={form.order}
                  onChange={(e) => updateField('order', Number(e.target.value))}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => updateField('isPublished', e.target.checked)}
                />
                Publicar no site
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
                    : 'Cadastrar FAQ'}
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
              <h2 className="text-xl font-semibold">FAQs cadastradas</h2>
              <button
                type="button"
                onClick={() => void loadFaqs()}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm"
              >
                Atualizar
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-white/70">Carregando FAQs...</p>
            ) : faqs.length === 0 ? (
              <p className="text-sm text-white/70">
                Nenhuma FAQ cadastrada ainda.
              </p>
            ) : (
              <div className="grid gap-4">
                {faqs.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{item.question}</h3>
                        <p className="text-sm text-white/60">
                          Categoria: {item.category || 'geral'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.isPublished
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {item.isPublished ? 'Publicada' : 'Rascunho'}
                        </span>

                        <span className="text-xs text-white/50">
                          Ordem: {item.order}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-white/80 whitespace-pre-line">
                        {item.answer}
                      </p>
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