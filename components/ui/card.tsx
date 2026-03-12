import { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-md p-4 bg-surface shadow-sm border border-border', className)}>{children}</div>
}

export default Card
