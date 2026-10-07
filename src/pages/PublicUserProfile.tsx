import { useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { useAppAuth } from '../hooks/useAppAuth'
import { useSocialProfileUser } from '../hooks/useSocialProfile'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFeedPanel } from '@/components/profile/ProfileFeedPanel'
import { ProfileFollowButton } from '@/components/profile/ProfileFollowButton'
import { ProfileOverviewStrip } from '@/components/profile/ProfileOverviewStrip'
import { ProfilePersonalPanel } from '@/components/profile/ProfilePersonalPanel'
import { ProfileSocialWatchedRail } from '@/components/profile/ProfileSocialWatchedRail'
import { ProfileStatCell } from '@/components/profile/ProfileStatCell'
import { ProfileBadgesStrip } from '@/components/profile/ProfileBadgesStrip'
import { ProfileShareButton } from '@/components/profile/ProfileShareButton'
import { ProfileTranslationsRail } from '@/components/profile/ProfileTranslationsRail'
import { PROFILE_TABS, parseProfileTab, type ProfileTabId } from '@/components/profile/profileTabs'
import { ExploreEmptyState, ExploreTabBar } from '@/components/explore/ExploreUi'
import { cn } from '@/lib/utils'
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

const PublicProfileSkeleton = () => (
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

const PublicUserProfile = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const telegramUserId = rawId?.trim() ?? ''
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const { data, isLoading, isError } = useSocialProfileUser(telegramUserId, Boolean(user))
  const [searchParams, setSearchParams] = useSearchParams()
  const [avatarFailed, setAvatarFailed] = useState(false)

  const activeTab = parseProfileTab(searchParams.get('tab'))

  const setActiveTab = (tab: ProfileTabId) => {
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

  const profileBase = `/u/${encodeURIComponent(telegramUserId)}`

  const displayName = data?.profile?.display_name ?? 'کاربر'
  const initials = useMemo(() => getInitials(displayName), [displayName])
  const username = data?.profile?.username ? `@${data.profile.username}` : null
  const avatarUrl =
    data?.profile?.photo_url && !avatarFailed ? data.profile.photo_url : null
  const showWebAuth = !inTelegram && !user

  const overview = useMemo(() => {
    if (data?.enabled && data.summary) {
      return {
        watchHours: data.summary.estimated_watch_hours,
        byFormat: data.by_format ?? [],
      }
    }
    return { watchHours: 0, byFormat: [] as Array<{ format: string; count: number; episodes_watched: number }> }
  }, [data])

  if (!isReady || (Boolean(user) && isLoading && !data)) {
    return <PublicProfileSkeleton />
  }

  if (showWebAuth) {
    return (
      <div className="pb-24 px-4 pt-10">
        <ProfileAuthPanel login={login} register={register} layout="page" />
      </div>
    )
  }

  if (!telegramUserId) {
    return (
      <div className="px-4 pt-10 pb-24">
        <ExploreEmptyState title="پروفایل پیدا نشد" subtitle="شناسه کاربر نامعتبر است." />
      </div>
    )
  }

  if (data?.enabled && data.is_self) {
    return <Navigate to="/profile" replace />
  }

  if (isError) {
    return (
      <div className="px-4 pt-10 pb-24">
        <ExploreEmptyState title="پروفایل پیدا نشد" subtitle="این کاربر در شیوری ثبت نشده." />
      </div>
    )
  }

  if (data && !data.enabled) {
    return (
      <div className="px-4 pt-10 pb-24">
        <ExploreEmptyState
          title="پروفایل اجتماعی فعال نیست"
          subtitle="این بخش هنوز برای حساب تو باز نشده. بعداً دوباره سر بزن."
        />
        <Link to="/profile" className="mt-6 block text-center text-sm font-medium text-primary-400">
          برگشت به پروفایل من
        </Link>
      </div>
    )
  }

  if (!data?.enabled || !data.profile) {
    return <PublicProfileSkeleton />
  }

  const followers = data.profile.followers_count ?? 0
  const following = data.profile.following_count ?? 0
  const animeWatched = data.summary?.anime_count ?? 0
  const roleBadges = data.profile.role_badges ?? []
  const translator = data.translator ?? null
  const watchedItems = data.watched?.items ?? []

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

        <div className="relative z-10 flex flex-col items-center px-4 pb-2 pt-24">
          <div className="relative flex w-full justify-center">
            <ProfileShareButton
              telegramUserId={telegramUserId}
              displayName={displayName}
              className="absolute left-0 top-0 z-20"
            />

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
          </div>

          <h1 className="mt-3 line-clamp-2 px-2 text-center text-lg font-bold text-foreground">
            {displayName}
          </h1>

          {username ? (
            <p className="mt-1 text-left text-sm text-muted-foreground">{username}</p>
          ) : null}

          {roleBadges.length > 0 ? (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {roleBadges.map((badge) => (
                <span
                  key={badge.id}
                  className={cn(
                    'inline-flex items-center rounded-full border border-primary-400/30 bg-primary-400/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-400'
                  )}
                >
                  {badge.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <ProfileStatCell
          to={`${profileBase}/followers`}
          value={toPersianDigits(followers)}
          label="دنبال‌کننده"
        />
        <ProfileStatCell
          to={`${profileBase}/following`}
          value={toPersianDigits(following)}
          label="دنبال‌شده"
        />
        <ProfileStatCell value={toPersianDigits(animeWatched)} label="انیمه دیده" />
      </div>

      <div className="mx-4">
        <ProfileFollowButton
          viewerId={user?.id}
          targetId={telegramUserId}
          apiEnabled
          isFollowing={data.relationship?.is_following === true}
        />
      </div>

      <ProfileOverviewStrip data={overview} fullStatsTo={null} />

      {translator ? (
        <ProfileTranslationsRail translator={translator} profileUserId={telegramUserId} />
      ) : null}

      <div className="mx-4 mt-6">
        <ProfileBadgesStrip badges={data.badges} />
      </div>

      <div className="mx-4 mt-6">
        <ExploreTabBar tabs={[...PROFILE_TABS]} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mx-4 mt-4">
        {activeTab === 'stats' ? (
          <div className="-mx-4">
            <ProfileSocialWatchedRail items={watchedItems} />
          </div>
        ) : null}
        {activeTab === 'feed' ? <ProfileFeedPanel enabled /> : null}
        {activeTab === 'personal' ? (
          <ProfilePersonalPanel translator={translator} variant="public" />
        ) : null}
      </div>
    </div>
  )
}

export default PublicUserProfile
