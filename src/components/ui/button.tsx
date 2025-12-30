import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ComponentProps, type ElementRef } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-500 text-white hover:bg-indigo-400',
        secondary: 'bg-slate-800 text-slate-50 hover:bg-slate-700',
        ghost: 'text-slate-200 hover:bg-slate-800',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export const Button = forwardRef<ElementRef<'button'> | ElementRef<'span'>, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = (asChild ? 'span' : 'button') as const
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    )
  },
)

Button.displayName = 'Button'
