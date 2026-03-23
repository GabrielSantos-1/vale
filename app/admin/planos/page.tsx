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

type Plan = {
  id: string;
  name: string;
  slug: string;
  downloadMbps: number;
  uploadMbps: number;
  latencyTarget: number;
  priceCents: number;
  featured: boolean;
  benefitsJson: unknown;
  badge?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiListResponse = {
  success: boolean;
  data?: Plan[];
  error?: string;
};

const initialForm = {
  name: "",
  slug: "",
  downloadMbps: 0,
  uploadMbps: 0,
  latencyTarget: 0,
  priceCents: 0,
  featured: false,
  badge: "",
  benefitsText: "",
};

function formatPrice(priceCents: number) {
  return (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [form, setForm] = useState(initialForm);

  async function loadPlans() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/plans", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ApiListResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Falha ao carregar planos");
      }

      setPlans(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  const totalPlans = useMemo(() => plans.length, [plans]);
  const totalFeatured = useMemo(
    () => plans.filter((plan) => plan.featured).length,
    [plans]
  );

  function updateField<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    if (!editingPlan) return;

    setForm({
      name: editingPlan.name,
      slug: editingPlan.slug,
      downloadMbps: editingPlan.downloadMbps,
      uploadMbps: editingPlan.uploadMbps,
      latencyTarget: editingPlan.latencyTarget,
      priceCents: editingPlan.priceCents,
      featured: editingPlan.featured,
      badge: editingPlan.badge || "",
      benefitsText: Array.isArray(editingPlan.benefitsJson)
        ? editingPlan.benefitsJson.join("\n")
        : "",
    });
  }, [editingPlan]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const benefitsJson = form.benefitsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

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
      };

      const response = await fetch(
        editingPlan ? `/api/admin/plans/${editingPlan.id}` : "/api/admin/plans",
        {
          method: editingPlan ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao salvar plano");
      }

      setSuccess(
        editingPlan
          ? "Plano atualizado com sucesso."
          : "Plano criado com sucesso."
      );

      setForm(initialForm);
      setEditingPlan(null);

      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar plano");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(planId: string, planName: string) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o plano "${planName}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(planId);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Falha ao excluir plano");
      }

      setSuccess("Plano removido com sucesso.");
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir plano");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Badge variant="info">Admin • Planos</Badge>

        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">
            Gestão de planos
          </h2>
          <p className="mt-3 text-sm leading-6 text-secondary md:text-base">
            Cadastre, edite e remova planos comerciais do sistema.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total de planos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalPlans}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Planos em destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-emerald-600">{totalFeatured}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-secondary">
              Use este módulo para manter a vitrine comercial pública atualizada.
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

      <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPlan ? "Editar plano" : "Novo plano"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {editingPlan && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Editando plano: <strong>{editingPlan.name}</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex.: Fibra 600 Mega"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="fibra-600-mega"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="downloadMbps">Download (Mbps)</Label>
                  <Input
                    id="downloadMbps"
                    type="number"
                    value={form.downloadMbps}
                    onChange={(e) =>
                      updateField("downloadMbps", Number(e.target.value))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="uploadMbps">Upload (Mbps)</Label>
                  <Input
                    id="uploadMbps"
                    type="number"
                    value={form.uploadMbps}
                    onChange={(e) =>
                      updateField("uploadMbps", Number(e.target.value))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="latencyTarget">Latência alvo (ms)</Label>
                  <Input
                    id="latencyTarget"
                    type="number"
                    value={form.latencyTarget}
                    onChange={(e) =>
                      updateField("latencyTarget", Number(e.target.value))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priceCents">Preço (centavos)</Label>
                  <Input
                    id="priceCents"
                    type="number"
                    value={form.priceCents}
                    onChange={(e) =>
                      updateField("priceCents", Number(e.target.value))
                    }
                    placeholder="9990"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="badge">Badge comercial</Label>
                <Input
                  id="badge"
                  value={form.badge}
                  onChange={(e) => updateField("badge", e.target.value)}
                  placeholder="Ex.: Mais vendido"
                />
              </div>

              <div>
                <Label htmlFor="benefitsText">Benefícios (um por linha)</Label>
                <Textarea
                  id="benefitsText"
                  value={form.benefitsText}
                  onChange={(e) => updateField("benefitsText", e.target.value)}
                  placeholder={"Wi-Fi grátis\nInstalação facilitada\nSuporte prioritário"}
                  className="min-h-[140px]"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => updateField("featured", e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Marcar como plano em destaque
              </label>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={submitting} isLoading={submitting}>
                  {editingPlan ? "Atualizar plano" : "Criar plano"}
                </Button>

                {editingPlan && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingPlan(null);
                      setForm(initialForm);
                    }}
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
            <CardTitle>Planos cadastrados</CardTitle>
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
                      <div className="h-10 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-secondary p-8 text-center text-sm text-secondary">
                Nenhum plano cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => {
                  const benefits = Array.isArray(plan.benefitsJson)
                    ? plan.benefitsJson.filter(
                        (item): item is string => typeof item === "string"
                      )
                    : [];

                  return (
                    <article
                      key={plan.id}
                      className="rounded-2xl border border-border bg-surface-secondary p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-primary">
                              {plan.name}
                            </h3>

                            {plan.featured && (
                              <Badge variant="default">Destaque</Badge>
                            )}

                            {plan.badge && (
                              <Badge variant="info">{plan.badge}</Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-secondary">
                            <p>Slug: {plan.slug}</p>
                            <p>Preço: {formatPrice(plan.priceCents)}</p>
                            <p>
                              {plan.downloadMbps} Mbps ↓ • {plan.uploadMbps} Mbps ↑
                            </p>
                            <p>Latência alvo: {plan.latencyTarget} ms</p>
                          </div>

                          {benefits.length > 0 && (
                            <ul className="space-y-2 text-sm text-secondary">
                              {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setEditingPlan(plan);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Editar
                          </Button>

                          <Button
                            type="button"
                            variant="danger"
                            disabled={deletingId === plan.id}
                            onClick={() => handleDelete(plan.id, plan.name)}
                          >
                            {deletingId === plan.id ? "Excluindo..." : "Excluir"}
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}