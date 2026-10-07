import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ProfileStatCell } from '@/components/profile/ProfileStatCell'
import { formatLabel } from '@/components/profile/profileFormats'
import { RouteFallback } from '@/components/RouteFallback'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

const ProfileFullStats = () => {
  const { user, isReady } = useAppAuth()
  const { stats } = useUserAnimeList()
  const { data: social, isLoading } = useSocialProfileMe(Boolean(user))

  if (!isReady || isLoading) return <RouteFallback />

  const enabled = social?.enabled === true && social.summary

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            پروفایل
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">آمار کامل</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="space-y-6 px-4 pt-4">
        {!enabled ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <ProfileStatCell
                value={toPersianDigits(stats.animeCount)}
                label="انیمه در لیست"
              />
              <ProfileStatCell
                value={toPersianDigits(stats.episodesWatched)}
                label="قسمت دیده"
              />
              <ProfileStatCell
                value={
                  stats.averageRating != null
                    ? toPersianDigits(stats.averageRating.toFixed(1))
                    : '—'
                }
                label="میانگین امتیاز"
              />
            </div>
            <MyListCompactCard className="p-4 text-center text-sm leading-7 text-muted-foreground">
              آمار تفصیلی و دیده‌شده‌ها به‌زودی برای همه فعال می‌شود.
            </MyListCompactCard>
          </>
        ) : (
          <>
            {(() => {
              const summary = social.summary!
              const topGenres = social.top_genres ?? []
              const byFormat = social.by_format ?? []
              const watchedItems = social.watched?.items ?? []
              const avgRating =
                summary.average_rating != null
                  ? toPersianDigits(String(summary.average_rating))
                  : '—'

              return (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: toPersianDigits(summary.anime_count), l: 'انیمه' },
                      {
                        v: toPersianDigits(summary.episodes_watched),
                        l: 'قسمت دیده',
                      },
                      { v: avgRating, l: 'میانگین امتیاز' },
                      {
                        v: toPersianDigits(summary.ratings_count),
                        l: 'نمره ثبت‌شده',
                      },
                      { v: toPersianDigits(summary.active_days), l: 'روز فعال' },
                      {
                        v: toPersianDigits(summary.estimated_watch_hours),
                        l: 'ساعت تماشا',
                      },
                    ].map((cell) => (
                      <ProfileStatCell key={cell.l} value={cell.v} label={cell.l} />
                    ))}
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground">
                    {summary.estimated_watch_label}
                  </p>

                  {topGenres.length > 0 ? (
                    <div>
                      <h2 className="mb-3 text-sm font-semibold">ژانرهای پرتکرار</h2>
                      <MyListCompactCard className="divide-y divide-border/40">
                        {topGenres.map((g) => (
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

                  {byFormat.length > 0 ? (
                    <div>
                      <h2 className="mb-3 text-sm font-semibold">بر اساس فرمت</h2>
                      <MyListCompactCard className="divide-y divide-border/40">
                        {byFormat.map((row) => (
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
                    {watchedItems.length === 0 ? (
                      <MyListCompactCard className="p-4 text-center text-sm text-muted-foreground">
                        هنوز انیمه‌ای در لیست تماشا نداری.
                      </MyListCompactCard>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {watchedItems.map((item) => {
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
            })()}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfileFullStats
