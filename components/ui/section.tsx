import { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

export function Section({ children, title, className }: { children: ReactNode; title?: string; className?: string }) {
  return (
    <section className={cn('py-6', className)}>
      {title && <h2 className="text-xl font-semibold mb-3">{title}</h2>}
      {children}
    </section>
  )
}

export default Section
