import { useId, useMemo } from 'react'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import {
  FORMAT_STROKE,
  normalizeOverviewFormat,
  sortFormats,
  type FormatBreakdownRow,
} from './profileFormats'

const STROKE_COLORS: Record<string, string> = {
  TV: '#8b5cf6',
  DONGHUA: '#38bdf8',
  MOVIE: '#f472b6',
  SPECIAL: '#fbbf24',
  MUSIC: '#fb7185',
  OTHER: '#6e6e78',
}

type FormatWatchDonutProps = {
  hours: number
  byFormat: FormatBreakdownRow[]
  className?: string
}

/** Multi-segment ring — segment size by anime count per format (Figma مرور تماشا). */
export const FormatWatchDonut = ({ hours, byFormat, className }: FormatWatchDonutProps) => {
  const gradId = useId().replace(/:/g, '')
  const size = 140
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  const segments = useMemo(() => {
    const rows = sortFormats(byFormat).filter((row) => row.count > 0).slice(0, 6)
    const total = rows.reduce((sum, row) => sum + row.count, 0)
    if (total <= 0) return []
    return rows.map((row) => {
      const format = normalizeOverviewFormat(row.format)
      const frac = row.count / total
      return {
        key: format,
        length: frac * c,
        color: STROKE_COLORS[format] ?? STROKE_COLORS.OTHER,
        strokeClass: FORMAT_STROKE[format],
      }
    })
  }, [byFormat, c])

  const safeHours = Math.max(0, Math.round(hours))

  let rotation = -90
  const arcs = segments.map((seg) => {
    const dash = `${seg.length} ${c - seg.length}`
    const el = (
      <circle
        key={seg.key}
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="butt"
        stroke={seg.color}
        strokeDasharray={dash}
        transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
      />
    )
    rotation += (seg.length / c) * 360
    return el
  })

  return (
    <div
      className={cn('relative aspect-square w-[140px] max-w-[46%] shrink', className)}
      role="img"
      aria-label={`${toPersianDigits(safeHours)} ساعت تماشا`}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`watch-ring-bg-${gradId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={`url(#watch-ring-bg-${gradId})`}
          className="opacity-80"
        />
        {arcs.length > 0 ? arcs : null}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[28px] font-bold leading-none tabular-nums text-foreground">
          {toPersianDigits(safeHours)}
        </p>
        <p className="mt-1 text-[11.5px] text-muted-foreground">ساعت تماشا</p>
      </div>
    </div>
  )
}
