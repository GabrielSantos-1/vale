type LeadsEmptyStateProps = {
  message?: string
}

export default function LeadsEmptyState({
  message = 'Nenhum lead encontrado.',
}: LeadsEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="text-lg text-secondary">📭</p>
      <p className="mt-2 text-sm text-secondary">{message}</p>
    </div>
  )
}