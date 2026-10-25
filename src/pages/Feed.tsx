import { Link } from 'react-router-dom'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { RouteFallback } from '@/components/RouteFallback'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFeedPanel } from '@/components/profile/ProfileFeedPanel'
import { ProfileFollowSuggestions } from '@/components/profile/ProfileFollowSuggestions'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { cn } from '@/lib/utils'

const Feed = () => {
  const { isReady, user, inTelegram, login, register } = useAppAuth()
  const socialEnabled = Boolean(user)
  const { data: socialProfile, isLoading: socialLoading } = useSocialProfileMe(socialEnabled)
  const feedEnabled = socialProfile?.enabled === true

  if (!isReady) {
    return <RouteFallback />
  }

  const showWebAuth = !inTelegram && !user
  if (showWebAuth) {
    return (
      <div className="px-4 pb-24 pt-10">
        <ProfileAuthPanel login={login} register={register} layout="page" />
      </div>
    )
  }

  return (
    <div className="pb-24 text-foreground">
      <div className="px-4 pt-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">فید</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              فعالیت کسانی که دنبال می‌کنی
            </p>
          </div>
          <Link
            to="/profile/people"
            className={cn(
              'shrink-0 rounded-xl border border-border/60 bg-card/80 px-3 py-1.5',
              'text-xs font-medium text-primary-400 active:opacity-80'
            )}
          >
            جست‌وجو
          </Link>
        </div>

        {socialLoading && !socialProfile ? (
          <MyListCompactCard className="px-4 py-8 text-center text-sm text-muted-foreground">
            در حال بارگذاری…
          </MyListCompactCard>
        ) : (
          <>
            <ProfileFollowSuggestions enabled={feedEnabled} />
            <div className="mt-4">
              <ProfileFeedPanel enabled={feedEnabled} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Feed
