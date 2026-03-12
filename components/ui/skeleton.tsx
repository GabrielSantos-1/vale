import { cn } from '../../lib/utils/cn'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={cn('animate-pulse bg-border rounded', className)} />
}

export default Skeleton
