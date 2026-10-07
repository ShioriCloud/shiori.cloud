import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { ChevronRight } from 'lucide-react'
import AnimePrefetchLink from '../components/AnimePrefetchLink'
import { BidiText } from '../components/BidiText'
import { RouteFallback } from '@/components/RouteFallback'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

type TabId = 'stats' | 'feed'

const FORMAT_LABELS: Record<string, string> = {
  TV: 'سریال',
  MOVIE: 'فیلم',
  OVA: 'OVA',
  ONA: 'ONA',
  SPECIAL: 'ویژه',
  MUSIC: 'موزیک',
  OTHER: 'سایر',
}

const formatLabel = (raw: string) => FORMAT_LABELS[raw] ?? raw

const SocialProfile = () => {
  const { data, isLoading, isError } = useSocialProfileMe(true)
  const [tab, setTab] = useState<TabId>('stats')

  const enabled = data?.enabled === true

  const memberSinceLabel = useMemo(() => {
    const iso = data?.profile?.member_since
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return '—'
    }
  }, [data?.profile?.member_since])

  if (isLoading) return <RouteFallback />

  if (!enabled) {
    return <Navigate to="/profile" replace />
  }

  if (isError || !data?.profile || !data.summary) {
    return (
      <div className="px-4 py-8 pb-24 text-center text-sm text-muted-foreground">
        بارگذاری پروفایل ناموفق بود.
      </div>
    )
  }

  const { profile, summary, top_genres = [], by_format = [], badges = [], watched } = data
  const watchedItems = watched?.items ?? []

  const avgRating =
    summary.average_rating != null
      ? toPersianDigits(String(summary.average_rating))
      : '—'

  return (
    <div className="pb-24">
      <div className="px-4 pt-3">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
          بازگشت به پروفایل
        </Link>
      </div>

      <div className="relative mt-2">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="relative z-10 flex flex-col items-center px-4 pt-6">
          <div className="media-card-skeuo h-24 w-24 rounded-2xl">
            <div className="media-card-skeuo-face overflow-hidden rounded-2xl bg-muted">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <UserIcon className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
          <h1 className="mt-3 text-center text-lg font-bold text-foreground">
            {profile.display_name}
          </h1>
          {profile.username ? (
            <p className="mt-0.5 text-sm text-muted-foreground" dir="ltr">
              @{profile.username}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            عضو از {memberSinceLabel}
          </p>

          <div className="mt-4 flex w-full max-w-xs justify-center gap-8 text-center">
            <div>
              <p className="text-base font-bold tabular-nums">
                {toPersianDigits(profile.followers_count)}
              </p>
              <p className="text-[11px] text-muted-foreground">دنبال‌کننده</p>
            </div>
            <div>
              <p className="text-base font-bold tabular-nums">
                {toPersianDigits(profile.following_count)}
              </p>
              <p className="text-[11px] text-muted-foreground">دنبال‌شونده</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-6 flex rounded-xl border border-border/50 bg-muted/20 p-1">
        {(['stats', 'feed'] as TabId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
            onClick={() => setTab(id)}
          >
            {id === 'stats' ? 'آمار' : 'فید'}
          </button>
        ))}
      </div>

      {tab === 'feed' ? (
        <div className="mx-4 mt-6">
          <MyListCompactCard className="p-4 text-center text-sm leading-7 text-muted-foreground">
            فید عمومی و دنبال‌کردن به‌زودی اضافه می‌شود.
          </MyListCompactCard>
        </div>
      ) : (
        <>
          <div className="mx-4 mt-6 grid grid-cols-3 gap-2">
            {[
              { v: toPersianDigits(summary.anime_count), l: 'انیمه' },
              { v: toPersianDigits(summary.episodes_watched), l: 'قسمت دیده' },
              { v: avgRating, l: 'میانگین امتیاز' },
              { v: toPersianDigits(summary.ratings_count), l: 'نمره ثبت‌شده' },
              { v: toPersianDigits(summary.active_days), l: 'روز فعال' },
              {
                v: toPersianDigits(summary.estimated_watch_hours),
                l: 'ساعت تماشا',
              },
            ].map((cell) => (
              <div
                key={cell.l}
                className="surface-skeuo rounded-lg px-2 py-3 text-center"
              >
                <p className="text-base font-bold tabular-nums">{cell.v}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                  {cell.l}
                </p>
              </div>
            ))}
          </div>
          <p className="mx-4 mt-2 text-center text-[10px] text-muted-foreground">
            {summary.estimated_watch_label}
          </p>

          {top_genres.length > 0 ? (
            <div className="mx-4 mt-6">
              <h2 className="mb-3 text-sm font-semibold">ژانرهای پرتکرار</h2>
              <MyListCompactCard className="divide-y divide-border/40">
                {top_genres.map((g) => (
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

          {by_format.length > 0 ? (
            <div className="mx-4 mt-6">
              <h2 className="mb-3 text-sm font-semibold">بر اساس فرمت</h2>
              <MyListCompactCard className="divide-y divide-border/40">
                {by_format.map((row) => (
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

          {badges.length > 0 ? (
            <div className="mx-4 mt-6">
              <h2 className="mb-3 text-sm font-semibold">نشان‌ها</h2>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span
                    key={b.id}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium',
                      b.is_new
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/50 bg-muted/30 text-foreground'
                    )}
                  >
                    {b.title}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      <div className="mx-4 mt-8">
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
                          className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums"
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
    </div>
  )
}

export default SocialProfile
