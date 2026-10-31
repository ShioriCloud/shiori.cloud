import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ProfileFullStatsView } from '@/components/profile/ProfileFullStatsView'
import { ProfileStatCell } from '@/components/profile/ProfileStatCell'
import { RouteFallback } from '@/components/RouteFallback'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { mergeOwnProfileHeaderStats } from '@/lib/ownProfileStats'
import { toPersianDigits } from '@/lib/persianDigits'

const ProfileFullStats = () => {
  const { user, isReady } = useAppAuth()
  const { stats } = useUserAnimeList()
  const { data: social, isLoading } = useSocialProfileMe(Boolean(user))

  const merged = mergeOwnProfileHeaderStats(social, stats, isLoading)

  if (!isReady || isLoading) return <RouteFallback />

  const enabled = merged.socialEnabled || stats.animeCount > 0

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="space-y-6 px-4 pt-4">
        <h1 className="text-lg font-semibold">آمار کامل</h1>
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
              هنوز آمار تفصیلی برای نمایش نیست. با تماشا و امتیاز دادن این بخش پر می‌شود.
            </MyListCompactCard>
          </>
        ) : (
          <ProfileFullStatsView
            model={{
              animeCount: merged.animeCount,
              episodesWatched: merged.episodesWatched,
              watchHours: merged.watchHours,
              averageRating: merged.averageRating,
              ratingsCount: merged.ratingsCount,
              activeDays: merged.activeDays,
              topGenres: merged.topGenres,
              byFormat: merged.byFormat,
              watchedItems: merged.watchedItems,
            }}
            emptyWatchedLabel="هنوز انیمه‌ای در لیست تماشا نداری."
          />
        )}
      </div>
    </div>
  )
}

export default ProfileFullStats
