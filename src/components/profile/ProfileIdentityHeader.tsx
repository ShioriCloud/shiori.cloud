import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { Languages } from 'lucide-react'
import { ProfileHeroAvatar } from '@/components/profile/ProfileCircleAvatar'
import { cn } from '@/lib/utils'

type RoleBadge = { id: string; title: string }

type ProfileIdentityHeaderProps = {
  displayName: string
  avatarUrl: string | null
  initials: string
  memberSinceLabel?: string | null
  roleBadges?: RoleBadge[]
  translationsHref?: string | null
  translationsLabel?: string
  onAvatarError?: () => void
  className?: string
  /** Extra row under meta (e.g. follow button). */
  footer?: ReactNode
}

export const ProfileIdentityHeader = ({
  displayName,
  avatarUrl,
  initials,
  memberSinceLabel,
  roleBadges = [],
  translationsHref,
  translationsLabel = 'آثار ترجمه',
  onAvatarError,
  className,
  footer,
}: ProfileIdentityHeaderProps) => (
  <div className={cn('px-4', className)}>
    <div className="flex items-start gap-3.5">
      <ProfileHeroAvatar className="h-20 w-20 rounded-xl">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={onAvatarError}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-400/15">
            {initials ? (
              <span className="text-xl font-bold text-primary-400">{initials}</span>
            ) : (
              <UserIcon className="h-8 w-8 text-muted-foreground/50" />
            )}
          </div>
        )}
      </ProfileHeroAvatar>

      <div className="min-w-0 flex-1 pt-0.5 text-right">
        <h1 className="line-clamp-2 text-lg font-bold leading-snug text-foreground">
          {displayName}
        </h1>
        {memberSinceLabel ? (
          <p className="mt-1 text-xs text-muted-foreground">{memberSinceLabel}</p>
        ) : null}
        {roleBadges.length > 0 ? (
          <div className="mt-2 flex flex-wrap justify-end gap-1.5">
            {roleBadges.map((badge) => (
              <span
                key={badge.id}
                className="inline-flex items-center rounded-full border border-primary-400/30 bg-primary-400/10 px-2 py-0.5 text-[11px] font-medium text-primary-400"
              >
                {badge.title}
              </span>
            ))}
          </div>
        ) : null}
        {translationsHref ? (
          <Link
            to={translationsHref}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-300 active:opacity-80"
          >
            <Languages className="h-3.5 w-3.5" aria-hidden />
            {translationsLabel}
          </Link>
        ) : null}
      </div>
    </div>
    {footer ? <div className="mt-3">{footer}</div> : null}
  </div>
)
