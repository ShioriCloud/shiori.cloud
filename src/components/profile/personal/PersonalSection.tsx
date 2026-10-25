import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PersonalSectionProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  accent?: 'rose' | 'violet' | 'sky' | 'emerald' | 'amber'
}

const accentBar: Record<NonNullable<PersonalSectionProps['accent']>, string> = {
  rose: 'from-rose-400/80 via-rose-400/30 to-transparent',
  violet: 'from-violet-400/80 via-violet-400/30 to-transparent',
  sky: 'from-sky-400/80 via-sky-400/30 to-transparent',
  emerald: 'from-emerald-400/80 via-emerald-400/30 to-transparent',
  amber: 'from-amber-400/80 via-amber-400/30 to-transparent',
}

export const PersonalSection = ({
  title,
  subtitle,
  action,
  children,
  className,
  accent = 'violet',
}: PersonalSectionProps) => (
  <section className={cn('space-y-3', className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'mb-1.5 h-0.5 w-12 rounded-full bg-gradient-to-l',
            accentBar[accent]
          )}
          aria-hidden
        />
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
    {children}
  </section>
)
