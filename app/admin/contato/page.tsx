"use client"

import { useEffect, useMemo, useState } from "react"

type ContactStatus = "NOVA" | "LIDA" | "RESPONDIDA" | "ARQUIVADA"

type ContactMessage = {
  id: string
  name: string
  email: string
  phone?: string | null
  subject?: string | null
  message: string
  status: ContactStatus
  readAt?: string | null
  archivedAt?: string | null
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

type Pagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
  pagination?: Pagination
}

const STATUS_OPTIONS: Array<{ value: "ALL" | ContactStatus; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "NOVA", label: "Novas" },
  { value: "LIDA", label: "Lidas" },
  { value: "RESPONDIDA", label: "Respondidas" },
  { value: "ARQUIVADA", label: "Arquivadas" },
]

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date))
  } catch {
    return date
  }
}

function getStatusClasses(status: ContactStatus) {
  switch (status) {
    case "NOVA":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700"
    case "LIDA":
      return "border border-blue-200 bg-blue-50 text-blue-700"
    case "RESPONDIDA":
      return "border border-violet-200 bg-violet-50 text-violet-700"
    case "ARQUIVADA":
      return "border border-slate-200 bg-slate-100 text-slate-700"
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700"
  }
}

function getStatusLabel(status: ContactStatus) {
  switch (status) {
    case "NOVA":
      return "Nova"
    case "LIDA":
      return "Lida"
    case "RESPONDIDA":
      return "Respondida"
    case "ARQUIVADA":
      return "Arquivada"
    default:
      return status
  }
}

export default function AdminContatoPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"ALL" | ContactStatus>("ALL")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  const stats = useMemo(() => {
    const base = {
      total: messages.length,
      novas: 0,
      lidas: 0,
      respondidas: 0,
      arquivadas: 0,
    }

    for (const item of messages) {
      if (item.status === "NOVA") base.novas++
      if (item.status === "LIDA") base.lidas++
      if (item.status === "RESPONDIDA") base.respondidas++
      if (item.status === "ARQUIVADA") base.arquivadas++
    }

    return base
  }, [messages])

  async function fetchMessages(
    currentPage = page,
    currentStatus = status,
    currentSearch = search
  ) {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set("page", String(currentPage))
      params.set("limit", "10")

      if (currentStatus !== "ALL") {
        params.set("status", currentStatus)
      }

      if (currentSearch.trim()) {
        params.set("search", currentSearch.trim())
      }

      const response = await fetch(`/api/admin/contact?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar mensagens")
      }

      const result: ApiResponse<ContactMessage[]> = await response.json()

      setMessages(result.data ?? [])
      setPagination(
        result.pagination ?? {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      )
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar as mensagens de contato.")
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  async function openDetails(id: string) {
    if (!id) {
      alert("ID da mensagem inválido.")
      return
    }

    try {
      setActionLoading(true)

      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar detalhes")
      }

      const result: ApiResponse<ContactMessage> = await response.json()
      setSelectedMessage(result.data ?? null)
    } catch (err) {
      console.error(err)
      alert("Erro ao carregar os detalhes da mensagem.")
    } finally {
      setActionLoading(false)
    }
  }

  async function updateStatus(id: string, newStatus: ContactStatus) {
    if (!id) {
      alert("ID da mensagem inválido.")
      return
    }

    try {
      setActionLoading(true)

      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar status")
      }

      const result: ApiResponse<ContactMessage> = await response.json()
      const updatedMessage = result.data

      setMessages((prev) =>
        prev.map((item) => (item.id === id ? updatedMessage : item))
      )

      setSelectedMessage((prev) => (prev?.id === id ? updatedMessage : prev))
    } catch (err) {
      console.error(err)
      alert("Erro ao atualizar o status da mensagem.")
    } finally {
      setActionLoading(false)
    }
  }

  async function softDelete(id: string) {
    if (!id) {
      alert("ID da mensagem inválido.")
      return
    }

    const confirmed = window.confirm("Deseja realmente excluir esta mensagem?")
    if (!confirmed) return

    try {
      setActionLoading(true)

      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir mensagem")
      }

      setMessages((prev) => prev.filter((item) => item.id !== id))
      setSelectedMessage((prev) => (prev?.id === id ? null : prev))

      const nextTotal = Math.max(0, pagination.total - 1)
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pagination.limit))

      setPagination((prev) => ({
        ...prev,
        total: nextTotal,
        totalPages: nextTotalPages,
      }))
    } catch (err) {
      console.error(err)
      alert("Erro ao excluir a mensagem.")
    } finally {
      setActionLoading(false)
    }
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function clearFilters() {
    setSearchInput("")
    setSearch("")
    setStatus("ALL")
    setPage(1)
  }

  useEffect(() => {
    fetchMessages(page, status, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[var(--primary)] via-blue-700 to-[var(--accent)] px-6 py-8 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                Admin / Contato
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Mensagens de contato
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-50/90">
                Gerencie mensagens enviadas pelo site, acompanhe o status do atendimento
                e mantenha o fluxo separado dos leads comerciais.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchMessages(1, status, search)}
              disabled={loading || actionLoading}
              className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"            >
              Atualizar lista
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Mensagens na página</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.total}</p>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Novas</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">{stats.novas}</p>
        </div>

        <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <p className="text-sm text-violet-700">Respondidas</p>
          <p className="mt-2 text-3xl font-semibold text-violet-700">
            {stats.respondidas}
          </p>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-blue-700">Total geral</p>
          <p className="mt-2 text-3xl font-semibold text-blue-700">{pagination.total}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 lg:flex-row">
            <div className="w-full lg:max-w-md">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Buscar
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nome, e-mail ou mensagem..."
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="w-full lg:max-w-xs">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setPage(1)
                  setStatus(e.target.value as "ALL" | ContactStatus)
                }}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-0 lg:pt-7">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"              >

                Filtrar
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Caixa de entrada</h2>
          <p className="mt-1 text-sm text-slate-500">
            Mensagens enviadas pelo formulário público do site.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto max-w-md">
              <h3 className="text-lg font-semibold text-slate-900">
                Nenhuma mensagem encontrada
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Ajuste os filtros ou aguarde novas mensagens do formulário de contato.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Nome
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Contato
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Assunto
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Data
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {messages.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-200 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 align-top">
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="mt-1 line-clamp-2 max-w-xs text-sm text-slate-500">
                            {item.message}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-800">{item.email}</p>
                          <p className="text-slate-500">{item.phone || "Sem telefone"}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <p className="text-sm text-slate-700">
                          {item.subject || "Sem assunto"}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top text-sm text-slate-500">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(item.id)}
                            disabled={actionLoading}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                          >
                            Ver
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, "LIDA")}
                            disabled={actionLoading}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                          >
                            Lida
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, "RESPONDIDA")}
                            disabled={actionLoading}
                            className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
                          >
                            Respondida
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, "ARQUIVADA")}
                            disabled={actionLoading}
                            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                          >
                            Arquivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-700">
                    {item.subject || "Sem assunto"}
                  </p>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">{item.message}</p>

                  <p className="mt-3 text-xs text-slate-400">{formatDate(item.createdAt)}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openDetails(item.id)}
                      disabled={actionLoading}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Ver
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "LIDA")}
                      disabled={actionLoading}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                    >
                      Lida
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "RESPONDIDA")}
                      disabled={actionLoading}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
                    >
                      Respondida
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "ARQUIVADA")}
                      disabled={actionLoading}
                      className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                      Arquivar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Página <span className="font-medium text-slate-900">{pagination.page}</span> de{" "}
                <span className="font-medium text-slate-900">{pagination.totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1 || loading}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))
                  }
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-4 backdrop-blur-sm md:items-center">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">
                  Detalhes da mensagem
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {selectedMessage.subject || "Mensagem sem assunto"}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Recebida em {formatDate(selectedMessage.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Mensagem
                  </h4>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Remetente
                  </h4>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-slate-500">Nome</p>
                      <p className="mt-1 text-slate-900">{selectedMessage.name}</p>
                    </div>

                    <div>
                      <p className="text-slate-500">E-mail</p>
                      <p className="mt-1 break-all text-slate-900">{selectedMessage.email}</p>
                    </div>

                    <div>
                      <p className="text-slate-500">Telefone</p>
                      <p className="mt-1 text-slate-900">
                        {selectedMessage.phone || "Não informado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Status</p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            selectedMessage.status
                          )}`}
                        >
                          {getStatusLabel(selectedMessage.status)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-500">Atualizada em</p>
                      <p className="mt-1 text-slate-900">
                        {formatDate(selectedMessage.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Ações rápidas
                  </h4>

                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedMessage.id, "LIDA")}
                      disabled={actionLoading || !selectedMessage.id}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                    >
                      Marcar como lida
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(selectedMessage.id, "RESPONDIDA")}
                      disabled={actionLoading || !selectedMessage.id}
                      className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
                    >
                      Marcar como respondida
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(selectedMessage.id, "ARQUIVADA")}
                      disabled={actionLoading || !selectedMessage.id}
                      className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                      Arquivar mensagem
                    </button>

                    <button
                      type="button"
                      onClick={() => softDelete(selectedMessage.id)}
                      disabled={actionLoading || !selectedMessage.id}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      Excluir mensagem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}