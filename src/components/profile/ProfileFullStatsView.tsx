import type { ReactNode } from 'react'
import { CalendarDays, Clapperboard, Clock3, ListVideo, PenLine, Star } from 'lucide-react'
import { ProfilePopularGenres } from '@/components/profile/ProfilePopularGenres'
import { formatLabel, FORMAT_ACCENT, sortFormats, type FormatBreakdownRow } from '@/components/profile/profileFormats'
import { profileStatsCardClass } from '@/components/profile/profileStatsCard'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import type { SocialProfileMe } from '@/services/socialProfile'

export type ProfileFullStatsModel = {
  animeCount: number
  episodesWatched: number
  watchHours: number
  averageRating: number | null
  ratingsCount: number
  activeDays: number
  topGenres: NonNullable<SocialProfileMe['top_genres']>
  byFormat: FormatBreakdownRow[]
}

const Metric = ({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode
  value: string
  label: string
  tone: string
}) => (
  <div className={cn(profileStatsCardClass(), '!p-3 flex items-center gap-2.5')}>
    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tone)}>
      {icon}
    </span>
    <div className="min-w-0 text-right">
      <p className="text-base font-bold tabular-nums leading-5 text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] leading-4 text-foreground/70">{label}</p>
    </div>
  </div>
)

export const ProfileFullStatsView = ({ model }: { model: ProfileFullStatsModel }) => {
  const avgRating =
    model.averageRating != null ? toPersianDigits(String(model.averageRating)) : '—'
  const formats = sortFormats(model.byFormat).filter((row) => row.count > 0)
  const maxFormat = Math.max(...formats.map((row) => row.count), 1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Metric
          icon={<Clapperboard className="size-4" aria-hidden />}
          value={toPersianDigits(model.animeCount)}
          label="انیمه"
          tone="bg-primary-500/15 text-primary-700 dark:text-primary-200"
        />
        <Metric
          icon={<Clock3 className="size-4" aria-hidden />}
          value={toPersianDigits(model.watchHours)}
          label="ساعت تماشا"
          tone="bg-sky-400/15 text-sky-700 dark:text-sky-200"
        />
        <Metric
          icon={<Star className="size-4 fill-current" aria-hidden />}
          value={avgRating}
          label="میانگین امتیاز"
          tone="bg-amber-400/15 text-amber-800 dark:text-amber-200"
        />
        <Metric
          icon={<CalendarDays className="size-4" aria-hidden />}
          value={toPersianDigits(model.activeDays)}
          label="روز فعال"
          tone="bg-emerald-400/15 text-emerald-800 dark:text-emerald-200"
        />
        <Metric
          icon={<ListVideo className="size-4" aria-hidden />}
          value={toPersianDigits(model.episodesWatched)}
          label="قسمت دیده‌شده"
          tone="bg-violet-400/15 text-violet-800 dark:text-violet-200"
        />
        <Metric
          icon={<PenLine className="size-4" aria-hidden />}
          value={toPersianDigits(model.ratingsCount)}
          label="نمره ثبت‌شده"
          tone="bg-rose-400/15 text-rose-800 dark:text-rose-200"
        />
      </div>

      <ProfilePopularGenres genres={model.topGenres} title="ژانرهای پرتکرار" animeCount={model.animeCount} />

      {formats.length > 0 ? (
        <section className={cn(profileStatsCardClass(), 'flex flex-col gap-3.5')}>
          <h2 className="text-[15.5px] font-bold text-foreground">بر اساس فرمت</h2>
          <div className="space-y-3">
            {formats.map((row) => {
              const width = Math.max(8, Math.round((row.count / maxFormat) * 100))
              return (
                <div key={row.format} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="text-foreground">{formatLabel(row.format)}</span>
                    <span className="tabular-nums text-foreground/70">
                      {toPersianDigits(row.count)} انیمه · {toPersianDigits(row.episodes_watched)} قسمت
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full', FORMAT_ACCENT[row.format] ?? 'bg-primary-400')}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
