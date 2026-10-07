import { useId } from 'react'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type WatchHoursDonutProps = {
  hours: number
  className?: string
}

/** Ceiling for the progress ring: 100 until surpassed, then next 100-block. */
export const watchHoursChartMax = (hours: number): number => {
  const h = Math.max(0, hours)
  if (h <= 100) return 100
  return Math.ceil(h / 100) * 100
}

/**
 * Single-progress donut — filled arc vs dynamic max (100 → 200 → …),
 * Shiori primary gradient on the filled stroke.
 */
export const WatchHoursDonut = ({ hours, className }: WatchHoursDonutProps) => {
  const gradId = useId().replace(/:/g, '')
  const size = 128
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const safeHours = Math.max(0, hours)
  const maxHours = watchHoursChartMax(safeHours)
  const ratio = maxHours > 0 ? Math.min(1, safeHours / maxHours) : 0
  const filled = ratio * c
  const dash = `${filled} ${c - filled}`

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${toPersianDigits(safeHours)} ساعت از ${toPersianDigits(maxHours)}`}
    >
      <div
        className="pointer-events-none absolute inset-3 rounded-full bg-primary-400/15 blur-md"
        aria-hidden
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative drop-shadow-sm"
        aria-hidden
      >
        <defs>
          <linearGradient id={`watch-hours-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="45%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted/45 dark:stroke-muted/55"
        />
        {filled > 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={`url(#watch-hours-${gradId})`}
            strokeDasharray={dash}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold tabular-nums leading-none tracking-tight text-foreground">
          {toPersianDigits(safeHours)}
        </p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">ساعت تماشا</p>
      </div>
    </div>
  )
}
