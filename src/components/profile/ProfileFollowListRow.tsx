import { Link } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import { useSocialFollowMutation } from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'
import type { SocialProfileUserListItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

type ProfileFollowListRowProps = {
  user: SocialProfileUserListItem
  showUnfollow?: boolean
}

export const ProfileFollowListRow = ({ user, showUnfollow = false }: ProfileFollowListRowProps) => {
  const { unfollow, isPending } = useSocialFollowMutation(user.telegram_user_id)

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Link
        to={`/u/${encodeURIComponent(user.telegram_user_id)}`}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1',
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
          {user.role_badges?.length ? (
            <p className="truncate text-xs text-muted-foreground">
              {user.role_badges.map((b) => b.title).join(' · ')}
            </p>
          ) : null}
        </div>
      </Link>
      {showUnfollow ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 text-xs"
          disabled={isPending}
          onClick={() => {
            hapticSelection()
            unfollow.mutate()
          }}
        >
          لغو
        </Button>
      ) : null}
    </div>
  )
}
