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
  const inner = (
  <>
    <p className="text-lg font-bold tabular-nums leading-none tracking-tight text-foreground">{value}</p>
    <p className="mt-1.5 text-[10px] font-medium leading-tight text-muted-foreground">{label}</p>
  </>
  )

  const cellClass = cn(
    'flex min-w-0 flex-1 flex-col items-center justify-center px-2 py-3.5 text-center',
    dividerAfter && 'border-s border-border/50',
    to && 'transition-opacity active:opacity-75'
  )

  return to ? (
    <Link to={to} className={cellClass}>
      {inner}
    </Link>
  ) : (
    <div className={cellClass}>{inner}</div>
  )
}

export const ProfileSocialStatsRow = ({ metrics, className }: ProfileSocialStatsRowProps) => (
  <div className={cn('mx-4 mt-3', className)}>
    <section className={profileHighlightSectionClass('primary')}>
      <div className={profileHighlightGlowClass('left', 'primary')} aria-hidden />
      <div className={profileHighlightGlowClass('right', 'sky')} aria-hidden />

      <div className="relative flex items-stretch" dir="rtl">
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
