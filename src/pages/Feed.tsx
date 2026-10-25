import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { RouteFallback } from '@/components/RouteFallback'
import { ProfileFeedPanel } from '@/components/profile/ProfileFeedPanel'
import { ProfileFollowSuggestions } from '@/components/profile/ProfileFollowSuggestions'

const Feed = () => {
  const { isReady, user } = useAppAuth()
  const { data: socialProfile } = useSocialProfileMe(Boolean(user))

  if (!isReady) {
    return <RouteFallback />
  }

  return (
    <div className="pb-24 px-4 pt-4 text-foreground">
      <h1 className="mb-4 text-lg font-bold">فید</h1>
      <ProfileFollowSuggestions enabled={socialProfile?.enabled === true} />
      <ProfileFeedPanel enabled />
    </div>
  )
}

export default Feed
