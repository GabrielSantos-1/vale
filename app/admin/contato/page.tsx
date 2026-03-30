"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/core/button";
import { StatCard } from "@/components/ui/core/stat-card";
import { Card, CardContent } from "@/components/ui/core/card";
import { Input } from "@/components/ui/forms/input";
import { AdminHero } from "@/components/admin/layout/admin-hero";

type ContactStatus = "NOVA" | "LIDA" | "RESPONDIDA" | "ARQUIVADA";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: ContactStatus;
  readAt?: string | null;
  archivedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
  pagination?: Pagination;
};

const STATUS_OPTIONS: Array<{ value: "ALL" | ContactStatus; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "NOVA", label: "Novas" },
  { value: "LIDA", label: "Lidas" },
  { value: "RESPONDIDA", label: "Respondidas" },
  { value: "ARQUIVADA", label: "Arquivadas" },
];

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getStatusClasses(status: ContactStatus) {
  switch (status) {
    case "NOVA":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "LIDA":
      return "border border-blue-200 bg-blue-50 text-blue-700";
    case "RESPONDIDA":
      return "border border-violet-200 bg-violet-50 text-violet-700";
    case "ARQUIVADA":
      return "border border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getStatusLabel(status: ContactStatus) {
  switch (status) {
    case "NOVA":
      return "Nova";
    case "LIDA":
      return "Lida";
    case "RESPONDIDA":
      return "Respondida";
    case "ARQUIVADA":
      return "Arquivada";
    default:
      return status;
  }
}

function logClientError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

export default function AdminContatoPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | ContactStatus>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const stats = useMemo(() => {
    const base = {
      total: messages.length,
      novas: 0,
      lidas: 0,
      respondidas: 0,
      arquivadas: 0,
    };

    for (const item of messages) {
      if (item.status === "NOVA") base.novas++;
      if (item.status === "LIDA") base.lidas++;
      if (item.status === "RESPONDIDA") base.respondidas++;
      if (item.status === "ARQUIVADA") base.arquivadas++;
    }

    return base;
  }, [messages]);

  async function fetchMessages(
    currentPage = page,
    currentStatus = status,
    currentSearch = search
  ) {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", "10");

      if (currentStatus !== "ALL") {
        params.set("status", currentStatus);
      }

      if (currentSearch.trim()) {
        params.set("search", currentSearch.trim());
      }

      const response = await fetch(`/api/admin/contact?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar mensagens");
      }

      const result: ApiResponse<ContactMessage[]> = await response.json();

      setMessages(result.data ? result.data : []);
      setPagination(
        result.pagination
          ? {
              total: result.pagination.total,
              page: result.pagination.page,
              limit: result.pagination.limit,
              totalPages: result.pagination.totalPages,
            }
          : {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 1,
            }
      );
    } catch (err) {
      logClientError(err);
      setError("Não foi possível carregar as mensagens de contato.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(id: string) {
    if (!id) {
      alert("ID da mensagem inválido.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar detalhes");
      }

      const result: ApiResponse<ContactMessage> = await response.json();
      setSelectedMessage(result.data ? result.data : null);
    } catch (err) {
      logClientError(err);
      alert("Erro ao carregar os detalhes da mensagem.");
    } finally {
      setActionLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: ContactStatus) {
    if (!id) {
      alert("ID da mensagem inválido.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar status");
      }

      const result: ApiResponse<ContactMessage> = await response.json();
      const updatedMessage = result.data;

      setMessages((prev) =>
        prev.map((item) => (item.id === id ? updatedMessage : item))
      );

      setSelectedMessage((prev) => (prev?.id === id ? updatedMessage : prev));
    } catch (err) {
      logClientError(err);
      alert("Erro ao atualizar o status da mensagem.");
    } finally {
      setActionLoading(false);
    }
  }

  async function softDelete(id: string) {
    if (!id) {
      alert("ID da mensagem inválido.");
      return;
    }

    const confirmed = window.confirm("Deseja realmente excluir esta mensagem?");
    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir mensagem");
      }

      setMessages((prev) => prev.filter((item) => item.id !== id));
      setSelectedMessage((prev) => (prev?.id === id ? null : prev));

      const nextTotal = Math.max(0, pagination.total - 1);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pagination.limit));

      setPagination((prev) => ({
        ...prev,
        total: nextTotal,
        totalPages: nextTotalPages,
      }));
    } catch (err) {
      logClientError(err);
      alert("Erro ao excluir a mensagem.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("ALL");
    setPage(1);
  }

  useEffect(() => {
    void fetchMessages(page, status, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search]);

  return (
    <div className="space-y-6">
            <AdminHero
        badge="Admin - Contato"
        title="Mensagens de contato"
        description="Gerencie mensagens enviadas pelo site, acompanhe o status do atendimento e mantenha o fluxo separado dos leads comerciais."
        actions={
          <Button
            type="button"
            variant="outline"
            className="border-white/25 bg-white/10 text-white hover:bg-white/20"
            onClick={() => void fetchMessages(1, status, search)}
            disabled={loading || actionLoading}
          >
            Atualizar lista
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Mensagens na página"
          value={stats.total}
          description="Resultados retornados para os filtros atuais."
          tone="default"
        />
        <StatCard
          label="Novas"
          value={stats.novas}
          description="Mensagens aguardando primeira leitura."
          tone="success"
        />
        <StatCard
          label="Respondidas"
          value={stats.respondidas}
          description="Mensagens já tratadas pelo atendimento."
          tone="info"
        />
        <StatCard
          label="Total geral"
          value={pagination.total}
          description="Volume total armazenado no módulo."
          tone="warning"
        />
      </section>

      <Card className="rounded-[28px] border-white/10 bg-surface shadow-soft">
        <CardContent className="p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">
                  Buscar
                </label>
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nome, e-mail ou mensagem..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value as "ALL" | ContactStatus);
                  }}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none transition focus:border-[color:var(--ring)] focus:ring-2 focus:ring-[color:var(--ring)]/20"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Filtrar</Button>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[28px] border-white/10 bg-surface shadow-soft">
        <CardContent className="p-0">
          <div className="border-b border-border/80 px-5 py-4">
            <h2 className="text-lg font-semibold text-primary">Caixa de entrada</h2>
            <p className="mt-1 text-sm text-secondary">
              Mensagens enviadas pelo formulário público do site.
            </p>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/5"
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
                <h3 className="text-lg font-semibold text-primary">
                  Nenhuma mensagem encontrada
                </h3>
                <p className="mt-2 text-sm text-secondary">
                  Ajuste os filtros ou aguarde novas mensagens do formulário de contato.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead className="bg-white/5">
                    <tr className="text-left">
                      <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                        Nome
                      </th>
                      <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                        Contato
                      </th>
                      <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                        Assunto
                      </th>
                      <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                        Status
                      </th>
                      <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                        Data
                      </th>
                      <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {messages.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-border/80 transition hover:bg-white/5"
                      >
                        <td className="px-5 py-4 align-top">
                          <div>
                            <p className="font-medium text-primary">{item.name}</p>
                            <p className="mt-1 line-clamp-2 max-w-xs text-sm text-secondary">
                              {item.message}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="space-y-1 text-sm">
                            <p className="text-primary">{item.email}</p>
                            <p className="text-secondary">{item.phone || "Sem telefone"}</p>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <p className="text-sm text-primary">
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

                        <td className="px-5 py-4 align-top text-sm text-secondary">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openDetails(item.id)}
                              disabled={actionLoading}
                            >
                              Ver
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(item.id, "LIDA")}
                              disabled={actionLoading}
                            >
                              Lida
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(item.id, "RESPONDIDA")}
                              disabled={actionLoading}
                            >
                              Respondida
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => updateStatus(item.id, "ARQUIVADA")}
                              disabled={actionLoading}
                            >
                              Arquivar
                            </Button>
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
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-primary">{item.name}</h3>
                        <p className="mt-1 text-sm text-secondary">{item.email}</p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-primary">
                      {item.subject || "Sem assunto"}
                    </p>

                    <p className="mt-2 line-clamp-3 text-sm text-secondary">{item.message}</p>

                    <p className="mt-3 text-xs text-secondary">{formatDate(item.createdAt)}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openDetails(item.id)}
                        disabled={actionLoading}
                      >
                        Ver
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, "LIDA")}
                        disabled={actionLoading}
                      >
                        Lida
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, "RESPONDIDA")}
                        disabled={actionLoading}
                      >
                        Respondida
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus(item.id, "ARQUIVADA")}
                        disabled={actionLoading}
                      >
                        Arquivar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-secondary">
                  Página <span className="font-medium text-primary">{pagination.page}</span> de{" "}
                  <span className="font-medium text-primary">{pagination.totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={pagination.page <= 1 || loading}
                  >
                    Anterior
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))
                    }
                    disabled={pagination.page >= pagination.totalPages || loading}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedMessage ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm md:items-center">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-surface shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border/80 px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
                  Detalhes da mensagem
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-primary">
                  {selectedMessage.subject || "Mensagem sem assunto"}
                </h3>
                <p className="mt-2 text-sm text-secondary">
                  Recebida em {formatDate(selectedMessage.createdAt)}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedMessage(null)}
              >
                Fechar
              </Button>
            </div>

            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">
                    Mensagem
                  </h4>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-primary">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">
                    Remetente
                  </h4>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-secondary">Nome</p>
                      <p className="mt-1 text-primary">{selectedMessage.name}</p>
                    </div>

                    <div>
                      <p className="text-secondary">E-mail</p>
                      <p className="mt-1 break-all text-primary">{selectedMessage.email}</p>
                    </div>

                    <div>
                      <p className="text-secondary">Telefone</p>
                      <p className="mt-1 text-primary">
                        {selectedMessage.phone || "Não informado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-secondary">Status</p>
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
                      <p className="text-secondary">Atualizada em</p>
                      <p className="mt-1 text-primary">
                        {formatDate(selectedMessage.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">
                    Ações rápidas
                  </h4>

                  <div className="mt-4 grid gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateStatus(selectedMessage.id, "LIDA")}
                      disabled={actionLoading || !selectedMessage.id}
                    >
                      Marcar como lida
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateStatus(selectedMessage.id, "RESPONDIDA")}
                      disabled={actionLoading || !selectedMessage.id}
                    >
                      Marcar como respondida
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => updateStatus(selectedMessage.id, "ARQUIVADA")}
                      disabled={actionLoading || !selectedMessage.id}
                    >
                      Arquivar mensagem
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => softDelete(selectedMessage.id)}
                      disabled={actionLoading || !selectedMessage.id}
                    >
                      Excluir mensagem
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

