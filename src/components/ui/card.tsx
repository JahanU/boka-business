import { type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/utils'

type CardProps = ComponentPropsWithoutRef<'div'>

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-indigo-900/40',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
