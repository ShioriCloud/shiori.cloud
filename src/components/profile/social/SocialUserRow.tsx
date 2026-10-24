import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { SocialProfileUserListItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { SocialUserAvatar } from './SocialUserAvatar'

type SocialUserRowProps = {
  user: SocialProfileUserListItem
  subtitle?: string | null
  trailing?: ReactNode
  size?: 'sm' | 'md'
  className?: string
  /** When false, only the row body renders (no outer flex for trailing). */
  withTrailingLayout?: boolean
}

export const SocialUserRow = ({
  user,
  subtitle,
  trailing,
  size = 'md',
  className,
  withTrailingLayout = true,
}: SocialUserRowProps) => {
  const badgeLine =
    subtitle?.trim() ||
    (user.role_badges?.length ? user.role_badges.map((b) => b.title).join(' · ') : null)

  const body = (
    <Link
      to={`/u/${encodeURIComponent(user.telegram_user_id)}`}
      className={cn(
        'flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1.5',
        'transition-colors active:bg-muted/45',
        size === 'sm' ? 'gap-2.5' : 'gap-3',
        className
      )}
    >
      <SocialUserAvatar
        photoUrl={user.photo_url}
        displayName={user.display_name}
        size={size === 'sm' ? 'sm' : 'md'}
      />
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-sm font-semibold text-foreground">{user.display_name}</p>
        {badgeLine ? (
          <p className="truncate text-xs text-muted-foreground">{badgeLine}</p>
        ) : null}
      </div>
    </Link>
  )

  if (!withTrailingLayout || !trailing) {
    return <div className={cn('px-3 py-2', !withTrailingLayout && className)}>{body}</div>
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {body}
      <div className="shrink-0">{trailing}</div>
    </div>
  )
}
