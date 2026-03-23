"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/core/badge";
import { Button } from "@/components/ui/core/button";
import { SectionHeader } from "@/components/ui/core/section-header";
import { StatCard } from "@/components/ui/core/stat-card";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";

type CoverageArea = {
  id: string;
  city: string;
  district: string;
  cepStart: string;
  cepEnd: string;
  isAvailable: boolean;
  notes?: string | null;
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

type CoverageFormState = {
  city: string;
  district: string;
  cepStart: string;
  cepEnd: string;
  isAvailable: boolean;
  notes: string;
};

const initialForm: CoverageFormState = {
  city: "",
  district: "",
  cepStart: "",
  cepEnd: "",
  isAvailable: true,
  notes: "",
};

function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function formatCep(value: string) {
  const digits = normalizeCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
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

export default function CoberturaPage() {
  const [areas, setAreas] = useState<CoverageArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<CoverageFormState>(initialForm);

  const isEditing = editingId !== null;

  async function loadCoverage() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/coverage", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ApiResponse<CoverageArea[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          normalizeApiError(result.error, "Falha ao carregar áreas de cobertura")
        );
      }

      setAreas(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar áreas de cobertura"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCoverage();
  }, []);

  function updateField<K extends keyof CoverageFormState>(
    field: K,
    value: CoverageFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetFormState() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleEdit(area: CoverageArea) {
    setEditingId(area.id);
    setForm({
      city: area.city,
      district: area.district,
      cepStart: area.cepStart,
      cepEnd: area.cepEnd,
      isAvailable: area.isAvailable,
      notes: area.notes || "",
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
      const payload = {
        city: form.city.trim(),
        district: form.district.trim(),
        cepStart: normalizeCep(form.cepStart),
        cepEnd: normalizeCep(form.cepEnd),
        isAvailable: Boolean(form.isAvailable),
        notes: form.notes.trim() || undefined,
      };

      if (!payload.city) throw new Error("Cidade é obrigatória.");
      if (!payload.district) throw new Error("Bairro é obrigatório.");
      if (payload.cepStart.length !== 8 || payload.cepEnd.length !== 8) {
        throw new Error("CEP inicial e CEP final devem ter 8 dígitos.");
      }
      if (Number(payload.cepStart) > Number(payload.cepEnd)) {
        throw new Error("O CEP inicial não pode ser maior que o CEP final.");
      }

      const url = isEditing
        ? `/api/admin/coverage/${editingId}`
        : "/api/admin/coverage";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result: ApiResponse<CoverageArea> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          normalizeApiError(result.error, "Falha ao salvar área de cobertura")
        );
      }

      setSuccess(
        isEditing
          ? "Área de cobertura atualizada com sucesso."
          : "Área de cobertura cadastrada com sucesso."
      );

      resetFormState();
      await loadCoverage();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar área de cobertura"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(area: CoverageArea) {
    const confirmed = window.confirm(
      `Deseja excluir a área "${area.city} - ${area.district}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;
    if (deletingId) return;

    try {
      setDeletingId(area.id);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/coverage/${area.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result: ApiResponse<null> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          normalizeApiError(result.error, "Falha ao excluir área de cobertura")
        );
      }

      if (editingId === area.id) {
        resetFormState();
      }

      setSuccess("Área de cobertura excluída com sucesso.");
      await loadCoverage();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir área de cobertura"
      );
    } finally {
      setDeletingId(null);
    }
  }

  const totalAreas = useMemo(() => areas.length, [areas]);
  const totalAvailable = useMemo(
    () => areas.filter((area) => area.isAvailable).length,
    [areas]
  );
  const totalUnavailable = useMemo(
    () => areas.filter((area) => !area.isAvailable).length,
    [areas]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <SectionHeader
          badge={
            <Badge variant="info" className="w-fit">
              Admin • Cobertura
            </Badge>
          }
          title="Gestão de cobertura"
          description="Cadastre, edite e gerencie regiões atendidas com precisão operacional e melhor controle da disponibilidade por CEP."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total de áreas"
          value={totalAreas}
          description="Quantidade total cadastrada no sistema."
          accent="text-primary"
        />

        <StatCard
          label="Disponíveis"
          value={totalAvailable}
          description="Áreas marcadas como disponíveis para atendimento."
          accent="text-emerald-600"
        />

        <StatCard
          label="Indisponíveis"
          value={totalUnavailable}
          description="Áreas cadastradas sem disponibilidade ativa."
          accent="text-amber-600"
        />
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-border bg-surface shadow-soft">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold text-primary">
              {isEditing ? "Editar área" : "Nova área"}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Preencha os dados da região atendida.
            </p>
          </div>

          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Peruíbe"
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <Label htmlFor="district">Bairro</Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="Centro"
                  maxLength={120}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cepStart">CEP inicial</Label>
                  <Input
                    id="cepStart"
                    value={formatCep(form.cepStart)}
                    onChange={(e) =>
                      updateField("cepStart", normalizeCep(e.target.value))
                    }
                    placeholder="11750-000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cepEnd">CEP final</Label>
                  <Input
                    id="cepEnd"
                    value={formatCep(form.cepEnd)}
                    onChange={(e) =>
                      updateField("cepEnd", normalizeCep(e.target.value))
                    }
                    placeholder="11759-999"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Ex.: Atendimento disponível apenas em algumas ruas."
                  className="min-h-[110px]"
                  maxLength={2000}
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => updateField("isAvailable", e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Marcar como disponível
              </label>

              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" isLoading={submitting}>
                  {isEditing ? "Salvar alterações" : "Cadastrar área"}
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
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface shadow-soft">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Áreas cadastradas</h2>
              <p className="mt-1 text-sm text-secondary">
                Regiões já registradas no sistema.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadCoverage()}
            >
              Atualizar
            </Button>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl border border-border bg-surface-secondary"
                  />
                ))}
              </div>
            ) : areas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface-secondary px-6 py-12 text-center">
                <p className="text-sm text-secondary">
                  Nenhuma área cadastrada ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {areas.map((area) => (
                  <article
                    key={area.id}
                    className="rounded-2xl border border-border bg-surface-secondary p-5 transition hover:border-border-strong"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-primary sm:text-lg">
                          {area.city} — {area.district}
                        </h3>

                        <p className="mt-1 text-sm text-secondary">
                          CEP: {formatCep(area.cepStart)} até {formatCep(area.cepEnd)}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          Atualizado em {formatDate(area.updatedAt)}
                        </p>
                      </div>

                      <Badge variant={area.isAvailable ? "success" : "warning"}>
                        {area.isAvailable ? "Disponível" : "Indisponível"}
                      </Badge>
                    </div>

                    {area.notes && (
                      <div className="mt-4 rounded-xl border border-border bg-white px-4 py-3">
                        <p className="mb-1 text-xs uppercase tracking-[0.16em] text-muted">
                          Observações
                        </p>
                        <p className="whitespace-pre-line text-sm leading-6 text-secondary">
                          {area.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleEdit(area)}
                        disabled={submitting || deletingId === area.id}
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void handleDelete(area)}
                        disabled={submitting || deletingId === area.id}
                      >
                        {deletingId === area.id ? "Excluindo..." : "Excluir"}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}