import { profileStatsCardClass, ProfileSampleDataTag } from '@/components/profile/profileStatsCard'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type GenreRow = { slug: string; label: string; percent: number }

export const ProfilePopularGenres = ({
  genres,
  title = 'ژانرهای محبوب',
  className,
  animeCount,
  showSampleTag = true,
}: {
  genres: GenreRow[]
  title?: string
  className?: string
  /** برای نمایش تعداد تقریبی روی نوارها وقتی API فقط درصد می‌دهد. */
  animeCount?: number
  showSampleTag?: boolean
}) => {
  if (genres.length === 0) return null

  const top = genres.slice(0, 5)
  const maxPercent = Math.max(...top.map((g) => g.percent), 1)

  return (
    <section className={cn(profileStatsCardClass(), 'flex flex-col gap-3.5', className)} dir="rtl">
      <div className="flex items-center justify-between gap-2">
        {showSampleTag ? <ProfileSampleDataTag /> : <span aria-hidden />}
        <h2 className="text-[15.5px] font-bold text-foreground">{title}</h2>
      </div>
      <div className="space-y-2.5">
        {top.map((g) => {
          const width = Math.max(8, Math.round((g.percent / maxPercent) * 100))
          const isLeader = g.percent >= maxPercent
          const displayCount =
            animeCount && animeCount > 0
              ? Math.max(1, Math.round((g.percent / 100) * animeCount))
              : g.percent
          return (
            <div key={g.slug} className="flex items-center gap-2.5">
              <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-foreground">
                {toPersianDigits(displayCount)}
              </span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-white/[0.06]">
                <div
                  className={cn(
                    'ms-auto h-full rounded',
                    isLeader ? 'bg-primary-500' : 'bg-primary-500/45'
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="w-[4.5rem] shrink-0 text-right text-[12.5px] text-muted-foreground">
                {g.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
