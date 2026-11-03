import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ProfileFullStatsView } from '@/components/profile/ProfileFullStatsView'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { ProfileOverviewStripSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import { ProfileStatCell } from '@/components/profile/ProfileStatCell'
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

  if (!isReady || isLoading) {
    return (
      <ProfilePersonalSubpageLayout title="آمار کامل" contentClassName="space-y-6">
        <ProfileOverviewStripSkeleton className="!mx-0 !mt-0" />
      </ProfilePersonalSubpageLayout>
    )
  }

  const enabled = merged.socialEnabled || stats.animeCount > 0

  return (
    <ProfilePersonalSubpageLayout title="آمار کامل" contentClassName="space-y-6">
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
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfileFullStats
