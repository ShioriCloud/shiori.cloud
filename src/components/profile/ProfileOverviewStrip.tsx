import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import {
  FORMAT_ACCENT,
  formatLabel,
  sortFormats,
  type FormatBreakdownRow,
} from './profileFormats'
import { profileStatsCardClass } from '@/components/profile/profileStatsCard'
import { FormatWatchDonut } from './FormatWatchDonut'

type OverviewModel = {
  watchHours: number
  byFormat: FormatBreakdownRow[]
}

export const ProfileOverviewStrip = ({
  data,
  audience = 'own',
  sectionTitle = 'مرور تماشا',
  animeCount,
  className,
}: {
  data: OverviewModel
  audience?: 'own' | 'public'
  sectionTitle?: string
  animeCount?: number | null
  className?: string
}) => {
  const formats = sortFormats(data.byFormat).filter((row) => row.count > 0).slice(0, 4)
  const hours = Math.max(0, Math.round(data.watchHours))
  const countLabel =
    animeCount != null && animeCount > 0
      ? `${toPersianDigits(animeCount)} انیمه`
      : null

  return (
    <section className={cn(profileStatsCardClass(), 'flex flex-col gap-3.5', className)}>
      <div className="flex min-w-0 items-center gap-1.5">
        <h2 className="text-[15.5px] font-bold leading-snug text-foreground">{sectionTitle}</h2>
        {countLabel ? (
          <span className="truncate text-xs text-muted-foreground">{countLabel}</span>
        ) : null}
      </div>

      <div className="flex min-w-0 items-center gap-5">
        <FormatWatchDonut hours={hours} byFormat={data.byFormat} />

        <div className="min-w-0 flex-1 space-y-2.5">
          {formats.length > 0 ? (
            formats.map((row) => (
              <div key={row.format} className="flex w-full min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      'inline-block h-2.5 w-2.5 shrink-0 rounded-full',
                      FORMAT_ACCENT[row.format] ?? 'bg-muted-foreground/50'
                    )}
                    aria-hidden
                  />
                  <span className="truncate text-[13px] text-muted-foreground">
                    {formatLabel(row.format)}
                  </span>
                </div>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {toPersianDigits(row.count)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs leading-6 text-muted-foreground">
              {audience === 'public'
                ? 'هنوز آمار تماشایی برای نمایش نیست.'
                : 'با تماشای انیمه، خلاصه ساعت و فرمت اینجا شکل می‌گیرد.'}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
