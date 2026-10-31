import { useParams } from 'react-router-dom'
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


  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-semibold">{isPublic ? 'نظرات' : 'نظرات من'}</h1>
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
