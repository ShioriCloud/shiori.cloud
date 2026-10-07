import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { Settings } from 'lucide-react'
import { useAppAuth } from '../hooks/useAppAuth'
import { useUserAnimeList } from '../hooks/useUserAnimeList'
import { useSocialProfileMe } from '../hooks/useSocialProfile'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFeedPanel } from '@/components/profile/ProfileFeedPanel'
import { ProfileOverviewStrip } from '@/components/profile/ProfileOverviewStrip'
import { ProfilePersonalPanel } from '@/components/profile/ProfilePersonalPanel'
import { ProfileStatCell } from '@/components/profile/ProfileStatCell'
import { ProfileStatsPanel } from '@/components/profile/ProfileStatsPanel'
import { PROFILE_TABS, parseProfileTab, type ProfileTabId } from '@/components/profile/profileTabs'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { cn } from '@/lib/utils'
import { hapticSelection } from '@/lib/telegramHaptics'
import { toPersianDigits } from '@/lib/persianDigits'

const getInitials = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return 'ک'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`
  }
  return trimmed.charAt(0)
}

const ProfileSkeleton = () => (
  <div className="animate-pulse pb-24">
    <div className="relative h-44">
      <div className="absolute inset-x-0 top-0 h-full bg-muted/60" />
      <div className="relative z-10 flex flex-col items-center pt-24">
        <div className="media-card-skeuo h-24 w-24 rounded-2xl">
          <div className="media-card-skeuo-face bg-muted" />
        </div>
        <div className="mt-4 h-6 w-36 rounded-md bg-muted" />
      </div>
    </div>
    <div className="mx-4 mt-6 grid grid-cols-3 gap-2">
      <div className="h-16 rounded-lg bg-muted/70" />
      <div className="h-16 rounded-lg bg-muted/70" />
      <div className="h-16 rounded-lg bg-muted/70" />
    </div>
  </div>
)

const Profile = () => {
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const { stats } = useUserAnimeList()
  const { data: socialProfile } = useSocialProfileMe(Boolean(user))
  const [searchParams, setSearchParams] = useSearchParams()
  const [avatarFailed, setAvatarFailed] = useState(false)

  const activeTab = parseProfileTab(searchParams.get('tab'))

  const setActiveTab = (tab: ProfileTabId) => {
    hapticSelection()
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (tab === 'stats') next.delete('tab')
        else next.set('tab', tab)
        return next
      },
      { replace: true }
    )
  }

  const displayName = user?.displayName ?? 'کاربر'
  const initials = useMemo(() => getInitials(displayName), [displayName])
  const username = user?.username ? `@${user.username}` : null
  const avatarUrl = user?.photoUrl && !avatarFailed ? user.photoUrl : null
  const showWebAuth = !inTelegram && !user

  const followers = socialProfile?.profile?.followers_count ?? 0
  const following = socialProfile?.profile?.following_count ?? 0
  const animeWatched =
    socialProfile?.enabled && socialProfile.summary
      ? socialProfile.summary.anime_count
      : stats.animeCount

  const overview = useMemo(() => {
    if (socialProfile?.enabled && socialProfile.summary) {
      return {
        watchHours: socialProfile.summary.estimated_watch_hours,
        byFormat: socialProfile.by_format ?? [],
      }
    }
    const estimatedHours = Math.round((stats.episodesWatched * 24) / 60)
    return {
      watchHours: estimatedHours,
      byFormat: [] as Array<{
        format: string
        count: number
        episodes_watched: number
      }>,
    }
  }, [socialProfile, stats])

  if (!isReady) {
    return <ProfileSkeleton />
  }

  if (showWebAuth) {
    return (
      <div className="pb-24 px-4 pt-10">
        <ProfileAuthPanel login={login} register={register} layout="page" />
      </div>
    )
  }

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-44 overflow-hidden">
          {avatarUrl ? (
            <>
              <img
                src={avatarUrl}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-md"
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-primary-400/30 via-primary-400/10 to-background" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent" />
            </>
          )}
        </div>

        <Link
          to="/profile/settings"
          className={cn(
            'absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl',
            'border border-border/50 bg-background/70 text-muted-foreground backdrop-blur-sm',
            'active:scale-95 transition-transform'
          )}
          aria-label="تنظیمات"
        >
          <Settings className="h-5 w-5" />
        </Link>

        <div className="relative z-10 flex flex-col items-center px-4 pb-2 pt-24">
          <div className="media-card-skeuo h-24 w-24 rounded-2xl">
            <div className="media-card-skeuo-face bg-muted">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-400/15">
                  {initials ? (
                    <span className="text-2xl font-bold text-primary-400">{initials}</span>
                  ) : (
                    <UserIcon className="h-10 w-10 text-muted-foreground/50" />
                  )}
                </div>
              )}
            </div>
          </div>

          <h1 className="mt-3 line-clamp-2 px-2 text-center text-lg font-bold text-foreground">
            {displayName}
          </h1>

          {username ? (
            <p className="mt-1 text-left text-sm text-muted-foreground">{username}</p>
          ) : user?.email ? (
            <p className="mt-1 text-left text-sm text-muted-foreground" dir="ltr">
              {user.email}
            </p>
          ) : null}

          {user?.isPremium ? (
            <span className="mt-2 inline-flex items-center rounded-full border border-primary-400/30 bg-primary-400/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-400">
              Telegram Premium
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <ProfileStatCell value={toPersianDigits(followers)} label="دنبال‌کننده" />
        <ProfileStatCell value={toPersianDigits(following)} label="دنبال‌شده" />
        <ProfileStatCell
          to="/my-list"
          value={toPersianDigits(animeWatched)}
          label="انیمه دیده"
        />
      </div>

      <ProfileOverviewStrip data={overview} />

      <div className="mx-4 mt-6">
        <MyListCompactCard
          className="flex min-h-[4.5rem] items-center justify-center px-4 py-5 text-xs text-muted-foreground"
          aria-hidden
        >
          نشان‌ها — به‌زودی
        </MyListCompactCard>
      </div>

      <div className="mx-4 mt-6 flex rounded-xl border border-border/50 bg-muted/20 p-1">
        {PROFILE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
              activeTab === t.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mx-4 mt-4">
        {activeTab === 'stats' ? <ProfileStatsPanel /> : null}
        {activeTab === 'feed' ? <ProfileFeedPanel /> : null}
        {activeTab === 'personal' ? <ProfilePersonalPanel /> : null}
      </div>
    </div>
  )
}

export default Profile
