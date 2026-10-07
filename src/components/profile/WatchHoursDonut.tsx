import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import { FORMAT_STROKE } from './profileFormats'

type Segment = {
  key: string
  value: number
}

type WatchHoursDonutProps = {
  hours: number
  segments: Segment[]
  className?: string
}

/** SVG donut — total watch hours in center; ring segments by format watch-time weight. */
export const WatchHoursDonut = ({ hours, segments, className }: WatchHoursDonutProps) => {
  const size = 128
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0)

  let offset = 0
  const arcs =
    total > 0
      ? segments
          .filter((seg) => seg.value > 0)
          .map((seg) => {
            const len = (seg.value / total) * c
            const dash = `${len} ${c - len}`
            const el = (
              <circle
                key={seg.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="butt"
                className={FORMAT_STROKE[seg.key] ?? 'stroke-muted-foreground/50'}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            )
            offset += len
            return el
          })
      : [
          <circle
            key="empty"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className="stroke-muted/50"
            strokeDasharray={c}
          />,
        ]

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <div
        className="pointer-events-none absolute inset-3 rounded-full bg-primary-400/10 blur-md"
        aria-hidden
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative drop-shadow-sm"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted/35"
        />
        {arcs}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold tabular-nums leading-none tracking-tight text-foreground">
          {toPersianDigits(hours)}
        </p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">ساعت تماشا</p>
      </div>
    </div>
  )
}
