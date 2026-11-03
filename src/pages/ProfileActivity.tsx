import { useParams } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useAppAuth } from '@/hooks/useAppAuth'
import {
  useAnimeCommentsAccess,
  useMyAnimeCommentsQuery,
  useUserAnimeCommentsQuery,
} from '@/hooks/useAnimeComments'

const ProfileActivity = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const targetId = rawId?.trim() ?? ''
  const isPublic = targetId.length > 0
  const { user, isReady, inTelegram } = useAppAuth()
  const canCheckComments = isReady && (inTelegram || Boolean(user))
  const { data: commentsAccess } = useAnimeCommentsAccess(canCheckComments)
  const commentsRollout = commentsAccess?.enabled === true
  const enabled = commentsRollout
  const mine = useMyAnimeCommentsQuery(Boolean(user) && enabled && !isPublic)
  const theirs = useUserAnimeCommentsQuery(targetId, Boolean(user) && enabled && isPublic)
  const query = isPublic ? theirs : mine
  const { data, isLoading, isError, refetch } = query

  return (
    <ProfilePersonalSubpageLayout title={isPublic ? 'نظرات' : 'نظرات من'}>
      {!enabled ? (
        <ExploreEmptyState
          compact
          showImage={false}
          title="نظرات فعال نیست"
          subtitle="بخش نظرات فعلاً برای حساب تو در دسترس نیست."
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
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfileActivity
