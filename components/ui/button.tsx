import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn('px-4 py-2 rounded bg-accent text-bg-primary font-semibold disabled:opacity-50', className)}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
