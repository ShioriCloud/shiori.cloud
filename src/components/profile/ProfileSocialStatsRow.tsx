import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PROFILE_PANEL_CLASS } from '@/components/profile/profileStatsCard'
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

const chipClass = cn(
  PROFILE_PANEL_CLASS,
  'flex min-w-0 flex-1 items-center justify-between gap-1 rounded-xl py-2.5 pl-2 pr-3',
  'active:opacity-90'
)

const MetricCard = ({ value, label, to }: Metric) => {
  const inner = (
    <>
      <div className="min-w-0 text-right">
        <p className="text-[17px] font-bold leading-6 tabular-nums text-foreground">{value}</p>
        <p className="text-[11.5px] leading-4 text-foreground/70">{label}</p>
      </div>
      {to ? <ChevronLeft className="size-4 shrink-0 opacity-35" aria-hidden /> : <span className="size-4" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={chipClass}>
        {inner}
      </Link>
    )
  }

  return <div className={chipClass}>{inner}</div>
}

export const ProfileSocialStatsRow = ({ metrics, className }: ProfileSocialStatsRowProps) => (
  <div className={cn('mx-4 mt-4 flex gap-2', className)}>
    {metrics.map((metric) => (
      <MetricCard key={metric.label} {...metric} />
    ))}
  </div>
)
