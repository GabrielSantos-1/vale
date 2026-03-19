import type { LeadFilterStatus } from './lead-types'
import { STATUS_OPTIONS } from './lead-ui'

type LeadsToolbarProps = {
  filterStatus: LeadFilterStatus
  onChangeFilter: (value: LeadFilterStatus) => void
  total: number
}

export default function LeadsToolbar({
  filterStatus,
  onChangeFilter,
  total,
}: LeadsToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Leads recebidos</h1>
        <p className="mt-1 text-sm text-secondary">
          {total} lead(s) exibido(s) no filtro atual
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="status-filter" className="text-sm text-secondary">
          Filtrar por status
        </label>

        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => onChangeFilter(e.target.value as LeadFilterStatus)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-primary outline-none transition focus:border-[var(--accent)]"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}