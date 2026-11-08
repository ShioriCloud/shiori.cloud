import type { ReactNode } from 'react'
import { ProfileFavoritesPreview } from '@/components/profile/ProfileFavoritesPreview'
import { ProfileOverviewStrip } from '@/components/profile/ProfileOverviewStrip'
import { ProfilePublicStatsExtras } from '@/components/profile/ProfilePublicStatsExtras'
import { ProfileOverviewStripSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import type { ProfileStatsSubTabId } from '@/components/profile/profileSubTabs'
import type { SocialProfileMe } from '@/services/socialProfile'
import type { FormatBreakdownRow } from '@/components/profile/profileFormats'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileStatsTabPanelProps = {
  variant: 'own' | 'public'
  subTab: ProfileStatsSubTabId
  overview: { watchHours: number; byFormat: FormatBreakdownRow[] }
  fullStatsTo?: string | null
  watchVisible?: boolean
  badgesSection?: ReactNode
  isLoading?: boolean
  favoriteListItems?: WatchedItem[]
  favoriteOrderIds?: Array<string | number>
  profileBase?: string
  favoritesLoading?: boolean
  publicExtras?: {
    profileUserId: string
    translator?: SocialProfileMe['translator']
    hideTranslatorDupes?: boolean
  }
}

export const ProfileStatsTabPanel = ({
  variant,
  subTab,
  overview,
  fullStatsTo,
  watchVisible = true,
  badgesSection,
  isLoading = false,
  favoriteListItems = [],
  favoriteOrderIds,
  profileBase = '/profile',
  favoritesLoading = false,
  publicExtras,
}: ProfileStatsTabPanelProps) => {
  if (variant === 'public' && !watchVisible && !badgesSection && !publicExtras) {
    return (
      <p className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
        آمار این پروفایل در دسترس نیست.
      </p>
    )
  }

  if (subTab === 'favorites') {
    return (
      <div className="-mx-4 pb-2 pt-1">
        <ProfileFavoritesPreview
          items={favoriteListItems}
          total={favoriteListItems.length}
          orderedIds={favoriteOrderIds}
          profileBase={profileBase}
          className="mt-0"
          isLoading={favoritesLoading}
        />
      </div>
    )
  }

  return (
    <div className="-mx-4 space-y-1 pb-2">
      {isLoading ? (
        <ProfileOverviewStripSkeleton />
      ) : (
        <ProfileOverviewStrip
          data={overview}
          fullStatsTo={fullStatsTo ?? null}
          audience={variant}
        />
      )}

      {badgesSection ? <div className="mx-4 mt-4">{badgesSection}</div> : null}

      {variant === 'public' && publicExtras ? (
        <ProfilePublicStatsExtras
          profileUserId={publicExtras.profileUserId}
          translator={publicExtras.translator}
          hideTranslatorDupes={publicExtras.hideTranslatorDupes}
        />
      ) : null}
    </div>
  )
}
