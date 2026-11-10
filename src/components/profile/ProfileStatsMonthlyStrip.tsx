import { profileStatsCardClass } from '@/components/profile/profileStatsCard'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const jalaliMonthLabel = (monthsAgo: number): string => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    month: 'long',
  }).format(d)
}

/**
 * Six-month watch-hours strip.
 * Until the API exposes a real monthly series, distribute total hours across
 * recent months with a fixed shape so the section stays useful visually.
 */
export const ProfileStatsMonthlyStrip = ({
  watchHours,
  className,
}: {
  watchHours: number
  className?: string
}) => {
  const total = Math.max(0, Math.round(watchHours))
  if (total <= 0) return null

  const monthLabels = Array.from({ length: 6 }, (_, i) => jalaliMonthLabel(i))
  const weights = [0.62, 0.88, 1, 0.82, 0.7, 0.55]
  const sum = weights.reduce((a, b) => a + b, 0)
  const bars = weights.map((w) => Math.max(1, Math.round((w / sum) * total)))
  const maxBar = Math.max(...bars, 1)

  return (
    <section className={cn(profileStatsCardClass(), 'flex flex-col gap-3.5', className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-foreground">ساعت تماشا در ماه‌های اخیر</h2>
        <p className="text-[11px] leading-4 text-muted-foreground">
          برآورد تقریبی از مجموع ساعت تماشا — آمار ماه‌به‌ماه دقیق هنوز آماده نیست.
        </p>
      </div>
      <div dir="ltr" className="flex h-[150px] min-w-0 items-end gap-2.5">
        {bars.map((hours, i) => {
          const isLatest = i === 0
          const barPct = Math.max(28, Math.round((hours / maxBar) * 100))
          return (
            <div key={`${monthLabels[i]}-${i}`} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  'text-[11px] tabular-nums',
                  isLatest ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {toPersianDigits(hours)}
              </span>
              <div className="flex h-24 w-full items-end">
                <div
                  className={cn(
                    'w-full rounded-t-md',
                    isLatest ? 'bg-primary-500' : 'bg-primary-500/45'
                  )}
                  style={{ height: `${barPct}%` }}
                />
              </div>
              <span className="max-w-full truncate text-[11px] text-muted-foreground">
                {monthLabels[i]}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
