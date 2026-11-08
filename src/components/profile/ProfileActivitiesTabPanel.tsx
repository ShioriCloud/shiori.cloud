import { ProfileProfileCommentsSubTab } from '@/components/profile/ProfileProfileCommentsSubTab'
import { ProfilePlaylistsTabPanel } from '@/components/profile/ProfilePlaylistsTabPanel'
import { ProfileWatchHistoryTimeline } from '@/components/profile/ProfileWatchHistoryTimeline'
import type { ProfileActivitiesSubTabId } from '@/components/profile/profileSubTabs'
import type { SocialProfileMe } from '@/services/socialProfile'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileActivitiesTabPanelProps = {
  variant: 'own' | 'public'
  subTab: ProfileActivitiesSubTabId
  profileUserId: string
  profileBase: string
  watchedItems: WatchedItem[]
  watchLoading?: boolean
  watchVisible?: boolean
}

export const ProfileActivitiesTabPanel = ({
  variant,
  subTab,
  profileUserId,
  profileBase,
  watchedItems,
  watchLoading = false,
  watchVisible = true,
}: ProfileActivitiesTabPanelProps) => {
  if (subTab === 'playlists') {
    return (
      <ProfilePlaylistsTabPanel
        variant={variant}
        profileUserId={profileUserId}
        profileBase={profileBase}
      />
    )
  }

  if (subTab === 'comments') {
    return <ProfileProfileCommentsSubTab variant={variant} profileUserId={profileUserId} />
  }

  if (variant === 'public' && !watchVisible) {
    return (
      <p className="mx-4 mt-2 rounded-2xl border border-border/50 bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
        لیست تماشا خصوصی است.
      </p>
    )
  }

  return (
    <ProfileWatchHistoryTimeline
      items={watchedItems}
      isLoading={watchLoading}
      variant={variant}
    />
  )
}
