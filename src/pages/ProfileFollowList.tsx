import { useLocation, useParams } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileFollowListRow } from '@/components/profile/ProfileFollowListRow'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialFollowListInfinite } from '@/hooks/useSocialProfile'

const ProfileFollowList = () => {
  const { pathname } = useLocation()
  const { telegramUserId: routeUserId } = useParams<{ telegramUserId?: string }>()
  const { user } = useAppAuth()

  const isFollowing = pathname.endsWith('/following')
  const title = isFollowing ? 'دنبال‌شده‌ها' : 'دنبال‌کننده‌ها'

  const subjectId = routeUserId?.trim() || (user?.id != null ? String(user.id) : '')
  const viewerId = user?.id != null ? String(user.id) : ''

  const listQuery = useSocialFollowListInfinite(
    subjectId,
    isFollowing ? 'following' : 'followers',
    Boolean(user) && subjectId.length > 0
  )
  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="space-y-3 px-4 pt-4">
        <h1 className="text-lg font-semibold">{title}</h1>
        {listQuery.isLoading ? (
          <SocialListSkeleton rows={3} />
        ) : items.length ? (
          <>
            <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>
              {items.map((row) => (
                <ProfileFollowListRow
                  key={row.telegram_user_id}
                  user={row}
                  showFollowActions={
                    viewerId.length > 0 && row.telegram_user_id !== viewerId
                  }
                />
              ))}
            </div>
            {listQuery.hasNextPage ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={listQuery.isFetchingNextPage}
                onClick={() => void listQuery.fetchNextPage()}
              >
                {listQuery.isFetchingNextPage ? 'در حال بارگذاری…' : 'نمایش بیشتر'}
              </Button>
            ) : null}
          </>
        ) : (
          <ExploreEmptyState
            compact
            showImage={false}
            title={isFollowing ? 'هنوز کسی را دنبال نکرده' : 'هنوز دنبال‌کننده‌ای نیست'}
            subtitle="اولین نفر باش یا دوستانت را دعوت کن."
          />
        )}
      </div>
    </div>
  )
}

export default ProfileFollowList
