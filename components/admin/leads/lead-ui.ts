import type { LeadStatus, LeadFilterStatus } from './lead-types'

export const STATUS_OPTIONS: Array<{
  value: LeadFilterStatus
  label: string
}> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'NOVO', label: 'Novo' },
  { value: 'EM_ATENDIMENTO', label: 'Em atendimento' },
  { value: 'CONVERTIDO', label: 'Convertido' },
  { value: 'DESCARTADO', label: 'Descartado' },
  { value: 'ARQUIVADO', label: 'Arquivado' },
]

export function getStatusLabel(status: LeadStatus) {
  switch (status) {
    case 'NOVO':
      return 'Novo'
    case 'EM_ATENDIMENTO':
      return 'Em atendimento'
    case 'CONVERTIDO':
      return 'Convertido'
    case 'DESCARTADO':
      return 'Descartado'
    case 'ARQUIVADO':
      return 'Arquivado'
    default:
      return status
  }
}

export function getStatusBadgeClass(status: LeadStatus) {
  switch (status) {
    case 'NOVO':
      return 'border border-blue-400/20 bg-blue-500/10 text-blue-300'
    case 'EM_ATENDIMENTO':
      return 'border border-yellow-400/20 bg-yellow-500/10 text-yellow-300'
    case 'CONVERTIDO':
      return 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
    case 'DESCARTADO':
      return 'border border-red-400/20 bg-red-500/10 text-red-300'
    case 'ARQUIVADO':
      return 'border border-white/10 bg-white/5 text-secondary'
    default:
      return 'border border-border bg-surface text-primary'
  }
}