import type { ReactNode } from 'react'
import { UserIcon } from 'hugeicons-react'
import { cn } from '@/lib/utils'

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

/** v3 identity row — avatar at inline-start (راست در RTL)، متن روبه‌رو. */
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
  <div className="relative overflow-hidden border-b border-border/40">
    <div className="absolute inset-x-0 top-0 h-28 overflow-hidden" aria-hidden>
      {avatarUrl ? (
        <>
          <img src={avatarUrl} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/55 to-background" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-primary-400/22 via-primary-400/8 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-400/16 via-transparent to-transparent" />
        </>
      )}
    </div>

    <div className="relative z-10 px-4 pb-3 pt-3">
      {(leftAction || rightAction) && (
        <div className="mb-2 flex min-h-9 items-center justify-between gap-2" dir="rtl">
          <div className="flex items-center gap-2">{leftAction}</div>
          <div className="flex items-center gap-2">{rightAction}</div>
        </div>
      )}

      <div className="flex items-center gap-3.5" dir="rtl">
        <div
          className={cn(
            'media-card-skeuo h-[4.5rem] w-[4.5rem] shrink-0 rounded-2xl',
            'shadow-[0_0_24px_-6px] shadow-primary-400/25 ring-2 ring-primary-400/20 ring-offset-2 ring-offset-background'
          )}
        >
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
                  <span className="text-lg font-bold text-primary-400">{initials}</span>
                ) : (
                  <UserIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 text-right">
          <h1 className="line-clamp-2 text-base font-bold leading-snug text-foreground">{displayName}</h1>
          {memberSinceLabel ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{memberSinceLabel}</p>
          ) : null}
          {subtitle}
          {roleBadges.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap justify-end gap-1.5">
              {roleBadges.map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center rounded-full border border-primary-400/30 bg-primary-400/10 px-2 py-0.5 text-[10px] font-medium text-primary-400"
                >
                  {badge.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </div>
)
