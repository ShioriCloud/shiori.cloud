import type { ReactNode } from 'react'
import { UserIcon } from 'hugeicons-react'

export const getProfileInitials = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return 'ک'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`
  }
  return trimmed.charAt(0)
}

type RoleBadge = { id: string; title: string }

type ProfileHeroHeaderProps = {
  displayName: string
  initials: string
  avatarUrl?: string | null
  memberSinceLabel?: string | null
  subtitle?: ReactNode
  roleBadges?: RoleBadge[]
  leftAction?: ReactNode
  rightAction?: ReactNode
  onAvatarError?: () => void
}

export const ProfileHeroHeader = ({
  displayName,
  initials,
  avatarUrl,
  memberSinceLabel,
  subtitle,
  roleBadges = [],
  leftAction,
  rightAction,
  onAvatarError,
}: ProfileHeroHeaderProps) => (
  <div className="relative">
    <div className="absolute inset-x-0 top-0 h-44 overflow-hidden">
      {avatarUrl ? (
        <>
          <img
            src={avatarUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-md"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-primary-400/30 via-primary-400/10 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent" />
        </>
      )}
    </div>

    <div className="relative z-10 flex flex-col items-center px-4 pb-2 pt-24">
      <div className="relative flex w-full justify-center">
        {leftAction ? (
          <div className="absolute left-0 top-0 z-20">{leftAction}</div>
        ) : null}
        {rightAction ? (
          <div className="absolute right-0 top-0 z-20">{rightAction}</div>
        ) : null}

        <div className="media-card-skeuo h-24 w-24 rounded-2xl">
          <div className="media-card-skeuo-face bg-muted">
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
                  <span className="text-2xl font-bold text-primary-400">{initials}</span>
                ) : (
                  <UserIcon className="h-10 w-10 text-muted-foreground/50" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <h1 className="mt-3 line-clamp-2 px-2 text-center text-lg font-bold text-foreground">
        {displayName}
      </h1>

      {memberSinceLabel ? (
        <p className="mt-1 text-center text-xs text-muted-foreground">{memberSinceLabel}</p>
      ) : null}

      {subtitle}

      {roleBadges.length > 0 ? (
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {roleBadges.map((badge) => (
            <span
              key={badge.id}
              className="inline-flex items-center rounded-full border border-primary-400/30 bg-primary-400/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-400"
            >
              {badge.title}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  </div>
)
