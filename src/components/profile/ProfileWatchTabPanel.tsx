import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileFavoritesPreview } from '@/components/profile/ProfileFavoritesPreview'
import { ProfileRecentEpisodesRail } from '@/components/profile/ProfileRecentEpisodesRail'
import { ProfileSocialWatchedRail } from '@/components/profile/ProfileSocialWatchedRail'
import { ProfileWatchingRail } from '@/components/profile/ProfileWatchingRail'
import type { SocialProfileMe } from '@/services/socialProfile'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileWatchTabPanelProps = {
  variant: 'own' | 'public'
  watchedItems?: WatchedItem[]
  favoriteListItems?: WatchedItem[]
  favoriteOrderIds?: Array<string | number>
  profileBase?: string
  recentRestoreKey?: string
  watchVisible?: boolean
}

const filterCurrentlyWatching = (items: WatchedItem[]): WatchedItem[] =>
  items.filter((item) => {
    const watched = item.episodes_watched ?? 0
    const total = item.episodes_total ?? 0
    if (watched <= 0) return false
    if (total <= 0) return true
    return watched < total
  })

export const ProfileWatchTabPanel = ({
  variant,
  watchedItems = [],
  favoriteListItems = [],
  favoriteOrderIds,
  profileBase = '/profile',
  recentRestoreKey = 'profile-watch-recent',
  watchVisible = true,
}: ProfileWatchTabPanelProps) => {
  if (variant === 'public' && !watchVisible) {
    return (
      <p className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
        لیست تماشا خصوصی است.
      </p>
    )
  }

  const watchingFromApi = filterCurrentlyWatching(watchedItems)
  const recentCount = watchedItems.filter((item) => (item.episodes_watched ?? 0) > 0).length
  const publicWatchEmpty =
    variant === 'public' &&
    recentCount === 0 &&
    watchingFromApi.length === 0 &&
    favoriteListItems.length === 0

  if (publicWatchEmpty) {
    return (
      <ExploreEmptyState
        title="هنوز فعالیت تماشایی نیست"
        subtitle="وقتی این کاربر انیمه تماشا کند یا علاقه‌مندی عمومی داشته باشد، اینجا می‌بینی."
      />
    )
  }

  return (
    <div className="-mx-4 space-y-1 pb-2">
      <ProfileRecentEpisodesRail items={watchedItems} restoreKey={recentRestoreKey} />

      {variant === 'own' ? (
        <ProfileWatchingRail />
      ) : (
        <ProfileSocialWatchedRail items={watchingFromApi} title="در حال تماشا" />
      )}

      <ProfileFavoritesPreview
        items={favoriteListItems}
        total={favoriteListItems.length}
        orderedIds={favoriteOrderIds}
        profileBase={profileBase}
        className="mt-2"
      />
    </div>
  )
}
