import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LeadStatus } from "@prisma/client";
import { StatusPill } from "@/components/ui/feedback/status-pill";
import { cn } from "@/lib/cn";

type RecentLead = {
  id: string;
  name: string;
  city: string | null;
  planName: string | null;
  createdAt: Date;
  status: LeadStatus;
};

const statusConfig: Record<
  LeadStatus,
  { label: string; tone: "info" | "warning" | "success" | "danger" | "neutral" }
> = {
  NOVO: { label: "Novo", tone: "info" },
  EM_ATENDIMENTO: { label: "Em atendimento", tone: "warning" },
  CONVERTIDO: { label: "Convertido", tone: "success" },
  DESCARTADO: { label: "Descartado", tone: "danger" },
  ARQUIVADO: { label: "Arquivado", tone: "neutral" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function RecentLeads({
  leads,
  className,
}: {
  leads: RecentLead[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-border bg-surface shadow-soft",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/80 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-primary">Leads recentes</h2>
          <p className="mt-1 text-sm text-secondary">
            Ultimas conversas e entradas no funil comercial.
          </p>
        </div>

        <Link
          href="/admin/leads"
          className="rounded-2xl border border-border bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-secondary transition hover:border-border-strong hover:bg-white"
        >
          Ver todos
        </Link>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white/70 px-6 py-10 text-center">
            <p className="text-sm text-secondary">Nenhum lead recente.</p>
          </div>
        ) : (
          leads.map((lead) => {
            const status = statusConfig[lead.status];
            const relative = formatDistanceToNowStrict(lead.createdAt, {
              locale: ptBR,
              addSuffix: true,
            });

            return (
              <article
                key={lead.id}
                className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-white/70 px-4 py-3 shadow-sm transition hover:border-border-strong"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-tertiary text-sm font-semibold text-primary">
                    {getInitials(lead.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">
                      {lead.name}
                    </p>
                    <p className="truncate text-xs text-secondary">
                      {lead.planName ?? "Plano não informado"}
                      {lead.city ? ` - ${lead.city}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusPill label={status.label} tone={status.tone} />
                  <span className="text-xs text-secondary">{relative}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

