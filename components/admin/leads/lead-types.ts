export type LeadStatus =
  | 'NOVO'
  | 'EM_ATENDIMENTO'
  | 'CONVERTIDO'
  | 'DESCARTADO'
  | 'ARQUIVADO'

export type LeadFilterStatus = 'ALL' | LeadStatus

export type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  district: string | null
  cep: string | null
  message: string | null
  source: string | null
  status: LeadStatus
  archivedAt: string | null
  deletedAt: string | null
  createdAt: string
  plan?: {
    id: string
    name: string
  } | null
}