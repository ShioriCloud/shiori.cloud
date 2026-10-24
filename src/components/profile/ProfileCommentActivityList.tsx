import type { AnimeCommentActivity } from '@/services/animeComments'
import { SocialCommentActivityCard } from '@/components/profile/social/SocialCommentActivityCard'

type ProfileCommentActivityListProps = {
  items: AnimeCommentActivity[]
  tone?: 'self' | 'public'
}

export const ProfileCommentActivityList = ({
  items,
  tone = 'self',
}: ProfileCommentActivityListProps) => (
  <div className="space-y-3">
    {items.map((item) => (
      <SocialCommentActivityCard key={item.id} item={item} tone={tone} />
    ))}
  </div>
)
