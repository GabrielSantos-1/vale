import type { LeadStatus } from './lead-types'
import { getStatusBadgeClass, getStatusLabel } from './lead-ui'

type StatusBadgeProps = {
  status: LeadStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}