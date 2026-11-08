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
  /** کنار هویت، سمت چپ ردیف (زنگوله / تنظیمات). */
  leftAction?: ReactNode
  rightAction?: ReactNode
  onAvatarError?: () => void
}

/** v3 compact identity — آواتار راست، اکشن‌ها چپ. صفحه از قبل راست‌به‌چپ است. */
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
  <div className="px-4 pt-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full',
            'border-2 border-white/12 bg-gradient-to-br from-violet-500 to-[#3b1f73]'
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={onAvatarError}
            />
          ) : initials ? (
            <span className="text-[22px] font-bold text-white">{initials}</span>
          ) : (
            <UserIcon className="h-7 w-7 text-white/80" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold leading-7 text-foreground">{displayName}</h1>
            {roleBadges.map((badge) => (
              <span
                key={badge.id}
                className="inline-flex h-[22px] shrink-0 items-center rounded-full border border-[#3a2766] bg-[#26193f] px-2 text-[11px] font-semibold text-[#a78bfa]"
              >
                {badge.title}
              </span>
            ))}
          </div>
          {memberSinceLabel ? (
            <p className="mt-0.5 text-xs leading-[18px] text-muted-foreground">{memberSinceLabel}</p>
          ) : null}
          {subtitle}
        </div>
      </div>

      {leftAction || rightAction ? (
        <div className="flex shrink-0 items-center gap-2">
          {leftAction}
          {rightAction}
        </div>
      ) : null}
    </div>
  </div>
)
