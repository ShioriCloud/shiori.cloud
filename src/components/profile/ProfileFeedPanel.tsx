import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { ExploreEmptyState, EXPLORE_CHIP_CLASS } from '@/components/explore/ExploreUi'
import { SocialActivityCard } from '@/components/profile/social/SocialActivityCard'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SocialSection } from '@/components/profile/social/SocialSection'
import { useSocialFeedInfinite } from '@/hooks/useSocialProfile'
import { Button } from '@/components/ui/button'
import type { SocialProfileFeedItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

const socialFeedItemKey = (item: SocialProfileFeedItem) => {
  if (item.type === 'anime_comment') return `c-${item.comment_id}`
  if (item.type === 'user_follow') {
    return `f-${item.actor.telegram_user_id}-${item.target.telegram_user_id}-${item.updated_at}`
  }
  if (item.type === 'public_list_add') {
    return `pl-${item.list_id}-${item.anime_id}-${item.updated_at}`
  }
  return `${item.type}-${item.actor.telegram_user_id}-${item.anime_id}-${item.updated_at}`
}

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
      <Link
        to="/profile/people"
        className={cn(
          EXPLORE_CHIP_CLASS,
          'flex h-11 w-full items-center justify-center gap-2 text-sm font-medium'
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        جست‌وجوی کاربران
      </Link>

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
              <SocialActivityCard
                key={socialFeedItemKey(item)}
                item={item}
              />
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
