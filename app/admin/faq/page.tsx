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
import { AdminHero } from "@/components/admin/layout/admin-hero";
import { createAdminMutationHeaders } from "@/lib/security/csrf-client";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  order: number;
  isPublished: boolean;
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

type FaqFormState = {
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
};

const initialForm: FaqFormState = {
  question: "",
  answer: "",
  category: "",
  order: 0,
  isPublished: true,
};

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

export default function FaqAdminPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FaqFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditing = editingId !== null;

  async function loadFaqs() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/faq", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ApiResponse<FAQItem[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, "Falha ao carregar FAQs"));
      }

      setFaqs(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar FAQs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFaqs();
  }, []);

  function updateField<K extends keyof FaqFormState>(
    field: K,
    value: FaqFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetFormState() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleEdit(item: FAQItem) {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category || "",
      order: item.order,
      isPublished: item.isPublished,
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
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || undefined,
        order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
        isPublished: Boolean(form.isPublished),
      };

      if (!payload.question) {
        throw new Error("Pergunta é obrigatória.");
      }

      if (!payload.answer) {
        throw new Error("Resposta é obrigatória.");
      }

      if (payload.order < 0) {
        throw new Error("A ordem de exibição não pode ser negativa.");
      }

      const url = isEditing ? `/api/admin/faq/${editingId}` : "/api/admin/faq";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: createAdminMutationHeaders({
          "Content-Type": "application/json",
        }),
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result: ApiResponse<FAQItem> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, "Falha ao salvar FAQ"));
      }

      setSuccess(
        isEditing ? "FAQ atualizada com sucesso." : "FAQ cadastrada com sucesso."
      );
      resetFormState();
      await loadFaqs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar FAQ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: FAQItem) {
    const confirmed = window.confirm(
      `Deseja excluir a FAQ "${item.question}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;
    if (deletingId) return;

    try {
      setDeletingId(item.id);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/faq/${item.id}`, {
        method: "DELETE",
        headers: createAdminMutationHeaders(),
        credentials: "include",
      });

      const result: ApiResponse<null> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(normalizeApiError(result.error, "Falha ao excluir FAQ"));
      }

      if (editingId === item.id) {
        resetFormState();
      }

      setSuccess("FAQ excluída com sucesso.");
      await loadFaqs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir FAQ");
    } finally {
      setDeletingId(null);
    }
  }

  const totalFaqs = useMemo(() => faqs.length, [faqs]);
  const totalPublished = useMemo(
    () => faqs.filter((item) => item.isPublished).length,
    [faqs]
  );

  return (
    <div className="space-y-8">
            <AdminHero
        badge="Admin - FAQ"
        title="Gestão de FAQ"
        description="Gerencie perguntas frequentes exibidas no site público."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total de FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{totalFaqs}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publicadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-emerald-600">{totalPublished}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-secondary">
              Mantenha o conteúdo público de dúvidas frequentes atualizado e organizado.
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
            <CardTitle>{isEditing ? "Editar FAQ" : "Nova FAQ"}</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Pergunta</Label>
                <Input
                  id="question"
                  value={form.question}
                  onChange={(e) => updateField("question", e.target.value)}
                  placeholder="Ex.: Qual o prazo de instalação?"
                  maxLength={180}
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Resposta</Label>
                <Textarea
                  id="answer"
                  className="min-h-[140px]"
                  value={form.answer}
                  onChange={(e) => updateField("answer", e.target.value)}
                  placeholder="Ex.: A instalação é realizada em até 48 horas úteis."
                  maxLength={3000}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="Ex.: instalação"
                  maxLength={80}
                />
              </div>

              <div>
                <Label htmlFor="order">Ordem de exibição</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  step={1}
                  value={form.order}
                  onChange={(e) => updateField("order", Number(e.target.value))}
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => updateField("isPublished", e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Publicar no site
              </label>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={submitting} isLoading={submitting}>
                  {isEditing ? "Salvar alterações" : "Cadastrar FAQ"}
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
              <CardTitle>FAQs cadastradas</CardTitle>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void loadFaqs()}
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
            ) : faqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-secondary p-8 text-center text-sm text-secondary">
                Nenhuma FAQ cadastrada ainda.
              </div>
            ) : (
              <div className="grid gap-4">
                {faqs.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-border bg-surface-secondary p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-primary">
                          {item.question}
                        </h3>
                        <p className="text-sm text-secondary">
                          Categoria: {item.category || "geral"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={item.isPublished ? "success" : "warning"}>
                          {item.isPublished ? "Publicada" : "Rascunho"}
                        </Badge>

                        <span className="text-xs text-muted">
                          Ordem: {item.order}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="whitespace-pre-line text-sm leading-6 text-secondary">
                        {item.answer}
                      </p>
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

