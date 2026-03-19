import type { Lead, LeadStatus } from './lead-types'
import { STATUS_OPTIONS } from './lead-ui'
import StatusBadge from './StatusBadge'

type LeadCardProps = {
  lead: Lead
  isBusy: boolean
  onChangeStatus: (id: string, status: LeadStatus) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

export default function LeadCard({
  lead,
  isBusy,
  onChangeStatus,
  onArchive,
  onDelete,
}: LeadCardProps) {
  return (
    <article className="group relative rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-white/20 hover:shadow-md">
      
      {/* Glow sutil */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        
        {/* INFO PRINCIPAL */}
        <div className="space-y-3">
          
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary">
              Cliente
            </p>
            <h3 className="text-lg font-semibold text-primary">
              {lead.name}
            </h3>
          </div>

          <div className="grid gap-2 text-sm text-secondary">
            <p><span className="text-primary">E-mail:</span> {lead.email}</p>
            <p><span className="text-primary">Telefone:</span> {lead.phone || '-'}</p>

            {lead.city && (
              <p><span className="text-primary">Cidade:</span> {lead.city}</p>
            )}

            {lead.district && (
              <p><span className="text-primary">Bairro:</span> {lead.district}</p>
            )}

            {lead.plan?.name && (
              <p><span className="text-primary">Plano:</span> {lead.plan.name}</p>
            )}
          </div>

          {lead.message && (
            <div className="mt-3 rounded-xl border border-border bg-background p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                Mensagem
              </p>
              <p className="text-sm leading-6 text-primary">
                {lead.message}
              </p>
            </div>
          )}
        </div>

        {/* STATUS + DATA */}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <StatusBadge status={lead.status} />

          <div className="text-xs text-secondary space-y-1">
            <p>
              Criado em{' '}
              {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
            </p>

            {lead.archivedAt && (
              <p>
                Arquivado em{' '}
                {new Date(lead.archivedAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-center">

        {/* STATUS SELECT */}
        <select
          value={lead.status}
          disabled={isBusy}
          onChange={(e) => onChangeStatus(lead.id, e.target.value as LeadStatus)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-primary outline-none transition focus:border-[var(--accent)] disabled:opacity-60"
        >
          {STATUS_OPTIONS.filter((o) => o.value !== 'ALL').map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* ARCHIVE */}
        <button
          type="button"
          disabled={isBusy || lead.status === 'ARQUIVADO'}
          onClick={() => onArchive(lead.id)}
          className="rounded-xl border border-border px-4 py-2 text-sm text-primary transition hover:bg-white/5 disabled:opacity-50"
        >
          {isBusy ? '...' : 'Arquivar'}
        </button>

        {/* DELETE */}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(lead.id)}
          className="rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          Excluir
        </button>
      </div>
    </article>
  )
}