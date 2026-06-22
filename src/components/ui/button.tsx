import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm',
        outline:
          'border border-border bg-card text-foreground hover:bg-background hover:border-accent/40 active:scale-[0.98]',
        ghost:
          'text-muted hover:text-foreground hover:bg-border/50 active:scale-[0.98]',
        destructive:
          'text-urgent hover:bg-urgent-light active:scale-[0.98]',
        nav: 'text-muted hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
        'nav-active':
          'bg-accent-light text-accent rounded-lg px-3 py-1.5 text-sm font-medium',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-7 px-3 text-xs',
        lg: 'h-10 px-6 text-sm',
        icon: 'h-8 w-8',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
