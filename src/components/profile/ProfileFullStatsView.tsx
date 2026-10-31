import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ProfileStatCell } from '@/components/profile/ProfileStatCell'
import { formatLabel } from '@/components/profile/profileFormats'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
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
  byFormat: NonNullable<SocialProfileMe['by_format']>
  watchedItems: NonNullable<SocialProfileMe['watched']>['items']
}

type ProfileFullStatsViewProps = {
  model: ProfileFullStatsModel
  emptyWatchedLabel: string
}

export const ProfileFullStatsView = ({
  model,
  emptyWatchedLabel,
}: ProfileFullStatsViewProps) => {
  const avgRating =
    model.averageRating != null ? toPersianDigits(String(model.averageRating)) : '—'

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: toPersianDigits(model.animeCount), l: 'انیمه' },
          { v: toPersianDigits(model.episodesWatched), l: 'قسمت دیده' },
          { v: avgRating, l: 'میانگین امتیاز' },
          { v: toPersianDigits(model.ratingsCount), l: 'نمره ثبت‌شده' },
          { v: toPersianDigits(model.activeDays), l: 'روز فعال' },
          { v: toPersianDigits(model.watchHours), l: 'ساعت تماشا' },
        ].map((cell) => (
          <ProfileStatCell key={cell.l} value={cell.v} label={cell.l} />
        ))}
      </div>

      {model.topGenres.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold">ژانرهای پرتکرار</h2>
          <MyListCompactCard className="divide-y divide-border/40">
            {model.topGenres.map((g) => (
              <div
                key={g.slug}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <span className="text-sm text-foreground">{g.label}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {toPersianDigits(g.percent)}٪
                </span>
              </div>
            ))}
          </MyListCompactCard>
        </div>
      ) : null}

      {model.byFormat.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold">بر اساس فرمت</h2>
          <MyListCompactCard className="divide-y divide-border/40">
            {model.byFormat.map((row) => (
              <div
                key={row.format}
                className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
              >
                <span>{formatLabel(row.format)}</span>
                <span className="text-muted-foreground tabular-nums">
                  {toPersianDigits(row.count)} انیمه ·{' '}
                  {toPersianDigits(row.episodes_watched)} قسمت
                </span>
              </div>
            ))}
          </MyListCompactCard>
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold">دیده‌شده‌ها</h2>
        {model.watchedItems.length === 0 ? (
          <MyListCompactCard className="p-4 text-center text-sm text-muted-foreground">
            {emptyWatchedLabel}
          </MyListCompactCard>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {model.watchedItems.map((item) => {
              const routeRef = {
                id: item.anime_id,
                slug: item.slug,
                title: item.title,
              }
              const progress =
                item.episodes_total != null && item.episodes_total > 0
                  ? `${toPersianDigits(item.episodes_watched)}/${toPersianDigits(item.episodes_total)}`
                  : toPersianDigits(item.episodes_watched)

              return (
                <AnimePrefetchLink
                  key={item.anime_id}
                  animeId={animePublicSegment(routeRef)}
                  to={animeDetailPath(routeRef)}
                  className="group block active:scale-[0.98] transition-transform"
                  aria-label={`مشاهده ${item.title}`}
                >
                  <div className="media-card-skeuo rounded-xl">
                    <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      {item.user_rating != null ? (
                        <span
                          className={cn(
                            'absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5',
                            'text-[10px] font-semibold text-white tabular-nums'
                          )}
                        >
                          {toPersianDigits(item.user_rating)}
                        </span>
                      ) : null}
                      <div className="absolute bottom-0 left-0 right-0 p-2 pt-8">
                        <BidiText
                          as="p"
                          className="text-[10px] font-semibold text-white line-clamp-2 text-left"
                        >
                          {item.title}
                        </BidiText>
                        <p className="mt-0.5 text-[9px] text-white/80 tabular-nums text-left">
                          {progress} قسمت
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimePrefetchLink>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
