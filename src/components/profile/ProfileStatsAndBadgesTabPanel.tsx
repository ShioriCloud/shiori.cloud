import { ProfileBadgeProgressTeaser } from '@/components/profile/ProfileBadgeProgressTeaser'
import { ProfileStatsOverviewPanel } from '@/components/profile/ProfileStatsOverviewPanel'
import { ProfileTopGenresStrip } from '@/components/profile/ProfileTopGenresStrip'
import type { SocialProfileMe } from '@/services/socialProfile'
import type { FormatBreakdownRow } from '@/components/profile/profileFormats'

type ProfileStatsAndBadgesTabPanelProps = {
  variant: 'own' | 'public'
  overview: { watchHours: number; byFormat: FormatBreakdownRow[] }
  topGenres?: Array<{ slug: string; label: string; percent: number }>
  fullStatsTo?: string | null
  showBadgeTeaser?: boolean
  publicExtras?: {
    profileUserId: string
    translator?: SocialProfileMe['translator']
    displayName: string
    hideTranslatorDupes?: boolean
  }
}

export const ProfileStatsAndBadgesTabPanel = ({
  variant,
  overview,
  topGenres = [],
  fullStatsTo,
  showBadgeTeaser = false,
  publicExtras,
}: ProfileStatsAndBadgesTabPanelProps) => (
  <div className="pb-2">
    <ProfileStatsOverviewPanel
      variant={variant}
      overview={overview}
      fullStatsTo={fullStatsTo ?? null}
      publicExtras={publicExtras}
    />
    <ProfileTopGenresStrip genres={topGenres} />
    {variant === 'own' && showBadgeTeaser ? (
      <ProfileBadgeProgressTeaser enabled={showBadgeTeaser} />
    ) : null}
  </div>
)
