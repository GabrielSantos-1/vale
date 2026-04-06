import { ShieldCheck } from "lucide-react";

import { StatusPill } from "@/components/ui/feedback/status-pill";

type DashboardHeaderProps = {
  firstName: string;
  statusLabel: string;
  action: React.ReactNode;
};

export function DashboardHeader({
  firstName,
  statusLabel,
  action,
}: DashboardHeaderProps) {
  return (
    <header className="rounded-[var(--radius-lg)] border border-border bg-surface px-5 py-4 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
            Central do Cliente
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Ola, {firstName}
          </h1>
          <div className="flex items-center gap-2">
            <StatusPill label={statusLabel} tone="success" />
            <p className="text-sm text-secondary">
              Acesse suas informacoes e resolva demandas em poucos cliques.
            </p>
          </div>
        </div>
        <div className="self-start md:self-auto">{action}</div>
      </div>
    </header>
  );
}
