import { Link } from 'react-router-dom'
import { Languages } from 'lucide-react'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

type ProfilePublicStatsExtrasProps = {
  profileUserId: string
  translator?: SocialProfileMe['translator']
  /** When translations rail is already on the profile hero, hide duplicate links here. */
  hideTranslatorDupes?: boolean
}

export const ProfilePublicStatsExtras = ({
  profileUserId,
  translator,
  hideTranslatorDupes = false,
}: ProfilePublicStatsExtrasProps) => {
  const showTranslatorLinks = Boolean(translator) && !hideTranslatorDupes
  const translationsPath = showTranslatorLinks
    ? `/u/${encodeURIComponent(profileUserId)}/translations`
    : null

  if (!translationsPath) return null

  const rowClass =
    'flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/40 active:bg-muted/55'

  return (
    <div className="mt-6 space-y-6">
      <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>
        <Link to={translationsPath} className={rowClass}>
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
              'border-sky-400/30 bg-sky-400/10 text-sky-600 dark:text-sky-300'
            )}
          >
            <Languages className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-right">
            <span className="block text-sm font-medium text-foreground">آثار ترجمه</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {translator?.name ?? 'مشاهده همه'}
            </span>
          </span>
        </Link>
      </div>
    </div>
  )
}
