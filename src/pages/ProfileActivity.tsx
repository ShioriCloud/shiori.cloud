import { useParams } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useMyAnimeCommentsQuery, useUserAnimeCommentsQuery } from '@/hooks/useAnimeComments'

const ProfileActivity = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const targetId = rawId?.trim() ?? ''
  const isPublic = targetId.length > 0
  const { user, isReady, inTelegram } = useAppAuth()
  const canLoad = isReady && (inTelegram || Boolean(user))
  const mine = useMyAnimeCommentsQuery(canLoad && !isPublic)
  const theirs = useUserAnimeCommentsQuery(targetId, canLoad && isPublic)
  const query = isPublic ? theirs : mine
  const { data, isPending, isError, refetch } = query

  return (
    <ProfilePersonalSubpageLayout title={isPublic ? 'نظرات' : 'نظرات من'}>
      {!canLoad || isPending ? (
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
