import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { SocialUserRow } from '@/components/profile/social/SocialUserRow'
import { useSocialFollowMutation } from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'
import type { SocialProfileUserListItem } from '@/services/socialProfile'

type ProfileFollowListRowProps = {
  user: SocialProfileUserListItem
  /** Show follow / unfollow control (hidden for the viewer's own row). */
  showFollowActions?: boolean
}

export const ProfileFollowListRow = ({
  user,
  showFollowActions = false,
}: ProfileFollowListRowProps) => {
  const [following, setFollowing] = useState(user.is_following === true)
  const { follow, unfollow, isPending } = useSocialFollowMutation(user.telegram_user_id)

  useEffect(() => {
    setFollowing(user.is_following === true)
  }, [user.is_following, user.telegram_user_id])

  const onToggle = () => {
    hapticSelection()
    if (following) {
      void unfollow.mutateAsync().then(() => setFollowing(false))
    } else {
      void follow.mutateAsync().then(() => setFollowing(true))
    }
  }

  const actionLabel = following ? 'لغو دنبال کردن' : 'دنبال کردن'

  return (
    <SocialUserRow
      user={user}
      trailing={
        showFollowActions ? (
          <Button
            type="button"
            variant={following ? 'destructive' : 'default'}
            size="sm"
            className={cn(
              'ui-elevated shrink-0 text-xs font-semibold',
              !following &&
                cn('border-transparent text-white hover:opacity-95', SHIORI_PRIMARY_BUTTON_CLASS)
            )}
            disabled={isPending}
            onClick={onToggle}
          >
            {actionLabel}
          </Button>
        ) : undefined
      }
    />
  )
}
