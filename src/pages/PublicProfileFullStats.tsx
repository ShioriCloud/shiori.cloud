import { Navigate, useParams } from 'react-router-dom'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ProfileFullStatsView } from '@/components/profile/ProfileFullStatsView'
import { RouteFallback } from '@/components/RouteFallback'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileUser } from '@/hooks/useSocialProfile'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'

const PublicProfileFullStats = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const telegramUserId = rawId?.trim() ?? ''
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const canFetch = isReady && (inTelegram || Boolean(user)) && telegramUserId.length > 0
  const { data, isLoading, isError } = useSocialProfileUser(telegramUserId, canFetch)

  if (!isReady) return <RouteFallback />

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

  if (isLoading && !data) return <RouteFallback />

  if (isError || !data || data.enabled === false) {
    return (
      <div className="bg-background px-4 pb-24 pt-4 text-foreground">
        <h1 className="mb-4 text-lg font-semibold">آمار کامل</h1>
        <MyListCompactCard className="p-4 text-center text-sm text-muted-foreground">
          آمار این پروفایل در دسترس نیست.
        </MyListCompactCard>
      </div>
    )
  }

  if (data.privacy?.watch_activity_hidden) {
    return (
      <div className="bg-background px-4 pb-24 pt-4 text-foreground">
        <h1 className="mb-4 text-lg font-semibold">آمار کامل</h1>
        <MyListCompactCard className="p-4 text-center text-sm text-muted-foreground">
          آمار تماشای این کاربر خصوصی است.
        </MyListCompactCard>
      </div>
    )
  }

  const summary = data.summary
  const displayName = data.profile?.display_name?.trim() || 'کاربر'

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="space-y-6 px-4 pt-4">
        <div>
          <h1 className="text-lg font-semibold">آمار کامل</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{displayName}</p>
        </div>
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
      </div>
    </div>
  )
}

export default PublicProfileFullStats
