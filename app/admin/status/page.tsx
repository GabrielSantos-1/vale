"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";
import { StatCard } from "@/components/ui/core/stat-card";
import { Card, CardContent } from "@/components/ui/core/card";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
import { AdminHero } from "@/components/admin/layout/admin-hero";

type NetworkStatusItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  description?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiErrorItem = {
  message?: string;
  path?: string[];
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string | ApiErrorItem[];
};

type StatusFormState = {
  title: string;
  slug: string;
  status: string;
  description: string;
  startedAt: string;
  resolvedAt: string;
  isVisible: boolean;
};

const initialForm: StatusFormState = {
  title: "",
  slug: "",
  status: "monitorando",
  description: "",
  startedAt: "",
  resolvedAt: "",
  isVisible: true,
};

function toDatetimeLocalValue(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeApiError(error: unknown, fallback: string) {
  if (Array.isArray(error)) {
    return (
      error
        .map((item) => item?.message)
        .filter(Boolean)
        .join(", ") || fallback
    );
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

function mapVisibilityVariant(isVisible: boolean) {
  return isVisible ? "success" : "warning";
}

function mapStatusVariant(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("resolvido") ||
    normalized.includes("normal") ||
    normalized.includes("operacional")
  ) {
    return "success" as const;
  }

  if (
    normalized.includes("manutencao") ||
    normalized.includes("manutenção") ||
    normalized.includes("monitorando")
  ) {
    return "warning" as const;
  }

  if (
    normalized.includes("indisponivel") ||
    normalized.includes("indisponível") ||
    normalized.includes("degradado")
  ) {
    return "danger" as const;
  }

  return "info" as const;
}

function logClientError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

export default function StatusAdminPage() {
  const [items, setItems] = useState<NetworkStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<StatusFormState>(initialForm);

  const isEditing = editingId !== null;

  async function loadStatusItems() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/status", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ApiResponse<NetworkStatusItem[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          normalizeApiError(result.error, "Falha ao carregar status da rede")
        );
      }

      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      logClientError(err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar status da rede"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatusItems();
  }, []);

  function updateField<K extends keyof StatusFormState>(
    field: K,
    value: StatusFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetFormState() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleEdit(item: NetworkStatusItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      status: item.status,
      description: item.description || "",
      startedAt: toDatetimeLocalValue(item.startedAt),
      resolvedAt: toDatetimeLocalValue(item.resolvedAt),
      isVisible: item.isVisible,
    });
    setError(null);
    setSuccess(null);
  }

  function handleCancelEdit() {
    resetFormState();
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const normalizedSlug = normalizeSlug(form.slug || form.title);

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
      };

      if (!payload.title) throw new Error("Título é obrigatório.");
      if (!payload.slug) throw new Error("Slug é obrigatório.");
      if (!payload.status) throw new Error("Status é obrigatório.");

      if (
        payload.startedAt &&
        payload.resolvedAt &&
        new Date(payload.resolvedAt).getTime() < new Date(payload.startedAt).getTime()
      ) {
        throw new Error(
          "A data de resolução não pode ser anterior à data de início."
        );
      }

      const url = isEditing
        ? `/api/admin/status/${editingId}`
        : "/api/admin/status";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result: ApiResponse<NetworkStatusItem> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, "Falha ao salvar status"));
      }

      setSuccess(
        isEditing
          ? "Status atualizado com sucesso."
          : "Status cadastrado com sucesso."
      );

      resetFormState();
      await loadStatusItems();
    } catch (err) {
      logClientError(err);
      setError(err instanceof Error ? err.message : "Erro ao salvar status");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: NetworkStatusItem) {
    const confirmed = window.confirm(
      `Deseja excluir o status "${item.title}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;
    if (deletingId) return;

    try {
      setDeletingId(item.id);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/status/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result: ApiResponse<null> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, "Falha ao excluir status"));
      }

      if (editingId === item.id) {
        resetFormState();
      }

      setSuccess("Status excluído com sucesso.");
      await loadStatusItems();
    } catch (err) {
      logClientError(err);
      setError(err instanceof Error ? err.message : "Erro ao excluir status");
    } finally {
      setDeletingId(null);
    }
  }

  const totalItems = useMemo(() => items.length, [items]);
  const totalVisible = useMemo(
    () => items.filter((item) => item.isVisible).length,
    [items]
  );
  const totalResolved = useMemo(
    () =>
      items.filter((item) =>
        item.status.toLowerCase().includes("resolvido")
      ).length,
    [items]
  );

  return (
    <div className="space-y-6">
            <AdminHero
        badge="Admin - Status da rede"
        title="Gestão de status da rede"
        description="Cadastre incidentes, manutenções e avisos operacionais para exibição pública com melhor controle de visibilidade e contexto."
        actions={
          <Button
            type="button"
            variant="outline"
            className="border-white/25 bg-white/10 text-white hover:bg-white/20"
            onClick={() => void loadStatusItems()}
          >
            Atualizar
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total de registros"
          value={totalItems}
          description="Todos os status cadastrados no sistema."
          tone="default"
        />
        <StatCard
          label="Visíveis no site"
          value={totalVisible}
          description="Avisos atualmente publicados para o cliente final."
          tone="success"
        />
        <StatCard
          label="Resolvidos"
          value={totalResolved}
          description="Registros marcados como resolvidos."
          tone="info"
        />
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-white/10 bg-surface shadow-soft">
          <CardContent className="p-0">
            <div className="border-b border-border/80 p-5">
              <h2 className="text-lg font-semibold text-primary">
                {isEditing ? "Editar status" : "Novo status"}
              </h2>
              <p className="mt-1 text-sm text-secondary">
                Registre incidentes, manutenção ou estado operacional.
              </p>
            </div>

            <div className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      updateField("title", title);

                      if (
                        !isEditing &&
                        (!form.slug ||
                          normalizeSlug(form.slug) === normalizeSlug(form.title))
                      ) {
                        updateField("slug", normalizeSlug(title));
                      }
                    }}
                    placeholder="Ex.: Instabilidade em Peruíbe"
                    maxLength={180}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => updateField("slug", normalizeSlug(e.target.value))}
                    placeholder="instabilidade-peruibe"
                    maxLength={180}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none transition focus:border-[color:var(--ring)] focus:ring-2 focus:ring-[color:var(--ring)]/20"
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option value="monitorando">Monitorando</option>
                    <option value="degradado">Serviço degradado</option>
                    <option value="indisponivel">Indisponível</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="resolvido">Resolvido</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    className="min-h-[130px]"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Ex.: Clientes podem notar lentidão e instabilidade temporária."
                    maxLength={3000}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="startedAt">Início</Label>
                    <Input
                      id="startedAt"
                      type="datetime-local"
                      value={form.startedAt}
                      onChange={(e) => updateField("startedAt", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="resolvedAt">Resolução</Label>
                    <Input
                      id="resolvedAt"
                      type="datetime-local"
                      value={form.resolvedAt}
                      onChange={(e) => updateField("resolvedAt", e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-primary">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(e) => updateField("isVisible", e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  Exibir no site
                </label>

                <div className="flex flex-col gap-3 pt-2">
                  <Button type="submit" isLoading={submitting} disabled={submitting}>
                    {isEditing ? "Salvar alterações" : "Cadastrar status"}
                  </Button>

                  {isEditing ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancelEdit}
                      disabled={submitting}
                    >
                      Cancelar edição
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-surface shadow-soft">
          <CardContent className="p-0">
            <div className="border-b border-border/80 p-5">
              <h2 className="text-lg font-semibold text-primary">Status cadastrados</h2>
              <p className="mt-1 text-sm text-secondary">
                Base operacional pública e histórica.
              </p>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="animate-pulse space-y-3">
                        <div className="h-5 w-40 rounded bg-white/10" />
                        <div className="h-4 w-28 rounded bg-white/10" />
                        <div className="h-12 w-full rounded bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-white/5 p-10 text-center text-sm text-secondary">
                  Nenhum status cadastrado ainda.
                </div>
              ) : (
                <div className="grid gap-4">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[24px] border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-primary">
                            {item.title}
                          </h3>
                          <p className="text-sm text-secondary">Slug: {item.slug}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={mapVisibilityVariant(item.isVisible)}>
                            {item.isVisible ? "Visível" : "Oculto"}
                          </Badge>

                          <Badge variant={mapStatusVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>

                      {item.description ? (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                          <p className="whitespace-pre-line text-sm leading-6 text-secondary">
                            {item.description}
                          </p>
                        </div>
                      ) : null}

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-secondary">Início</p>
                          <p className="text-sm text-secondary">
                            {formatDateTime(item.startedAt)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-secondary">Resolução</p>
                          <p className="text-sm text-secondary">
                            {formatDateTime(item.resolvedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleEdit(item)}
                          disabled={submitting || deletingId === item.id}
                        >
                          Editar
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => void handleDelete(item)}
                          disabled={submitting || deletingId === item.id}
                        >
                          {deletingId === item.id ? "Excluindo..." : "Excluir"}
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


