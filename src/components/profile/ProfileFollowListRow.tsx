import { Button } from '@/components/ui/button'
import { SocialUserRow } from '@/components/profile/social/SocialUserRow'
import { useSocialFollowMutation } from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'
import type { SocialProfileUserListItem } from '@/services/socialProfile'

type ProfileFollowListRowProps = {
  user: SocialProfileUserListItem
  showUnfollow?: boolean
}

export const ProfileFollowListRow = ({ user, showUnfollow = false }: ProfileFollowListRowProps) => {
  const { unfollow, isPending } = useSocialFollowMutation(user.telegram_user_id)

  return (
    <SocialUserRow
      user={user}
      trailing={
        showUnfollow ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="ui-elevated shrink-0 text-xs"
            disabled={isPending}
            onClick={() => {
              hapticSelection()
              unfollow.mutate()
            }}
          >
            لغو
          </Button>
        ) : undefined
      }
    />
  )
}
