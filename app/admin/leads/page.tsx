"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";
import { SectionHeader } from "@/components/ui/core/section-header";
import { StatCard } from "@/components/ui/core/stat-card";

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
  plan?: {
    id: string;
    name: string;
  } | null;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type LeadFilterStatus = "ALL" | LeadStatus;

const statusOptions: Array<{ value: LeadFilterStatus; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "NOVO", label: "Novo" },
  { value: "EM_ATENDIMENTO", label: "Em atendimento" },
  { value: "CONVERTIDO", label: "Convertido" },
  { value: "DESCARTADO", label: "Descartado" },
  { value: "ARQUIVADO", label: "Arquivado" },
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LeadFilterStatus>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(
    async (selectedStatus: LeadFilterStatus = filterStatus) => {
      try {
        setLoading(true);
        setError(null);

        const query =
          selectedStatus === "ALL"
            ? "/api/admin/leads?status=ALL"
            : `/api/admin/leads?status=${selectedStatus}`;

        const res = await fetch(query, {
          credentials: "include",
          cache: "no-store",
        });

        const data: ApiResponse<Lead[]> = await res.json();

        if (!data.success) {
          setError(data.error || "Erro ao carregar leads");
          setLeads([]);
          return;
        }

        setLeads(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar leads");
        setLeads([]);
      } finally {
        setLoading(false);
      }
    },
    [filterStatus]
  );

  useEffect(() => {
    void loadLeads(filterStatus);
  }, [filterStatus, loadLeads]);

  const updateLeadStatus = useCallback(
    async (id: string, status: LeadStatus) => {
      try {
        setActionLoadingId(id);

        const res = await fetch(`/api/admin/leads/${id}/status`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        const data: ApiResponse<Lead> = await res.json();

        if (!data.success) {
          alert(data.error || "Erro ao atualizar status");
          return;
        }

        await loadLeads();
      } catch (err) {
        console.error(err);
        alert("Erro ao atualizar status");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadLeads]
  );

  const archiveLead = async (id: string) => {
    try {
      setActionLoadingId(id);

      const res = await fetch(`/api/admin/leads/${id}/archive`, {
        method: "PATCH",
        credentials: "include",
      });

      const data: ApiResponse<Lead> = await res.json();

      if (!data.success) {
        alert(data.error || "Erro ao arquivar lead");
        return;
      }

      await loadLeads();
    } catch (err) {
      console.error(err);
      alert("Erro ao arquivar lead");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteLead = async (id: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este lead? A exclusão será lógica e ele sairá da listagem."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data: ApiResponse<null> = await res.json();

      if (!data.success) {
        alert(data.error || "Erro ao excluir lead");
        return;
      }

      await loadLeads();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir lead");
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalLeads = leads.length;
  const totalNovos = useMemo(
    () => leads.filter((lead) => lead.status === "NOVO").length,
    [leads]
  );
  const totalEmAtendimento = useMemo(
    () => leads.filter((lead) => lead.status === "EM_ATENDIMENTO").length,
    [leads]
  );
  const totalConvertidos = useMemo(
    () => leads.filter((lead) => lead.status === "CONVERTIDO").length,
    [leads]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <SectionHeader
          badge={
            <Badge variant="info" className="w-fit">
              Admin • Leads
            </Badge>
          }
          title="Gestão de leads"
          description="Acompanhe oportunidades comerciais recebidas pelo site, atualize o status do atendimento e mantenha o pipeline organizado."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={totalLeads}
          description="Leads na listagem atual."
          accent="text-primary"
        />
        <StatCard
          label="Novos"
          value={totalNovos}
          description="Entradas recentes aguardando ação."
          accent="text-blue-600"
        />
        <StatCard
          label="Em atendimento"
          value={totalEmAtendimento}
          description="Leads em progresso comercial."
          accent="text-amber-600"
        />
        <StatCard
          label="Convertidos"
          value={totalConvertidos}
          description="Leads já convertidos."
          accent="text-emerald-600"
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface shadow-soft">
        <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Filtro de status</h2>
            <p className="mt-1 text-sm text-secondary">
              Filtre os leads por etapa do funil.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LeadFilterStatus)}
              className="h-11 rounded-2xl border border-border bg-surface px-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadLeads()}
            >
              Atualizar
            </Button>
          </div>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-2xl border border-border bg-surface-secondary"
                />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-secondary px-6 py-12 text-center">
              <p className="text-sm text-secondary">
                Nenhum lead encontrado para o filtro atual.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <article
                  key={lead.id}
                  className="rounded-2xl border border-border bg-surface-secondary p-5 transition hover:border-border-strong"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <h3 className="text-base font-semibold text-primary sm:text-lg">
                          {lead.name}
                        </h3>

                        <Badge variant={getStatusBadgeVariant(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-secondary sm:grid-cols-2">
                        <p>
                          <span className="text-muted">E-mail:</span> {lead.email}
                        </p>
                        <p>
                          <span className="text-muted">Telefone:</span>{" "}
                          {lead.phone || "Não informado"}
                        </p>
                        <p>
                          <span className="text-muted">Cidade:</span>{" "}
                          {lead.city || "Não informado"}
                        </p>
                        <p>
                          <span className="text-muted">Bairro:</span>{" "}
                          {lead.district || "Não informado"}
                        </p>
                        <p>
                          <span className="text-muted">CEP:</span>{" "}
                          {lead.cep || "Não informado"}
                        </p>
                        <p>
                          <span className="text-muted">Plano:</span>{" "}
                          {lead.plan?.name || "Não informado"}
                        </p>
                        <p>
                          <span className="text-muted">Origem:</span>{" "}
                          {lead.source || "Não informado"}
                        </p>
                        <p>
                          <span className="text-muted">Criado em:</span>{" "}
                          {formatDate(lead.createdAt)}
                        </p>
                      </div>

                      {lead.message && (
                        <div className="rounded-xl border border-border bg-white px-4 py-3">
                          <p className="mb-1 text-xs uppercase tracking-[0.16em] text-muted">
                            Mensagem
                          </p>
                          <p className="whitespace-pre-line text-sm leading-6 text-secondary">
                            {lead.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex w-full flex-col gap-2 lg:w-[220px]">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => updateLeadStatus(lead.id, "EM_ATENDIMENTO")}
                        disabled={actionLoadingId === lead.id}
                      >
                        Em atendimento
                      </Button>

                      <Button
                        type="button"
                        onClick={() => updateLeadStatus(lead.id, "CONVERTIDO")}
                        disabled={actionLoadingId === lead.id}
                      >
                        Converter
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, "DESCARTADO")}
                        disabled={actionLoadingId === lead.id}
                      >
                        Descartar
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => archiveLead(lead.id)}
                        disabled={actionLoadingId === lead.id}
                      >
                        Arquivar
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => deleteLead(lead.id)}
                        disabled={actionLoadingId === lead.id}
                      >
                        {actionLoadingId === lead.id ? "Processando..." : "Excluir"}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}