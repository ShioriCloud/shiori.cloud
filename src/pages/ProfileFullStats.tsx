import { ProfileFullStatsView } from '@/components/profile/ProfileFullStatsView'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { ProfileOverviewStripSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { mergeOwnProfileHeaderStats } from '@/lib/ownProfileStats'

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
        <ProfileFullStatsView
          model={{
            animeCount: enabled ? merged.animeCount : stats.animeCount,
            episodesWatched: enabled ? merged.episodesWatched : stats.episodesWatched,
            watchHours: enabled ? merged.watchHours : 0,
            averageRating: enabled ? merged.averageRating : stats.averageRating,
            ratingsCount: enabled ? merged.ratingsCount : 0,
            activeDays: enabled ? merged.activeDays : 0,
            topGenres: enabled ? merged.topGenres : [],
            byFormat: enabled ? merged.byFormat : [],
          }}
        />
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfileFullStats
