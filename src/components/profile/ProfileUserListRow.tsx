import { Link } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import type { SocialProfileUserListItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

type ProfileUserListRowProps = {
  user: SocialProfileUserListItem
}

export const ProfileUserListRow = ({ user }: ProfileUserListRowProps) => {
  const username = user.username ? `@${user.username}` : null

  return (
    <Link
      to={`/u/${encodeURIComponent(user.telegram_user_id)}`}
      className={cn(
        'flex items-center gap-3 px-3 py-3',
        'transition-colors hover:bg-muted/40 active:bg-muted/55'
      )}
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
        {user.photo_url ? (
          <img src={user.photo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserIcon className="h-5 w-5 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-sm font-semibold text-foreground">{user.display_name}</p>
        {username ? (
          <p className="truncate text-xs text-muted-foreground">{username}</p>
        ) : user.role_badges?.length ? (
          <p className="truncate text-xs text-muted-foreground">
            {user.role_badges.map((b) => b.title).join(' · ')}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
