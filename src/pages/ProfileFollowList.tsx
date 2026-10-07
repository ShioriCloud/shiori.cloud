import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileUserListRow } from '@/components/profile/ProfileUserListRow'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialFollowList, useSocialProfileMe } from '@/hooks/useSocialProfile'

const ProfileFollowList = () => {
  const { pathname } = useLocation()
  const { telegramUserId: routeUserId } = useParams<{ telegramUserId?: string }>()
  const { user } = useAppAuth()
  const { data: socialMe } = useSocialProfileMe(Boolean(user))

  const isFollowing = pathname.endsWith('/following')
  const title = isFollowing ? 'دنبال‌شده‌ها' : 'دنبال‌کننده‌ها'

  const subjectId = routeUserId?.trim() || (user?.id != null ? String(user.id) : '')
  const profileBack = routeUserId
    ? `/u/${encodeURIComponent(routeUserId)}`
    : '/profile'

  const socialEnabled = socialMe?.enabled === true
  const { data, isLoading } = useSocialFollowList(
    subjectId,
    isFollowing ? 'following' : 'followers',
    Boolean(user) && socialEnabled && subjectId.length > 0
  )

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

      <div className="px-4 pt-4">
        {!socialEnabled ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="به‌زودی"
            subtitle="شبکه اجتماعی شیوری برای حساب تو هنوز فعال نشده."
          />
        ) : isLoading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/70" />
            ))}
          </div>
        ) : data?.items.length ? (
          <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
            {data.items.map((row) => (
              <ProfileUserListRow key={row.telegram_user_id} user={row} />
            ))}
          </MyListCompactCard>
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
