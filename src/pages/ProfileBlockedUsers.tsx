import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileUserListRow } from '@/components/profile/ProfileUserListRow'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/hooks/useAppAuth'
import {
  useBlockedSocialUsers,
  useSocialModerationMutations,
  useSocialProfileMe,
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
  const { data: socialMe } = useSocialProfileMe(Boolean(user))
  const enabled = socialMe?.enabled === true
  const { data, isLoading } = useBlockedSocialUsers(Boolean(user) && enabled)

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/profile/settings"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            تنظیمات
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">کاربران مسدود</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="px-4 pt-4">
        {!enabled ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="به‌زودی"
            subtitle="وقتی سوشال فعال شود این بخش در دسترس است."
          />
        ) : isLoading ? (
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
