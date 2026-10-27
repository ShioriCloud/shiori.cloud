import { ProfileOverviewStrip } from '@/components/profile/ProfileOverviewStrip'
import { ProfilePublicStatsExtras } from '@/components/profile/ProfilePublicStatsExtras'
import type { SocialProfileMe } from '@/services/socialProfile'
import type { FormatBreakdownRow } from '@/components/profile/profileFormats'

type ProfileStatsOverviewPanelProps = {
  variant: 'own' | 'public'
  overview: { watchHours: number; byFormat: FormatBreakdownRow[] }
  fullStatsTo?: string | null
  publicExtras?: {
    profileUserId: string
    translator?: SocialProfileMe['translator']
    displayName: string
    hideTranslatorDupes?: boolean
  }
}

export const ProfileStatsOverviewPanel = ({
  variant,
  overview,
  fullStatsTo,
  publicExtras,
}: ProfileStatsOverviewPanelProps) => (
  <div className="-mx-4 space-y-1 pb-2">
    <ProfileOverviewStrip
      data={overview}
      fullStatsTo={fullStatsTo ?? null}
      audience={variant}
    />
    {variant === 'public' && publicExtras ? (
      <ProfilePublicStatsExtras
        profileUserId={publicExtras.profileUserId}
        translator={publicExtras.translator}
        displayName={publicExtras.displayName}
        hideTranslatorDupes={publicExtras.hideTranslatorDupes}
      />
    ) : null}
  </div>
)
