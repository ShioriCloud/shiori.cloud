import { useLocation, useParams } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileFollowListRow } from '@/components/profile/ProfileFollowListRow'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { SocialUserListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialFollowListInfinite, useSocialProfileUser } from '@/hooks/useSocialProfile'

const ProfileFollowList = () => {
  const { pathname } = useLocation()
  const { telegramUserId: routeUserId } = useParams<{ telegramUserId?: string }>()
  const { user } = useAppAuth()

  const isFollowing = pathname.endsWith('/following')
  const title = isFollowing ? 'دنبال‌شده‌ها' : 'دنبال‌کننده‌ها'

  const subjectId = routeUserId?.trim() || (user?.id != null ? String(user.id) : '')
  const viewerId = user?.id != null ? String(user.id) : ''
  const isPublicSubject = Boolean(routeUserId?.trim())

  const { data: subjectSocial } = useSocialProfileUser(
    subjectId,
    isPublicSubject && Boolean(user) && subjectId.length > 0,
    1,
    1
  )
  const subjectName = subjectSocial?.profile?.display_name?.trim()
  const layoutDescription =
    isPublicSubject && subjectName ? `پروفایل ${subjectName}` : undefined

  const listQuery = useSocialFollowListInfinite(
    subjectId,
    isFollowing ? 'following' : 'followers',
    Boolean(user) && subjectId.length > 0
  )
  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? []

  const emptyTitle = isFollowing
    ? isPublicSubject
      ? 'هنوز کسی را دنبال نکرده'
      : 'هنوز کسی را دنبال نکرده‌ای'
    : isPublicSubject
      ? 'هنوز دنبال‌کننده‌ای نیست'
      : 'هنوز دنبال‌کننده‌ای نداری'

  const emptySubtitle = isPublicSubject
    ? isFollowing
      ? 'وقتی کاربران دیگر را دنبال کند اینجا دیده می‌شود.'
      : 'اولین دنبال‌کننده می‌تواند از پروفایل عمومی او باشد.'
    : isFollowing
      ? 'از جست‌وجوی کاربران یا فید، دوستانت را دنبال کن.'
      : 'اولین نفر باش یا دوستانت را دعوت کن.'

  return (
    <ProfilePersonalSubpageLayout title={title} description={layoutDescription}>
      {listQuery.isLoading && items.length === 0 ? (
        <SocialUserListSkeleton rows={6} />
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
              className="mt-3 w-full"
              disabled={listQuery.isFetchingNextPage}
              onClick={() => void listQuery.fetchNextPage()}
            >
              {listQuery.isFetchingNextPage ? 'در حال بارگذاری…' : 'نمایش بیشتر'}
            </Button>
          ) : null}
        </>
      ) : (
        <ExploreEmptyState compact showImage={false} title={emptyTitle} subtitle={emptySubtitle} />
      )}
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfileFollowList
