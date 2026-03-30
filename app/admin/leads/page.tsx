"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";
import { StatCard } from "@/components/ui/core/stat-card";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-display/data-table";
import { Select } from "@/components/ui/forms/select";
import { AdminHero } from "@/components/admin/layout/admin-hero";

type LeadStatus =
  | "NOVO"
  | "EM_ATENDIMENTO"
  | "CONVERTIDO"
  | "DESCARTADO"
  | "ARQUIVADO";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
  cep?: string | null;
  message?: string | null;
  source?: string | null;
  status: LeadStatus;
  archivedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  planId?: string | null;
  plan?: {
    id: string;
    name: string;
  } | null;
};

type LeadFilterStatus = "ALL" | LeadStatus;
type LeadSortField = "createdAt" | "name" | "status";
type LeadSortOrder = "asc" | "desc";

type LeadsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type LeadsCounts = Record<LeadFilterStatus, number>;

type LeadsResponse = {
  success: boolean;
  data?: Lead[];
  meta?: {
    pagination?: LeadsPagination;
    filters?: {
      status?: LeadFilterStatus;
      q?: string;
      sort?: LeadSortField;
      order?: LeadSortOrder;
    };
    counts?: LeadsCounts;
  };
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    correlationId?: string;
  };
};

type LeadMutationResponse = {
  success: boolean;
  data?: Lead | null;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    correlationId?: string;
  };
};

const statusOptions: Array<{ value: LeadFilterStatus; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "NOVO", label: "Novo" },
  { value: "EM_ATENDIMENTO", label: "Em atendimento" },
  { value: "CONVERTIDO", label: "Convertido" },
  { value: "DESCARTADO", label: "Descartado" },
  { value: "ARQUIVADO", label: "Arquivado" },
];

const sortOptions: Array<{ value: LeadSortField; label: string }> = [
  { value: "createdAt", label: "Data de criação" },
  { value: "name", label: "Nome" },
  { value: "status", label: "Status" },
];

function getStatusBadgeVariant(status: LeadStatus) {
  switch (status) {
    case "NOVO":
      return "info";
    case "EM_ATENDIMENTO":
      return "warning";
    case "CONVERTIDO":
      return "success";
    case "DESCARTADO":
      return "danger";
    case "ARQUIVADO":
      return "neutral";
    default:
      return "neutral";
  }
}

function getStatusLabel(status: LeadStatus) {
  switch (status) {
    case "NOVO":
      return "Novo";
    case "EM_ATENDIMENTO":
      return "Em atendimento";
    case "CONVERTIDO":
      return "Convertido";
    case "DESCARTADO":
      return "Descartado";
    case "ARQUIVADO":
      return "Arquivado";
    default:
      return status;
  }
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function normalizeText(value?: string | null) {
  return value?.trim() ? value : "Não informado";
}

function getPrimaryAction(status: LeadStatus) {
  switch (status) {
    case "NOVO":
      return { label: "Iniciar atendimento", nextStatus: "EM_ATENDIMENTO" as const };
    case "EM_ATENDIMENTO":
      return { label: "Converter", nextStatus: "CONVERTIDO" as const };
    case "CONVERTIDO":
    case "DESCARTADO":
    case "ARQUIVADO":
      return null;
    default:
      return null;
  }
}

const EMPTY_COUNTS: LeadsCounts = {
  ALL: 0,
  NOVO: 0,
  EM_ATENDIMENTO: 0,
  CONVERTIDO: 0,
  DESCARTADO: 0,
  ARQUIVADO: 0,
};

const EMPTY_PAGINATION: LeadsPagination = {
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1,
};

function logClientError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<LeadFilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<LeadSortField>("createdAt");
  const [order, setOrder] = useState<LeadSortOrder>("desc");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<LeadsPagination>(EMPTY_PAGINATION);
  const [counts, setCounts] = useState<LeadsCounts>(EMPTY_COUNTS);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        status: filterStatus,
        page: String(page),
        pageSize: "20",
        sort,
        order,
      });

      if (search.trim()) {
        params.set("q", search.trim());
      }

      const res = await fetch(`/api/admin/leads?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });

      const payload: LeadsResponse = await res.json();

      if (!payload.success) {
        setError(payload.error?.message || "Erro ao carregar leads");
        setLeads([]);
        setCounts(EMPTY_COUNTS);
        setPagination(EMPTY_PAGINATION);
        return;
      }

      setLeads(Array.isArray(payload.data) ? payload.data : []);
      setPagination(payload.meta?.pagination ?? EMPTY_PAGINATION);
      setCounts(payload.meta?.counts ?? EMPTY_COUNTS);
    } catch (err) {
      logClientError(err);
      setError("Erro ao carregar leads");
      setLeads([]);
      setCounts(EMPTY_COUNTS);
      setPagination(EMPTY_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page, search, sort, order]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const updateLeadStatus = useCallback(
    async (id: string, status: LeadStatus) => {
      try {
        setActionLoadingId(id);
        setFeedback(null);
        setError(null);

        const res = await fetch(`/api/admin/leads/${id}/status`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        const payload: LeadMutationResponse = await res.json();

        if (!payload.success) {
          setError(payload.error?.message || "Erro ao atualizar status");
          return;
        }

        setFeedback("Status atualizado com sucesso.");
        await loadLeads();
      } catch (err) {
        logClientError(err);
        setError("Erro ao atualizar status");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadLeads]
  );

  const archiveLead = useCallback(
    async (id: string) => {
      try {
        setActionLoadingId(id);
        setFeedback(null);
        setError(null);

        const res = await fetch(`/api/admin/leads/${id}/archive`, {
          method: "PATCH",
          credentials: "include",
        });

        const payload: LeadMutationResponse = await res.json();

        if (!payload.success) {
          setError(payload.error?.message || "Erro ao arquivar lead");
          return;
        }

        setFeedback("Lead arquivado com sucesso.");
        await loadLeads();
      } catch (err) {
        logClientError(err);
        setError("Erro ao arquivar lead");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadLeads]
  );

  const deleteLead = useCallback(
    async (id: string) => {
      const confirmed = window.confirm(
        "Tem certeza que deseja excluir este lead? A exclusão será lógica e ele sairá da listagem."
      );

      if (!confirmed) return;

      try {
        setActionLoadingId(id);
        setFeedback(null);
        setError(null);

        const res = await fetch(`/api/admin/leads/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        const payload: LeadMutationResponse = await res.json();

        if (!payload.success) {
          setError(payload.error?.message || "Erro ao excluir lead");
          return;
        }

        setFeedback("Lead excluído com sucesso.");
        await loadLeads();
      } catch (err) {
        logClientError(err);
        setError("Erro ao excluir lead");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadLeads]
  );

  const columns = useMemo<DataTableColumn<Lead>[]>((() => {
    return [
      {
        key: "name",
        header: "Lead",
        cellClassName: "min-w-[240px]",
        render: (lead) => (
          <div className="space-y-1">
            <p className="font-semibold text-primary">{lead.name}</p>
            <p className="text-xs text-secondary">{lead.email}</p>
            <p className="text-xs text-secondary">{normalizeText(lead.phone)}</p>
          </div>
        ),
      },
      {
        key: "location",
        header: "Local",
        cellClassName: "min-w-[180px]",
        render: (lead) => (
          <div className="space-y-1">
            <p className="text-sm text-primary">{normalizeText(lead.city)}</p>
            <p className="text-xs text-secondary">{normalizeText(lead.district)}</p>
            <p className="text-xs text-secondary">{normalizeText(lead.cep)}</p>
          </div>
        ),
      },
      {
        key: "plan",
        header: "Plano",
        cellClassName: "min-w-[160px]",
        render: (lead) => (
          <span className="text-sm text-primary">
            {lead.plan?.name || "Não informado"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cellClassName: "min-w-[160px]",
        render: (lead) => (
          <Badge variant={getStatusBadgeVariant(lead.status)}>
            {getStatusLabel(lead.status)}
          </Badge>
        ),
      },
      {
        key: "source",
        header: "Origem",
        render: (lead) => (
          <span className="text-sm text-primary">
            {normalizeText(lead.source)}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Criado em",
        cellClassName: "min-w-[150px]",
        render: (lead) => (
          <span className="text-sm text-primary">{formatDate(lead.createdAt)}</span>
        ),
      },
      {
        key: "actions",
        header: "Ações",
        cellClassName: "min-w-[340px]",
        render: (lead) => {
          const primaryAction = getPrimaryAction(lead.status);
          const isBusy = actionLoadingId === lead.id;

          return (
            <div className="flex flex-wrap gap-2">
              {primaryAction ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => updateLeadStatus(lead.id, primaryAction.nextStatus)}
                  disabled={isBusy}
                  isLoading={isBusy}
                >
                  {primaryAction.label}
                </Button>
              ) : null}

              {lead.status !== "DESCARTADO" && lead.status !== "CONVERTIDO" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => updateLeadStatus(lead.id, "DESCARTADO")}
                  disabled={isBusy}
                >
                  Descartar
                </Button>
              ) : null}

              {lead.status !== "ARQUIVADO" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => archiveLead(lead.id)}
                  disabled={isBusy}
                >
                  Arquivar
                </Button>
              ) : null}

              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => deleteLead(lead.id)}
                disabled={isBusy}
              >
                Excluir
              </Button>
            </div>
          );
        },
      },
    ];
  }) as () => DataTableColumn<Lead>[], [actionLoadingId, archiveLead, deleteLead, updateLeadStatus]);

  const pageLabel = useMemo(() => {
    if (pagination.total === 0) return "Nenhum resultado";
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total);
    return `${start}-${end} de ${pagination.total}`;
  }, [pagination]);

  return (
    <div className="space-y-6">
            <AdminHero
        badge="Admin - Leads"
        title="Gestão de leads"
        description="Acompanhe oportunidades comerciais recebidas pelo site, atualize o status do atendimento e mantenha o pipeline organizado."
        actions={
          <Button
            type="button"
            variant="outline"
            className="border-white/25 bg-white/10 text-white hover:bg-white/20"
            onClick={() => void loadLeads()}
          >
            Atualizar
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={counts.ALL}
          description="Leads encontrados para os filtros atuais."
          tone="default"
        />
        <StatCard
          label="Novos"
          value={counts.NOVO}
          description="Entradas recentes aguardando ação."
          tone="info"
        />
        <StatCard
          label="Em atendimento"
          value={counts.EM_ATENDIMENTO}
          description="Leads em progresso comercial."
          tone="warning"
        />
        <StatCard
          label="Convertidos"
          value={counts.CONVERTIDO}
          description="Leads já convertidos."
          tone="success"
        />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-surface shadow-soft">
        <div className="border-b border-border/80 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Filtros e busca</h2>
              <p className="mt-1 text-sm text-secondary">
                Busque por nome, e-mail, telefone, cidade ou bairro e refine o pipeline por etapa.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    setSearch(searchInput.trim());
                  }
                }}
                placeholder="Buscar lead..."
                className="h-11 min-w-[220px] rounded-2xl border border-border bg-surface px-4 text-sm text-primary outline-none transition placeholder:text-muted focus:border-[color:var(--ring)] focus:ring-2 focus:ring-[color:var(--ring)]/20"
              />

              <Select
                value={filterStatus}
                onChange={(e) => {
                  setPage(1);
                  setFilterStatus(e.target.value as LeadFilterStatus);
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value as LeadSortField);
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Ordenar por: {option.label}
                  </option>
                ))}
              </Select>

              <Select
                value={order}
                onChange={(e) => {
                  setPage(1);
                  setOrder(e.target.value as LeadSortOrder);
                }}
              >
                <option value="desc">Mais recentes primeiro</option>
                <option value="asc">Mais antigos primeiro</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPage(1);
                setSearch(searchInput.trim());
              }}
            >
              Aplicar busca
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setFilterStatus("ALL");
                setSort("createdAt");
                setOrder("desc");
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          </div>

          <p className="text-sm text-secondary">{pageLabel}</p>
        </div>

        <div className="p-5 sm:p-6">
          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {feedback ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedback}
            </div>
          ) : null}

          <DataTable
            data={leads}
            columns={columns}
            isLoading={loading}
            getRowKey={(lead) => lead.id}
            emptyTitle="Nenhum lead encontrado"
            emptyDescription="Ajuste os filtros atuais ou aguarde novas entradas do site."
          />

          <div className="mt-5 flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-secondary">
              Página {pagination.page} de {Math.max(pagination.totalPages, 1)}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={pagination.page <= 1 || loading}
              >
                Anterior
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, Math.max(pagination.totalPages, 1))
                  )
                }
                disabled={
                  pagination.page >= Math.max(pagination.totalPages, 1) || loading
                }
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


