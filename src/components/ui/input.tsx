import { forwardRef, type ComponentProps } from 'react'
import { cn } from '../../lib/utils'

type InputProps = ComponentProps<'input'>

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-sm text-slate-50 shadow-inner outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/60',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'
