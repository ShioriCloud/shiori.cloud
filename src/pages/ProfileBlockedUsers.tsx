import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { ProfileUserListRow } from '@/components/profile/ProfileUserListRow'
import { SocialUserListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/hooks/useAppAuth'
import {
  useBlockedSocialUsers,
  useSocialModerationMutations,
} from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'
import type { SocialProfileUserListItem } from '@/services/socialProfile'

const BlockedRow = ({ user }: { user: SocialProfileUserListItem }) => {
  const { unblock, isPending } = useSocialModerationMutations(user.telegram_user_id)

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="min-w-0 flex-1 overflow-hidden rounded-lg">
        <ProfileUserListRow user={user} />
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="shrink-0 text-xs"
        disabled={isPending}
        onClick={() => {
          hapticSelection()
          void unblock.mutate()
        }}
      >
        رفع مسدودیت
      </Button>
    </div>
  )
}

const ProfileBlockedUsers = () => {
  const { user } = useAppAuth()
  const { data, isLoading } = useBlockedSocialUsers(Boolean(user))

  return (
    <ProfilePersonalSubpageLayout
      title="کاربران مسدود"
      description="از منوی پروفایل دیگران می‌توانی مسدود کنی."
    >
      {isLoading ? (
        <SocialUserListSkeleton rows={6} showAction={false} />
      ) : !data?.items.length ? (
        <ExploreEmptyState
          compact
          showImage={false}
          title="کسی مسدود نیست"
          subtitle="لیست مسدودیت‌ها خالی است."
        />
      ) : (
        <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
          {data.items.map((row) => (
            <BlockedRow key={row.telegram_user_id} user={row} />
          ))}
        </MyListCompactCard>
      )}
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfileBlockedUsers
