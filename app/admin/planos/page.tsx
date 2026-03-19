'use client'

import { useEffect, useMemo, useState } from 'react'

type Plan = {
  id: string
  name: string
  slug: string
  downloadMbps: number
  uploadMbps: number
  latencyTarget: number
  priceCents: number
  featured: boolean
  benefitsJson: unknown
  badge?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type ApiListResponse = {
  success: boolean
  data?: Plan[]
  error?: string
}

const initialForm = {
  name: '',
  slug: '',
  downloadMbps: 0,
  uploadMbps: 0,
  latencyTarget: 0,
  priceCents: 0,
  featured: false,
  badge: '',
  benefitsText: '',
}

function formatPrice(priceCents: number) {
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const [form, setForm] = useState(initialForm)

  async function loadPlans() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/plans', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      const result: ApiListResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Falha ao carregar planos')
      }

      setPlans(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const totalPlans = useMemo(() => plans.length, [plans])
  const totalFeatured = useMemo(
    () => plans.filter((plan) => plan.featured).length,
    [plans]
  )

  function updateField<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  /*
  ─────────────────────────────
  Preencher formulário ao editar
  ─────────────────────────────
  */

  useEffect(() => {
    if (!editingPlan) return

    setForm({
      name: editingPlan.name,
      slug: editingPlan.slug,
      downloadMbps: editingPlan.downloadMbps,
      uploadMbps: editingPlan.uploadMbps,
      latencyTarget: editingPlan.latencyTarget,
      priceCents: editingPlan.priceCents,
      featured: editingPlan.featured,
      badge: editingPlan.badge || '',
      benefitsText: Array.isArray(editingPlan.benefitsJson)
        ? editingPlan.benefitsJson.join('\n')
        : '',
    })
  }, [editingPlan])

  /*
  ─────────────────────────────
  Submit create/update
  ─────────────────────────────
  */

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const benefitsJson = form.benefitsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        downloadMbps: Number(form.downloadMbps),
        uploadMbps: Number(form.uploadMbps),
        latencyTarget: Number(form.latencyTarget),
        priceCents: Number(form.priceCents),
        featured: form.featured,
        badge: form.badge.trim() || undefined,
        benefitsJson,
      }

      const response = await fetch(
        editingPlan
          ? `/api/admin/plans/${editingPlan.id}`
          : '/api/admin/plans',
        {
          method: editingPlan ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao salvar plano')
      }

      setSuccess(
        editingPlan
          ? 'Plano atualizado com sucesso.'
          : 'Plano criado com sucesso.'
      )

      setForm(initialForm)
      setEditingPlan(null)

      await loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar plano')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(planId: string, planName: string) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o plano "${planName}"?`
    )

    if (!confirmed) return

    try {
      setDeletingId(planId)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Falha ao excluir plano')
      }

      setSuccess('Plano removido com sucesso.')
      await loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir plano')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl">

        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gestão de Planos</h1>
        </header>

        <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">

          {/* FORM */}

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">

            {editingPlan && (
              <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
                Editando plano: <strong>{editingPlan.name}</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Nome"
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
              />

              <input
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="Slug"
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
              />

              <textarea
                value={form.benefitsText}
                onChange={(e) => updateField('benefitsText', e.target.value)}
                placeholder="Benefícios"
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
              />

              <input
                type="number"
                placeholder="Preço (em centavos) ex: 9990 = R$ 99,90"
                value={form.priceCents}
                onChange={(e) => updateField('priceCents', Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-medium text-black"
              >
                {submitting
                  ? 'Salvando...'
                  : editingPlan
                  ? 'Atualizar plano'
                  : 'Criar plano'}
              </button>

              {editingPlan && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null)
                    setForm(initialForm)
                  }}
                  className="w-full rounded-lg border border-white/20 px-4 py-2"
                >
                  Cancelar edição
                </button>
              )}
            </form>
          </section>

          {/* LISTA */}

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">

            {plans.map((plan) => (
              <article key={plan.id} className="mb-4 border p-4 rounded-xl">

                <h3 className="font-bold">{plan.name}</h3>

                <p>{formatPrice(plan.priceCents)}</p>

                <div className="flex gap-2 mt-2">

                  <button
                    onClick={() => {
                      setEditingPlan(plan)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-blue-400"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(plan.id, plan.name)}
                    className="text-red-400"
                  >
                    Excluir
                  </button>

                </div>

              </article>
            ))}

          </section>

        </div>
      </div>
    </main>
  )
}