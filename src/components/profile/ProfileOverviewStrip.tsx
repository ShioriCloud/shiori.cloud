import { Link } from 'react-router-dom'
import { ChartPie, ChevronLeft } from 'lucide-react'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import {
  FORMAT_ACCENT,
  formatLabel,
  minutesForFormatRow,
  sortFormats,
  type FormatBreakdownRow,
} from './profileFormats'
import { WatchHoursDonut } from './WatchHoursDonut'

type OverviewModel = {
  watchHours: number
  byFormat: FormatBreakdownRow[]
}

export const ProfileOverviewStrip = ({ data }: { data: OverviewModel }) => {
  const formats = sortFormats(data.byFormat).slice(0, 6)
  const hours = Math.max(0, Math.round(data.watchHours))

  const segments = formats.map((row) => ({
    key: row.format,
    value: minutesForFormatRow(row) || row.count,
  }))

  return (
    <div className="mx-4 mt-5">
      <section
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/50',
          'bg-gradient-to-br from-primary-400/[0.08] via-background to-sky-400/[0.06]',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
        )}
      >
        <div
          className="pointer-events-none absolute -left-10 top-0 h-36 w-36 rounded-full bg-primary-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 bottom-0 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl"
          aria-hidden
        />

        <div className="relative p-4">
          <div className="mb-4 flex items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl',
                'border border-primary-400/25 bg-primary-400/15 text-primary-400'
              )}
            >
              <ChartPie className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="text-sm font-semibold text-foreground">خلاصه آمار تماشا</h2>
          </div>

          <div className="flex items-center gap-4">
            <WatchHoursDonut hours={hours} segments={segments} />

            <div className="min-w-0 flex-1">
              {formats.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {formats.map((row) => (
                    <div
                      key={row.format}
                      className={cn(
                        'rounded-xl border border-border/40 bg-background/55 px-2.5 py-2.5',
                        'backdrop-blur-[2px] text-center'
                      )}
                    >
                      <p className="text-xl font-bold tabular-nums leading-none text-foreground">
                        {toPersianDigits(row.count)}
                      </p>
                      <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] leading-4 text-muted-foreground">
                        <span
                          className={cn(
                            'inline-block h-1.5 w-1.5 rounded-full',
                            FORMAT_ACCENT[row.format] ?? 'bg-muted-foreground/50'
                          )}
                          aria-hidden
                        />
                        {formatLabel(row.format)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-6 text-muted-foreground">
                  هنوز انیمه‌ای در لیست تماشا نداری.
                </p>
              )}
            </div>
          </div>

          <Link
            to="/profile/stats"
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-1 rounded-xl',
              'border border-primary-400/25 bg-primary-400/10 px-3 py-2.5',
              'text-sm font-semibold text-primary-700 dark:text-primary-200',
              'transition-colors hover:bg-primary-400/15 active:bg-primary-400/20'
            )}
          >
            مشاهده آمار کامل
            <ChevronLeft className="h-4 w-4 opacity-80" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  )
}
