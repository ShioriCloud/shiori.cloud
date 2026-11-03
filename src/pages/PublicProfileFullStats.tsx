import { Navigate, useParams } from 'react-router-dom'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ProfileFullStatsView } from '@/components/profile/ProfileFullStatsView'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { ProfileOverviewStripSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileUser } from '@/hooks/useSocialProfile'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'

const PublicProfileFullStats = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const telegramUserId = rawId?.trim() ?? ''
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const canFetch = isReady && (inTelegram || Boolean(user)) && telegramUserId.length > 0
  const { data, isLoading, isError } = useSocialProfileUser(telegramUserId, canFetch)

  if (!isReady) {
    return (
      <ProfilePersonalSubpageLayout title="آمار کامل" contentClassName="space-y-6">
        <ProfileOverviewStripSkeleton className="!mx-0 !mt-0" />
      </ProfilePersonalSubpageLayout>
    )
  }

  if (!inTelegram && !user) {
    return (
      <div className="px-4 pb-24 pt-10">
        <ProfileAuthPanel login={login} register={register} layout="page" />
      </div>
    )
  }

  if (!telegramUserId) {
    return <Navigate to="/feed" replace />
  }

  if (isLoading && !data) {
    return (
      <ProfilePersonalSubpageLayout title="آمار کامل" contentClassName="space-y-6">
        <ProfileOverviewStripSkeleton className="!mx-0 !mt-0" />
      </ProfilePersonalSubpageLayout>
    )
  }

  if (isError || !data || data.enabled === false) {
    return (
      <ProfilePersonalSubpageLayout title="آمار کامل">
        <MyListCompactCard className="p-4 text-center text-sm text-muted-foreground">
          آمار این پروفایل در دسترس نیست.
        </MyListCompactCard>
      </ProfilePersonalSubpageLayout>
    )
  }

  if (data.privacy?.watch_activity_hidden) {
    return (
      <ProfilePersonalSubpageLayout title="آمار کامل">
        <MyListCompactCard className="p-4 text-center text-sm text-muted-foreground">
          آمار تماشای این کاربر خصوصی است.
        </MyListCompactCard>
      </ProfilePersonalSubpageLayout>
    )
  }

  const summary = data.summary
  const displayName = data.profile?.display_name?.trim() || 'کاربر'

  return (
    <ProfilePersonalSubpageLayout
      title="آمار کامل"
      description={displayName}
      contentClassName="space-y-6"
    >
      <ProfileFullStatsView
        model={{
          animeCount: summary?.anime_count ?? 0,
          episodesWatched: summary?.episodes_watched ?? 0,
          watchHours: Math.round(summary?.estimated_watch_hours ?? 0),
          averageRating: summary?.average_rating ?? null,
          ratingsCount: summary?.ratings_count ?? 0,
          activeDays: summary?.active_days ?? 0,
          topGenres: data.top_genres ?? [],
          byFormat: data.by_format ?? [],
          watchedItems: data.watched?.items ?? [],
        }}
        emptyWatchedLabel="هنوز انیمه‌ای برای نمایش نیست."
      />
    </ProfilePersonalSubpageLayout>
  )
}

export default PublicProfileFullStats
