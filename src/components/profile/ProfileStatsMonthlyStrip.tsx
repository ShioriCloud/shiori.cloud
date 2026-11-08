import { BarChart3 } from 'lucide-react'
import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const MONTH_LABELS = ['خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان'] as const

/** فریم فیگما: ساعت تماشا در هر ماه — تا دادهٔ ماهانه از API نیاید، از ساعت کل تقریب می‌زنیم. */
export const ProfileStatsMonthlyStrip = ({
  watchHours,
  className,
}: {
  watchHours: number
  className?: string
}) => {
  const total = Math.max(0, Math.round(watchHours))
  if (total <= 0) return null

  const weights = MONTH_LABELS.map((_, i) => 0.55 + (i % 3) * 0.22 + (i === 4 ? 0.35 : 0))
  const sum = weights.reduce((a, b) => a + b, 0)
  const bars = weights.map((w) => Math.max(1, Math.round((w / sum) * total)))

  const maxBar = Math.max(...bars, 1)

  return (
    <section className={cn('mx-4 mt-4', className)}>
      <section className={profileHighlightSectionClass('primary')}>
        <div className={profileHighlightGlowClass('left', 'primary')} aria-hidden />
        <div className={cn(profileHighlightGlowClass('right', 'sky'), 'opacity-45')} aria-hidden />
        <div className="relative px-3.5 py-3.5 text-right" dir="rtl">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl',
                'border border-primary-400/25 bg-primary-400/15 text-primary-400'
              )}
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="text-sm font-semibold text-foreground">ساعت تماشا در هر ماه</h2>
          </div>
          <div className="flex items-end justify-between gap-1.5 pt-1">
            {bars.map((hours, i) => {
              const h = Math.max(12, Math.round((hours / maxBar) * 88))
              return (
                <div key={MONTH_LABELS[i]} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <span className="text-[9px] font-medium tabular-nums text-muted-foreground">
                    {toPersianDigits(hours)}
                  </span>
                  <div
                    className="w-full max-w-[2.25rem] rounded-t-md bg-gradient-to-t from-primary-500/90 to-primary-400/55"
                    style={{ height: `${h}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{MONTH_LABELS[i]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </section>
  )
}
