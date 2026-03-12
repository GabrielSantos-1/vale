import { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-block px-2 py-1 rounded-full text-sm bg-border text-secondary', className)}>{children}</span>
}

export default Badge
