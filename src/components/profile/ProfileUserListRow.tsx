import type { SocialProfileUserListItem } from '@/services/socialProfile'
import { SocialUserRow } from '@/components/profile/social/SocialUserRow'

type ProfileUserListRowProps = {
  user: SocialProfileUserListItem
}

export const ProfileUserListRow = ({ user }: ProfileUserListRowProps) => (
  <SocialUserRow user={user} />
)
