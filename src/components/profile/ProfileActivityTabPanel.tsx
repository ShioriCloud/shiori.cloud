import { Link } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { ProfileRecentEpisodesRail } from '@/components/profile/ProfileRecentEpisodesRail'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useAppAuth } from '@/hooks/useAppAuth'
import {
  useAnimeCommentsAccess,
  useMyAnimeCommentsQuery,
  useUserAnimeCommentsQuery,
} from '@/hooks/useAnimeComments'
import type { SocialProfileMe } from '@/services/socialProfile'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileActivityTabPanelProps = {
  variant: 'own' | 'public'
  profileUserId?: string
  watchedItems?: WatchedItem[]
  recentRestoreKey?: string
  watchVisible?: boolean
}

export const ProfileActivityTabPanel = ({
  variant,
  profileUserId,
  watchedItems = [],
  recentRestoreKey = 'profile-activity-recent',
  watchVisible = true,
}: ProfileActivityTabPanelProps) => {
  const { user, isReady, inTelegram } = useAppAuth()
  const canCheck = isReady && (inTelegram || Boolean(user))
  const { data: commentsAccess } = useAnimeCommentsAccess(canCheck)
  const commentsEnabled = commentsAccess?.enabled === true

  const mine = useMyAnimeCommentsQuery(
    Boolean(user) && commentsEnabled && variant === 'own'
  )
  const theirs = useUserAnimeCommentsQuery(
    profileUserId ?? '',
    Boolean(user) && commentsEnabled && variant === 'public' && Boolean(profileUserId)
  )
  const commentsQuery = variant === 'own' ? mine : theirs

  const showRecent =
    variant === 'own' || (variant === 'public' && watchVisible && watchedItems.length > 0)

  return (
    <div className="-mx-4 space-y-1 pb-2">
      {showRecent ? (
        <ProfileRecentEpisodesRail items={watchedItems} restoreKey={recentRestoreKey} />
      ) : null}

      {!commentsEnabled ? (
        <div className="px-4 pt-4">
          <ExploreEmptyState
            compact
            showImage={false}
            title="به‌زودی"
            subtitle="وقتی نظرات فعال شود، فعالیت‌هایت اینجا دیده می‌شود."
          />
        </div>
      ) : commentsQuery.isLoading ? (
        <div className="px-4 pt-2">
          <SocialListSkeleton rows={4} />
        </div>
      ) : commentsQuery.isError ? (
        <div className="px-4 pt-4">
          <ExploreEmptyState
            title="بارگذاری ناموفق بود"
            actionLabel="تلاش مجدد"
            onAction={() => void commentsQuery.refetch()}
          />
        </div>
      ) : !commentsQuery.data?.items.length ? (
        <div className="px-4 pt-4">
          <ExploreEmptyState
            compact
            showImage={false}
            title={variant === 'public' ? 'هنوز نظری ندارد' : 'هنوز نظری نداری'}
            subtitle={
              variant === 'public'
                ? 'وقتی نظری بنویسد اینجا دیده می‌شود.'
                : 'از صفحهٔ انیمه اولین نظرت را بنویس.'
            }
          />
        </div>
      ) : (
        <div className="px-4 pt-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">نظرات</h2>
          <ProfileCommentActivityList
            items={commentsQuery.data.items}
            tone={variant === 'public' ? 'public' : 'self'}
          />
          {(commentsQuery.data.total ?? 0) > commentsQuery.data.items.length ? (
            <Link
              to={
                variant === 'public' && profileUserId
                  ? `/u/${encodeURIComponent(profileUserId)}/activity`
                  : '/profile/activity'
              }
              className="mt-4 block text-center text-sm font-medium text-primary-400 active:opacity-80"
            >
              همه نظرات
            </Link>
          ) : null}
        </div>
      )}
    </div>
  )
}
