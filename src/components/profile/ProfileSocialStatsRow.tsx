import { Link } from 'react-router-dom'
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

const MetricCell = ({
  value,
  label,
  to,
  dividerAfter,
}: Metric & { dividerAfter?: boolean }) => {
  const body = (
    <>
      <p className="text-sm font-bold tabular-nums leading-none text-foreground">{value}</p>
      <p className="mt-1 text-[9px] leading-3 text-muted-foreground">{label}</p>
    </>
  )

  const cellClass = cn(
    'flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2.5 text-center',
    dividerAfter && 'border-e border-border/45',
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
        {metrics.map((metric, index) => (
          <MetricCell
            key={metric.label}
            {...metric}
            dividerAfter={index < metrics.length - 1}
          />
        ))}
      </div>
    </section>
  </div>
)
