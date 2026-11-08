import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
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

const MetricCard = ({ value, label, to }: Metric) => {
  const inner = (
    <div className="relative px-3 py-3.5 text-center">
      {to ? (
        <ChevronLeft
          className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
          aria-hidden
        />
      ) : null}
      <p className="text-lg font-bold tabular-nums leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-[10px] font-medium leading-tight text-muted-foreground">{label}</p>
    </div>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          profileHighlightSectionClass('primary'),
          'block flex-1 active:opacity-85 transition-opacity'
        )}
      >
        <div className={profileHighlightGlowClass('left', 'primary')} aria-hidden />
        <div className={cn(profileHighlightGlowClass('right', 'sky'), 'opacity-60')} aria-hidden />
        <div className="relative">{inner}</div>
      </Link>
    )
  }

  return (
    <div className={cn(profileHighlightSectionClass('primary'), 'flex-1')}>
      <div className={profileHighlightGlowClass('left', 'primary')} aria-hidden />
      <div className={cn(profileHighlightGlowClass('right', 'sky'), 'opacity-60')} aria-hidden />
      <div className="relative">{inner}</div>
    </div>
  )
}

export const ProfileSocialStatsRow = ({ metrics, className }: ProfileSocialStatsRowProps) => (
  <div className={cn('mx-4 mt-3 flex gap-2', className)} dir="rtl">
    {metrics.map((metric) => (
      <MetricCard key={metric.label} {...metric} />
    ))}
  </div>
)
