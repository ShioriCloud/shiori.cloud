import type { ReactNode } from 'react'
import { ProfileOverviewStrip } from '@/components/profile/ProfileOverviewStrip'
import { ProfilePublicStatsExtras } from '@/components/profile/ProfilePublicStatsExtras'
import type { SocialProfileMe } from '@/services/socialProfile'
import type { FormatBreakdownRow } from '@/components/profile/profileFormats'

type ProfileStatsTabPanelProps = {
  variant: 'own' | 'public'
  overview: { watchHours: number; byFormat: FormatBreakdownRow[] }
  fullStatsTo?: string | null
  watchVisible?: boolean
  badgesSection?: ReactNode
  publicExtras?: {
    profileUserId: string
    translator?: SocialProfileMe['translator']
    hideTranslatorDupes?: boolean
  }
}

export const ProfileStatsTabPanel = ({
  variant,
  overview,
  fullStatsTo,
  watchVisible = true,
  badgesSection,
  publicExtras,
}: ProfileStatsTabPanelProps) => {
  if (variant === 'public' && !watchVisible && !badgesSection && !publicExtras) {
    return (
      <p className="rounded-2xl border border-border/50 bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
        آمار این پروفایل در دسترس نیست.
      </p>
    )
  }

  return (
    <div className="-mx-4 space-y-1 pb-2">
      <ProfileOverviewStrip
        data={overview}
        fullStatsTo={fullStatsTo ?? null}
        audience={variant}
      />

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
