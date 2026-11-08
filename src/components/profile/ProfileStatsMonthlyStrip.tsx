import { profileStatsCardClass } from '@/components/profile/profileStatsCard'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

/** شش ماه اخیر — جدیدترین سمت راست (شروع ردیف در صفحهٔ راست‌به‌چپ). */
const MONTH_LABELS = ['آبان', 'مهر', 'شهریور', 'مرداد', 'تیر', 'خرداد'] as const

/** تا دادهٔ ماهانه از API نیاید، از ساعت کل تقریب می‌زنیم. */
export const ProfileStatsMonthlyStrip = ({
  watchHours,
  className,
}: {
  watchHours: number
  className?: string
}) => {
  const total = Math.max(0, Math.round(watchHours))
  if (total <= 0) return null

  const weights = [0.62, 0.88, 1, 0.82, 0.7, 0.55]
  const sum = weights.reduce((a, b) => a + b, 0)
  const bars = weights.map((w) => Math.max(1, Math.round((w / sum) * total)))
  const maxBar = Math.max(...bars, 1)
  const chartHeight = 150

  return (
    <section className={cn(profileStatsCardClass(), 'flex flex-col gap-3.5', className)}>
      <h2 className="text-sm font-bold text-foreground">ساعت تماشا در هر ماه</h2>
      <div className="flex h-[150px] items-end gap-2.5">
        {bars.map((hours, i) => {
          const h = Math.max(24, Math.round((hours / maxBar) * (chartHeight - 36)))
          const isLatest = i === 0
          return (
            <div key={MONTH_LABELS[i]} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  'text-[11px] tabular-nums',
                  isLatest ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {toPersianDigits(hours)}
              </span>
              <div
                className={cn(
                  'w-full rounded-t-md',
                  isLatest ? 'bg-primary-500' : 'bg-primary-500/45'
                )}
                style={{ height: `${h}px` }}
              />
              <span className="text-[11px] text-muted-foreground">{MONTH_LABELS[i]}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
