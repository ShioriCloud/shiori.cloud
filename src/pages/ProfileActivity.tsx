import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useAppAuth } from '@/hooks/useAppAuth'
import {
  useAnimeCommentsAccess,
  useMyAnimeCommentsQuery,
  useUserAnimeCommentsQuery,
} from '@/hooks/useAnimeComments'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'

const ProfileActivity = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const targetId = rawId?.trim() ?? ''
  const isPublic = targetId.length > 0
  const { user, isReady, inTelegram } = useAppAuth()
  const canCheckComments = isReady && (inTelegram || Boolean(user))
  const { data: commentsAccess } = useAnimeCommentsAccess(canCheckComments)
  const commentsRollout = commentsAccess?.enabled === true
  const { data: socialMe } = useSocialProfileMe(Boolean(user) && !isPublic)
  const enabled = commentsRollout && (isPublic || socialMe?.enabled === true)
  const mine = useMyAnimeCommentsQuery(Boolean(user) && enabled && !isPublic)
  const theirs = useUserAnimeCommentsQuery(targetId, Boolean(user) && enabled && isPublic)
  const query = isPublic ? theirs : mine
  const { data, isLoading, isError, refetch } = query

  const backTo = isPublic
    ? `/u/${encodeURIComponent(targetId)}?tab=activity`
    : '/profile?tab=activity'

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            پروفایل
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">نظرات و فعالیت</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4">
        {!enabled ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title="به‌زودی"
            subtitle="وقتی سوشال برایت فعال شود، نظرات اینجا جمع می‌شود."
          />
        ) : isLoading ? (
          <SocialListSkeleton rows={4} />
        ) : isError ? (
          <ExploreEmptyState
            title="بارگذاری ناموفق بود"
            actionLabel="تلاش مجدد"
            onAction={() => void refetch()}
          />
        ) : !data?.items.length ? (
          <ExploreEmptyState
            compact
            showImage={false}
            title={isPublic ? 'هنوز نظری ندارد' : 'هنوز نظری نداری'}
            subtitle={
              isPublic
                ? 'وقتی نظری بنویسد اینجا دیده می‌شود.'
                : 'از صفحهٔ انیمه اولین نظرت را بنویس.'
            }
          />
        ) : (
          <ProfileCommentActivityList
            items={data.items}
            tone={isPublic ? 'public' : 'self'}
          />
        )}
      </div>
    </div>
  )
}

export default ProfileActivity
