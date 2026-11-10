import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ProfileFavoritesPreview } from '@/components/profile/ProfileFavoritesPreview'
import {
  ProfileFullStatsView,
  type ProfileFullStatsModel,
} from '@/components/profile/ProfileFullStatsView'
import { ProfileOverviewStrip } from '@/components/profile/ProfileOverviewStrip'
import { ProfilePopularGenres } from '@/components/profile/ProfilePopularGenres'
import { ProfilePublicStatsExtras } from '@/components/profile/ProfilePublicStatsExtras'
import { ProfileOverviewStripSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import { ProfileStatsMonthlyStrip } from '@/components/profile/ProfileStatsMonthlyStrip'
import type { ProfileStatsSubTabId } from '@/components/profile/profileSubTabs'
import type { SocialProfileMe } from '@/services/socialProfile'
import type { FormatBreakdownRow } from '@/components/profile/profileFormats'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileStatsTabPanelProps = {
  variant: 'own' | 'public'
  subTab: ProfileStatsSubTabId
  overview: { watchHours: number; byFormat: FormatBreakdownRow[] }
  fullStats?: ProfileFullStatsModel | null
  watchVisible?: boolean
  badgesSection?: ReactNode
  isLoading?: boolean
  watchAnimeCount?: number | null
  favoriteListItems?: WatchedItem[]
  favoriteOrderIds?: Array<string | number>
  favoritesTotal?: number
  profileBase?: string
  favoritesLoading?: boolean
  topGenres?: NonNullable<SocialProfileMe['top_genres']>
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
  fullStats = null,
  watchVisible = true,
  badgesSection,
  isLoading = false,
  watchAnimeCount,
  favoriteListItems = [],
  favoriteOrderIds,
  profileBase = '/profile',
  favoritesLoading = false,
  favoritesTotal,
  topGenres = [],
  publicExtras,
}: ProfileStatsTabPanelProps) => {
  const [fullOpen, setFullOpen] = useState(false)
  const expandAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fullOpen) return
    const node = expandAnchorRef.current
    if (!node) return
    const frame = window.requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [fullOpen])

  if (variant === 'public' && !watchVisible && !badgesSection && !publicExtras) {
    return (
      <p className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
        آمار این پروفایل در دسترس نیست.
      </p>
    )
  }

  if (subTab === 'favorites') {
    const favTotal = favoritesTotal ?? favoriteListItems.length
    return (
      <div className="flex min-w-0 flex-col gap-7 overflow-x-hidden px-4 pb-8 pt-5">
        <ProfileFavoritesPreview
          items={favoriteListItems}
          total={favTotal}
          orderedIds={favoriteOrderIds}
          profileBase={profileBase}
          isLoading={favoritesLoading}
          gridVariant="profile"
        />
        <ProfilePopularGenres genres={topGenres} animeCount={watchAnimeCount ?? undefined} />
      </div>
    )
  }

  const canExpandFull = watchVisible && Boolean(fullStats)

  return (
    <div className="flex min-w-0 flex-col gap-7 overflow-x-hidden px-4 pb-8 pt-5">
      {isLoading ? (
        <ProfileOverviewStripSkeleton />
      ) : (
        <>
          <ProfileOverviewStrip
            data={overview}
            audience={variant}
            animeCount={watchAnimeCount}
          />
          {watchVisible ? (
            <ProfileStatsMonthlyStrip watchHours={overview.watchHours} />
          ) : null}

          {canExpandFull && !fullOpen ? (
            <button
              type="button"
              onClick={() => setFullOpen(true)}
              className="inline-flex items-center justify-center gap-1 self-center rounded-full border border-border/80 bg-card px-4 py-2 text-sm font-medium text-foreground active:opacity-80"
            >
              نمایش آمار کامل
              <ChevronDown className="size-4 opacity-70" aria-hidden />
            </button>
          ) : null}
        </>
      )}

      {canExpandFull && fullOpen && fullStats ? (
        <div ref={expandAnchorRef} className="flex scroll-mt-24 flex-col gap-7">
          <ProfileFullStatsView model={fullStats} />
          <button
            type="button"
            onClick={() => setFullOpen(false)}
            className="inline-flex items-center justify-center gap-1 self-center rounded-full border border-border/80 bg-card px-4 py-2 text-sm font-medium text-foreground active:opacity-80"
          >
            نمایش خلاصه‌ی آمار
            <ChevronUp className="size-4 opacity-70" aria-hidden />
          </button>
        </div>
      ) : null}

      {badgesSection ? <div className="mt-1">{badgesSection}</div> : null}

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
