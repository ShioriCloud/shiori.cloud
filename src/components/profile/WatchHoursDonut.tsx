import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const SEGMENT_COLORS = [
  'stroke-primary-400',
  'stroke-sky-400',
  'stroke-amber-400',
  'stroke-violet-400',
  'stroke-emerald-400',
  'stroke-rose-400',
  'stroke-muted-foreground/50',
]

type Segment = {
  key: string
  value: number
}

type WatchHoursDonutProps = {
  hours: number
  segments: Segment[]
  className?: string
}

/** SVG donut — total watch hours in center; ring segments by format weight. */
export const WatchHoursDonut = ({ hours, segments, className }: WatchHoursDonutProps) => {
  const size = 112
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0)

  let offset = 0
  const arcs =
    total > 0
      ? segments
          .filter((seg) => seg.value > 0)
          .map((seg, i) => {
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
                className={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
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
            className="stroke-muted/60"
            strokeDasharray={c}
          />,
        ]

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {arcs}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-lg font-bold tabular-nums leading-none text-foreground">
          {toPersianDigits(hours)}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">ساعت</p>
      </div>
    </div>
  )
}
