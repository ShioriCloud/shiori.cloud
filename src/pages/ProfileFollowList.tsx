import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileFollowListRow } from '@/components/profile/ProfileFollowListRow'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialFollowListInfinite, useSocialProfileMe } from '@/hooks/useSocialProfile'

const ProfileFollowList = () => {
  const { pathname } = useLocation()
  const { telegramUserId: routeUserId } = useParams<{ telegramUserId?: string }>()
  const { user } = useAppAuth()
  const { data: socialMe, isLoading: socialMeLoading } = useSocialProfileMe(Boolean(user))

  const isFollowing = pathname.endsWith('/following')
  const title = isFollowing ? 'دنبال‌شده‌ها' : 'دنبال‌کننده‌ها'

  const subjectId = routeUserId?.trim() || (user?.id != null ? String(user.id) : '')
  const profileBack = routeUserId
    ? `/u/${encodeURIComponent(routeUserId)}`
    : '/profile'

  const socialBlocked = socialMe?.enabled === false
  const listQuery = useSocialFollowListInfinite(
    subjectId,
    isFollowing ? 'following' : 'followers',
    Boolean(user) &&
      !socialMeLoading &&
      socialMe !== undefined &&
      !socialBlocked &&
      subjectId.length > 0
  )
  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? []
  const showUnfollow =
    isFollowing &&
    subjectId.length > 0 &&
    user?.id != null &&
    String(user.id) === subjectId

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to={profileBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            پروفایل
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">{title}</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4">
        {socialMeLoading ? (
          <SocialListSkeleton rows={2} />
        ) : socialBlocked ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="به‌زودی"
            subtitle="شبکه اجتماعی شیوری برای حساب تو هنوز فعال نشده."
          />
        ) : listQuery.isLoading ? (
          <SocialListSkeleton rows={3} />
        ) : items.length ? (
          <>
            <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>
              {items.map((row) => (
                <ProfileFollowListRow
                  key={row.telegram_user_id}
                  user={row}
                  showUnfollow={showUnfollow}
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
