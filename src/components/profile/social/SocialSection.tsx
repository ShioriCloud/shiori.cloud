import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SocialSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export const SocialSection = ({
  title,
  description,
  action,
  children,
  className,
}: SocialSectionProps) => (
  <section className={cn('space-y-2.5', className)}>
    <div className="flex items-start justify-between gap-3 px-0.5">
      <div className="min-w-0 flex-1 text-right">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    {children}
  </section>
)
