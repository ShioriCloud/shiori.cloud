import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import {
  formatLabel,
  sortFormats,
  type FormatBreakdownRow,
} from './profileFormats'
import { WatchHoursDonut } from './WatchHoursDonut'

type OverviewModel = {
  watchHours: number
  watchHoursHint?: string | null
  byFormat: FormatBreakdownRow[]
}

export const ProfileOverviewStrip = ({ data }: { data: OverviewModel }) => {
  const formats = sortFormats(data.byFormat).slice(0, 6)
  const hours = Math.max(0, Math.round(data.watchHours))

  const segments = formats.map((row) => ({
    key: row.format,
    // Weight ring by estimated minutes (episodes × 24) so format share matches watch time.
    value: Math.max(row.episodes_watched, 0) * 24 || row.count,
  }))

  return (
    <div className="mx-4 mt-5">
      <MyListCompactCard className="overflow-hidden p-3">
        <div className="flex items-center gap-3">
          <WatchHoursDonut hours={hours} segments={segments} />
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground">بر اساس فرمت</p>
            {formats.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {formats.map((row) => (
                  <div
                    key={row.format}
                    className={cn(
                      'rounded-lg border border-border/40 bg-muted/25 px-2 py-1.5',
                      'text-center'
                    )}
                  >
                    <p className="text-[10px] leading-4 text-muted-foreground">
                      {formatLabel(row.format)}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                      {toPersianDigits(row.count)}
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

        {data.watchHoursHint ? (
          <p className="mt-2.5 text-center text-[10px] text-muted-foreground">
            {data.watchHoursHint}
          </p>
        ) : null}

        <Link
          to="/profile/stats"
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-border/50',
            'bg-muted/30 px-3 py-2.5 text-sm font-medium text-foreground',
            'transition-colors hover:bg-muted/50 active:bg-muted/60'
          )}
        >
          مشاهده آمار کامل
          <ChevronLeft className="h-4 w-4 text-muted-foreground" aria-hidden />
        </Link>
      </MyListCompactCard>
    </div>
  )
}
