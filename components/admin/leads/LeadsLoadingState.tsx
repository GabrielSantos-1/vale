export default function LeadsLoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-surface p-4"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="h-4 w-56 rounded bg-white/10" />
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-20 w-full rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}