import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialProfileMe } from '@/hooks/useSocialProfile'
import { RouteFallback } from '@/components/RouteFallback'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFeedPanel } from '@/components/profile/ProfileFeedPanel'
import { ProfileFollowSuggestions } from '@/components/profile/ProfileFollowSuggestions'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { cn } from '@/lib/utils'

const Feed = () => {
  const navigate = useNavigate()
  const { isReady, user, inTelegram, login, register } = useAppAuth()
  const socialEnabled = Boolean(user)
  const { data: socialProfile, isLoading: socialLoading } = useSocialProfileMe(socialEnabled)
  const feedEnabled = socialProfile?.enabled === true
  const [peopleQuery, setPeopleQuery] = useState('')

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

  const goPeopleSearch = (e?: FormEvent) => {
    e?.preventDefault()
    const q = peopleQuery.trim()
    navigate(q ? `/profile/people?q=${encodeURIComponent(q)}` : '/profile/people')
  }

  return (
    <div className="pb-24 text-foreground">
      <div className="px-4 pt-4">
        <div className="mb-4">
          <h1 className="text-lg font-bold">فید</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">فعالیت کسانی که دنبال می‌کنی</p>
        </div>

        <form
          onSubmit={goPeopleSearch}
          className={cn(
            'mb-4 flex items-center gap-2 rounded-2xl border border-border/60 bg-card/70 p-1.5',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
          )}
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={peopleQuery}
              onChange={(e) => setPeopleQuery(e.target.value)}
              placeholder="دنبال کی می‌گردی؟"
              className="h-10 border-0 bg-transparent pe-2 ps-9 shadow-none focus-visible:ring-0"
              enterKeyHint="search"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className={cn('h-10 shrink-0 rounded-xl px-4 font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
          >
            جستجو
          </Button>
        </form>

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
