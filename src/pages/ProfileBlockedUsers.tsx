import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileUserListRow } from '@/components/profile/ProfileUserListRow'
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
    <div className="bg-background pb-24 text-foreground">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-semibold">کاربران مسدود</h1>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/70" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="کسی مسدود نیست"
            subtitle="از منوی پروفایل دیگران می‌توانی مسدود کنی."
          />
        ) : (
          <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
            {data.items.map((row) => (
              <BlockedRow key={row.telegram_user_id} user={row} />
            ))}
          </MyListCompactCard>
        )}
      </div>
    </div>
  )
}

export default ProfileBlockedUsers
