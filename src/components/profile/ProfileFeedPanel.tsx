import { useNavigate } from 'react-router-dom'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { SocialActivityCard } from '@/components/profile/social/SocialActivityCard'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SocialSection } from '@/components/profile/social/SocialSection'
import { useSocialFeedInfinite } from '@/hooks/useSocialProfile'
import { Button } from '@/components/ui/button'
import { socialFeedActivityKey, type SocialProfileFeedItem } from '@/services/socialProfile'

const socialFeedItemKey = (item: SocialProfileFeedItem) =>
  `${socialFeedActivityKey(item)}-${item.updated_at}`

export const ProfileFeedPanel = ({ enabled = true }: { enabled?: boolean }) => {
  const navigate = useNavigate()
  const feedQuery = useSocialFeedInfinite(enabled)
  const { isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = feedQuery
  const data = feedQuery.data?.pages[0]
  const items = feedQuery.data?.pages.flatMap((page) => page.items) ?? []

  if (!enabled) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title="فید اجتماعی"
        subtitle="برای دیدن فعالیت کسانی که دنبال می‌کنی باید وارد حساب شیوری شوی."
        actionLabel="رفتن به پروفایل"
        onAction={() => navigate('/profile')}
      />
    )
  }

  if (isLoading) {
    return <SocialListSkeleton rows={2} />
  }

  if (!data?.enabled) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title="فید در دسترس نیست"
        subtitle="الان نمی‌توان فید را بارگذاری کرد. کمی بعد دوباره امتحان کن یا از پروفایل وارد شو."
        actionLabel="پروفایل من"
        onAction={() => navigate('/profile')}
      />
    )
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <ExploreEmptyState
          compact
          title="فید خالی است"
          subtitle="چند نفر را دنبال کن تا تماشا، نظر و لیست‌هایشان اینجا دیده شود."
          actionLabel="جست‌وجوی کاربران"
          onAction={() => navigate('/profile/people')}
        />
      ) : (
        <SocialSection title="فعالیت اخیر" description="از میان کسانی که دنبال می‌کنی">
          <div className="space-y-3">
            {items.map((item) => (
              <SocialActivityCard key={socialFeedItemKey(item)} item={item} />
            ))}
          </div>
        </SocialSection>
      )}

      {hasNextPage ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="ui-elevated w-full"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? 'در حال بارگذاری…' : 'نمایش بیشتر'}
        </Button>
      ) : null}
    </div>
  )
}
