import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border border-border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        outline: 'bg-transparent text-foreground',
        success:
          'border-emerald-500/35 bg-emerald-500/15 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200',
        premium:
          'border-amber-500/40 bg-amber-500/15 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
        admin:
          'border-violet-500/35 bg-violet-500/15 text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
