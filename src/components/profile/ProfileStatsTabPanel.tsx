import { ProfileFavoritesPreview } from '@/components/profile/ProfileFavoritesPreview'
import { ProfileOverviewStrip } from '@/components/profile/ProfileOverviewStrip'
import { ProfilePublicStatsExtras } from '@/components/profile/ProfilePublicStatsExtras'
import { ProfileRecentEpisodesRail } from '@/components/profile/ProfileRecentEpisodesRail'
import { ProfileSocialWatchedRail } from '@/components/profile/ProfileSocialWatchedRail'
import { ProfileWatchingRail } from '@/components/profile/ProfileWatchingRail'
import type { SocialProfileMe } from '@/services/socialProfile'
import type { FormatBreakdownRow } from '@/components/profile/profileFormats'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileStatsTabPanelProps = {
  variant: 'own' | 'public'
  overview: { watchHours: number; byFormat: FormatBreakdownRow[] }
  fullStatsTo?: string | null
  watchedItems?: WatchedItem[]
  favoriteListItems?: WatchedItem[]
  profileBase?: string
  recentRestoreKey?: string
  watchVisible?: boolean
  publicExtras?: {
    profileUserId: string
    translator?: SocialProfileMe['translator']
    displayName: string
  }
}

const filterCurrentlyWatching = (items: WatchedItem[]): WatchedItem[] =>
  items.filter((item) => {
    const watched = item.episodes_watched ?? 0
    const total = item.episodes_total ?? 0
    if (watched <= 0) return false
    if (total <= 0) return true
    return watched < total
  })

export const ProfileStatsTabPanel = ({
  variant,
  overview,
  fullStatsTo,
  watchedItems = [],
  favoriteListItems = [],
  profileBase = '/profile',
  recentRestoreKey = 'profile-stats-recent',
  watchVisible = true,
  publicExtras,
}: ProfileStatsTabPanelProps) => {
  if (variant === 'public' && !watchVisible) {
    return (
      <p className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
        لیست تماشا خصوصی است.
      </p>
    )
  }

  const watchingFromApi = filterCurrentlyWatching(watchedItems)

  return (
    <div className="-mx-4 space-y-1 pb-2">
      <ProfileOverviewStrip data={overview} fullStatsTo={fullStatsTo ?? null} />

      <ProfileRecentEpisodesRail items={watchedItems} restoreKey={recentRestoreKey} />

      {variant === 'own' ? (
        <ProfileWatchingRail />
      ) : (
        <ProfileSocialWatchedRail items={watchingFromApi} title="در حال تماشا" />
      )}

      <ProfileFavoritesPreview
        items={favoriteListItems}
        total={favoriteListItems.length}
        profileBase={profileBase}
        className="mt-2"
      />

      {variant === 'public' && publicExtras ? (
        <ProfilePublicStatsExtras
          profileUserId={publicExtras.profileUserId}
          translator={publicExtras.translator}
          displayName={publicExtras.displayName}
        />
      ) : null}
    </div>
  )
}
