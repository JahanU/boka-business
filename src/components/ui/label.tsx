import { type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/utils'

type LabelProps = ComponentPropsWithoutRef<'label'>

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label className={cn('text-sm font-medium text-slate-200', className)} {...props}>
      {children}
    </label>
  )
}
