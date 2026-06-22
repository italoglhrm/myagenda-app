import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        urgent: 'bg-urgent-light text-urgent border-urgent-border',
        high: 'bg-high-light text-high border-high-border',
        normal: 'bg-normal-light text-normal border-normal-border',
        low: 'bg-low-light text-low border-low-border',
        outline: 'bg-transparent border-border text-muted',
        muted: 'bg-border/60 text-muted border-transparent',
      },
    },
    defaultVariants: {
      variant: 'muted',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
