import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search } from 'lucide-react'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { RouteFallback } from '@/components/RouteFallback'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFeedPanel } from '@/components/profile/ProfileFeedPanel'
import { ProfileFollowSuggestions } from '@/components/profile/ProfileFollowSuggestions'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { cn } from '@/lib/utils'

const Feed = () => {
  const navigate = useNavigate()
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
        <div className="mb-4">
          <h1 className="text-lg font-bold">فید</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">فعالیت کسانی که دنبال می‌کنی</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/profile/people')}
          className={cn(
            'mb-4 flex w-full items-center gap-2 rounded-2xl border border-border/60 bg-card/70 p-1.5 text-start',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] active:scale-[0.99] transition-transform'
          )}
          aria-label="جستجوی کاربران"
        >
          <span className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <span className="flex h-10 items-center truncate pe-2 ps-9 text-sm text-muted-foreground">
              دنبال کی می‌گردی؟
            </span>
          </span>
          <span
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1 rounded-xl px-3.5 text-sm font-semibold text-white',
              SHIORI_PRIMARY_BUTTON_CLASS
            )}
          >
            جستجو
            <ChevronLeft className="h-3.5 w-3.5 opacity-90" aria-hidden />
          </span>
        </button>

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
