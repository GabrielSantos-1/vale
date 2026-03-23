"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/core/card";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";

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
  if (!value) return "—";
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

      if (!payload.title) {
        throw new Error("Título é obrigatório.");
      }

      if (!payload.slug) {
        throw new Error("Slug é obrigatório.");
      }

      if (!payload.status) {
        throw new Error("Status é obrigatório.");
      }

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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Badge variant="info">Admin • Status da rede</Badge>

        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">
            Gestão de status da rede
          </h2>
          <p className="mt-3 text-sm leading-6 text-secondary md:text-base">
            Cadastre incidentes, manutenções e avisos para exibição no site.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total de registros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visíveis no site</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-emerald-600">{totalVisible}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-secondary">
              Publique somente eventos relevantes para manter transparência sem ruído.
            </p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[440px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar status" : "Novo status"}</CardTitle>
          </CardHeader>

          <CardContent>
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
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

              <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => updateField("isVisible", e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Exibir no site
              </label>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={submitting} isLoading={submitting}>
                  {isEditing ? "Salvar alterações" : "Cadastrar status"}
                </Button>

                {isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                  >
                    Cancelar edição
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Status cadastrados</CardTitle>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void loadStatusItems()}
              >
                Atualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-surface-secondary p-4"
                  >
                    <div className="animate-pulse space-y-3">
                      <div className="h-5 w-40 rounded bg-slate-200" />
                      <div className="h-4 w-28 rounded bg-slate-200" />
                      <div className="h-12 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-secondary p-8 text-center text-sm text-secondary">
                Nenhum status cadastrado ainda.
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-border bg-surface-secondary p-5"
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

                    {item.description && (
                      <div className="mt-4">
                        <p className="whitespace-pre-line text-sm leading-6 text-secondary">
                          {item.description}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted">Início</p>
                        <p className="text-sm text-secondary">
                          {formatDateTime(item.startedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted">Resolução</p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}