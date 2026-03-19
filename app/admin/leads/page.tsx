'use client'

import { useEffect, useState } from 'react'
import LeadCard from '../../../components/admin/leads/LeadCard'
import LeadsEmptyState from '../../../components/admin/leads/LeadsEmptyState'
import LeadsLoadingState from '../../../components/admin/leads/LeadsLoadingState'
import LeadsToolbar from '../../../components/admin/leads/LeadsToolbar'
import type {
  Lead,
  LeadFilterStatus,
  LeadStatus,
} from '../../../components/admin/leads/lead-types'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<LeadFilterStatus>('ALL')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadLeads = async (selectedStatus: LeadFilterStatus = filterStatus) => {
    try {
      setLoading(true)

      const query =
        selectedStatus === 'ALL'
          ? '/api/admin/leads?status=ALL'
          : `/api/admin/leads?status=${selectedStatus}`

      const res = await fetch(query, {
        credentials: 'include',
        cache: 'no-store',
      })

      const data = await res.json()

      if (data.success) {
        setLeads(data.data)
      } else {
        console.error(data.error)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    try {
      setActionLoadingId(id)

      const res = await fetch(`/api/admin/leads/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.error || 'Erro ao atualizar status')
        return
      }

      await loadLeads()
    } catch (err) {
      console.error(err)
      alert('Erro ao atualizar status')
    } finally {
      setActionLoadingId(null)
    }
  }

  const archiveLead = async (id: string) => {
    try {
      setActionLoadingId(id)

      const res = await fetch(`/api/admin/leads/${id}/archive`, {
        method: 'PATCH',
        credentials: 'include',
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.error || 'Erro ao arquivar lead')
        return
      }

      await loadLeads()
    } catch (err) {
      console.error(err)
      alert('Erro ao arquivar lead')
    } finally {
      setActionLoadingId(null)
    }
  }

  const deleteLead = async (id: string) => {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este lead? A exclusão será lógica e ele sairá da listagem.'
    )

    if (!confirmed) return

    try {
      setActionLoadingId(id)

      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.error || 'Erro ao excluir lead')
        return
      }

      await loadLeads()
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir lead')
    } finally {
      setActionLoadingId(null)
    }
  }

  useEffect(() => {
    loadLeads(filterStatus)
  }, [filterStatus])

  return (
    <main className="p-6 md:p-8">
      <LeadsToolbar
        filterStatus={filterStatus}
        onChangeFilter={setFilterStatus}
        total={leads.length}
      />

      {loading ? (
        <LeadsLoadingState />
      ) : leads.length === 0 ? (
        <LeadsEmptyState />
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              isBusy={actionLoadingId === lead.id}
              onChangeStatus={updateLeadStatus}
              onArchive={archiveLead}
              onDelete={deleteLead}
            />
          ))}
        </div>
      )}
    </main>
  )
}