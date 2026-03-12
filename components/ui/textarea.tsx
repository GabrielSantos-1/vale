import { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils/cn'

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('w-full px-3 py-2 rounded-md bg-background border border-border text-primary', (props as any).className)} {...props} />
}

export default Textarea
