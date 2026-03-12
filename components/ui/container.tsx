import { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('max-w-6xl mx-auto px-4', className)}>{children}</div>
}

export default Container
