import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SocialUserRow } from '@/components/profile/social/SocialUserRow'
import { useSocialFollowMutation } from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'
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

  return (
    <SocialUserRow
      user={user}
      trailing={
        showFollowActions ? (
          <Button
            type="button"
            variant={following ? 'secondary' : 'default'}
            size="sm"
            className="ui-elevated shrink-0 text-xs"
            disabled={isPending}
            onClick={onToggle}
          >
            {following ? 'آنفالو' : 'فالو'}
          </Button>
        ) : undefined
      }
    />
  )
}
