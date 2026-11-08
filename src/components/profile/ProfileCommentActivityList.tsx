import type { AnimeCommentActivity } from '@/services/animeComments'
import { SocialCommentActivityCard } from '@/components/profile/social/SocialCommentActivityCard'

type ProfileCommentActivityListProps = {
  items: AnimeCommentActivity[]
}

export const ProfileCommentActivityList = ({ items }: ProfileCommentActivityListProps) => (
  <div className="flex flex-col gap-2.5">
    {items.map((item) => (
      <SocialCommentActivityCard key={item.id} item={item} />
    ))}
  </div>
)
