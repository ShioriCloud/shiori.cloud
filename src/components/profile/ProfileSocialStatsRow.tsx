import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import { cn } from '@/lib/utils'

type Metric = {
  value: string
  label: string
  to?: string
}

type ProfileSocialStatsRowProps = {
  metrics: [Metric, Metric, Metric]
  className?: string
}

const MetricCell = ({ value, label, to }: Metric) => {
  const body = (
    <>
      <p className="text-sm font-bold tabular-nums leading-none text-foreground">{value}</p>
      <p className="mt-1 text-[9px] leading-3 text-muted-foreground">{label}</p>
    </>
  )

  const cellClass = cn(
    'flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2.5 text-center',
    to && 'active:opacity-80 transition-opacity'
  )

  return to ? (
    <Link to={to} className={cellClass}>
      {body}
    </Link>
  ) : (
    <div className={cellClass}>{body}</div>
  )
}

export const ProfileSocialStatsRow = ({ metrics, className }: ProfileSocialStatsRowProps) => (
  <div className={cn('mx-4 mt-3', className)}>
    <section className={profileHighlightSectionClass('primary')}>
      <div className={profileHighlightGlowClass('left', 'primary')} aria-hidden />
      <div className={profileHighlightGlowClass('right', 'sky')} aria-hidden />

      <div className="relative flex items-stretch">
        <div
          className={cn(
            'flex w-9 shrink-0 items-center justify-center border-e border-border/40',
            'text-primary-400'
          )}
          aria-hidden
        >
          <Users className="h-4 w-4 opacity-80" />
        </div>

        <div className="flex min-w-0 flex-1 divide-x divide-border/40">
          {metrics.map((metric) => (
            <MetricCell key={metric.label} {...metric} />
          ))}
        </div>
      </div>
    </section>
  </div>
)
