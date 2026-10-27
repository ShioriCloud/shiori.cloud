import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Metric = {
  value: string
  label: string
  to?: string
}

type ProfileInlineMetricsProps = {
  metrics: Metric[]
  className?: string
}

export const ProfileInlineMetrics = ({ metrics, className }: ProfileInlineMetricsProps) => {
  if (metrics.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline gap-x-1 gap-y-1 text-sm text-muted-foreground',
        className
      )}
    >
      {metrics.map((m, i) => {
        const node = (
          <span className="inline-flex items-baseline gap-1">
            <span className="font-semibold tabular-nums text-foreground">{m.value}</span>
            <span>{m.label}</span>
          </span>
        )
        return (
          <span key={`${m.label}-${i}`} className="inline-flex items-baseline gap-1">
            {i > 0 ? <span className="mx-0.5 text-border" aria-hidden>·</span> : null}
            {m.to ? (
              <Link to={m.to} className="active:opacity-70 transition-opacity">
                {node}
              </Link>
            ) : (
              node
            )}
          </span>
        )
      })}
    </div>
  )
}
