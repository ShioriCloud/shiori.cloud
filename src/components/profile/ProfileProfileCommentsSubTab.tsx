import { Link } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useAnimeCommentsAccess, useMyAnimeCommentsQuery, useUserAnimeCommentsQuery } from '@/hooks/useAnimeComments'

type ProfileProfileCommentsSubTabProps = {
  variant: 'own' | 'public'
  profileUserId: string
}

export const ProfileProfileCommentsSubTab = ({
  variant,
  profileUserId,
}: ProfileProfileCommentsSubTabProps) => {
  const { user, isReady, inTelegram } = useAppAuth()
  const { data: commentsAccess } = useAnimeCommentsAccess(
    isReady && (inTelegram || Boolean(user))
  )
  const enabled = commentsAccess?.enabled === true

  const ownQuery = useMyAnimeCommentsQuery(
    variant === 'own' && Boolean(user) && enabled,
    1,
    20
  )
  const publicQuery = useUserAnimeCommentsQuery(
    profileUserId,
    variant === 'public' && enabled && profileUserId.length > 0,
    1,
    20
  )

  const query = variant === 'own' ? ownQuery : publicQuery
  const items = query.data?.items ?? []

  if (!enabled) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title="نظرات در دسترس نیست"
        subtitle="قابلیت نظرات برای این حساب فعال نیست."
      />
    )
  }

  if (query.isLoading) {
    return <p className="px-4 py-6 text-center text-sm text-muted-foreground">در حال بارگذاری…</p>
  }

  if (items.length === 0) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title="هنوز نظری نیست"
        subtitle={variant === 'own' ? 'اولین نظرت را زیر یک انیمه بنویس.' : 'این کاربر هنوز نظری نگذاشته.'}
      />
    )
  }

  return (
    <div className="mx-4 mt-2 space-y-3">
      <ProfileCommentActivityList items={items} tone={variant === 'own' ? 'self' : 'public'} />
      {variant === 'own' ? (
        <Link to="/profile/activity" className="block text-center text-xs font-medium text-primary-400">
          همه نظرات
        </Link>
      ) : (
        <Link
          to={`/u/${encodeURIComponent(profileUserId)}/activity`}
          className="block text-center text-xs font-medium text-primary-400"
        >
          همه نظرات
        </Link>
      )}
    </div>
  )
}
