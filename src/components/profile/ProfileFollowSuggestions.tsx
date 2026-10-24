import { useQuery, useQueryClient } from '@tanstack/react-query'
import { HomeRailScroller } from '@/components/home/HomeRailScroller'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SocialSection } from '@/components/profile/social/SocialSection'
import { SocialSuggestionCard } from '@/components/profile/social/SocialSuggestionCard'
import { fetchSocialFollowSuggestions } from '@/services/socialProfile'

export const ProfileFollowSuggestions = ({ enabled = true }: { enabled?: boolean }) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['user-social-profile', 'suggestions'] as const,
    queryFn: () => fetchSocialFollowSuggestions(8),
    enabled,
    staleTime: 60_000,
  })

  if (!enabled || data?.enabled === false) return null
  if (!isLoading && (!data?.items || data.items.length === 0)) return null

  const items = data?.items ?? []

  const onFollowed = () => {
    void queryClient.invalidateQueries({ queryKey: ['user-social-profile', 'suggestions'] })
  }

  return (
    <SocialSection
      title="پیشنهاد دنبال کردن"
      description="بر اساس شبکهٔ دوستانت"
      className="mb-4"
    >
      {isLoading ? (
        <SocialListSkeleton rows={1} />
      ) : (
        <HomeRailScroller restoreKey="profile-follow-suggestions" className="-mx-1 gap-3 px-1 pb-1">
          {items.map((user) => (
            <SocialSuggestionCard key={user.telegram_user_id} user={user} onFollowed={onFollowed} />
          ))}
        </HomeRailScroller>
      )}
    </SocialSection>
  )
}
