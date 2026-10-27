import { useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '../hooks/useAppAuth'
import { useUserAnimeList } from '../hooks/useUserAnimeList'
import { useSocialProfileMe } from '../hooks/useSocialProfile'
import { useFavoriteAnimeCardsQuery } from '../hooks/queries/useAnimeQueries'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFollowButton } from '@/components/profile/ProfileFollowButton'
import { ProfilePersonalPanel } from '@/components/profile/ProfilePersonalPanel'
import { ProfileStatCell } from '@/components/profile/ProfileStatCell'
import { ProfileStatsTabPanel } from '@/components/profile/ProfileStatsTabPanel'
import { ProfileWatchTabPanel } from '@/components/profile/ProfileWatchTabPanel'
import { ProfileBadgeTeaser } from '@/components/profile/ProfileBadgeTeaser'
import { ProfileBadgesSection } from '@/components/profile/ProfileBadgesSection'
import {
  buildOwnProfileTabs,
  isDefaultProfileTab,
  parseProfileTab,
  type ProfileTabId,
} from '@/components/profile/profileTabs'
import { ProfilePlaylistsTabPanel } from '@/components/profile/ProfilePlaylistsTabPanel'
import { useCustomLists } from '@/hooks/useCustomLists'
import { ExploreTabBar } from '@/components/explore/ExploreUi'
import { mergeOwnProfileHeaderStats } from '@/lib/ownProfileStats'
import { formatProfileMemberSince } from '@/lib/profileMemberSince'
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

import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton'

const Profile = () => {
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const { stats, favoriteAnime } = useUserAnimeList({ syncRemoteList: false })
  const { customLists } = useCustomLists({ syncRemote: false })
  const hasPublicPlaylists = useMemo(
    () => customLists.some((list) => list.isPublic === true),
    [customLists]
  )
  const profileTabs = useMemo(() => buildOwnProfileTabs(hasPublicPlaylists), [hasPublicPlaylists])
  const { data: favoriteCards = [] } = useFavoriteAnimeCardsQuery(favoriteAnime)
  const { data: socialProfile, isLoading: socialProfileLoading } = useSocialProfileMe(
    Boolean(user)
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [avatarFailed, setAvatarFailed] = useState(false)

  const rawTab = searchParams.get('tab')
  const activeTab = parseProfileTab(rawTab)

  const setActiveTab = (tab: ProfileTabId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (isDefaultProfileTab(tab)) next.delete('tab')
        else next.set('tab', tab)
        return next
      },
      { replace: true }
    )
  }

  const displayName =
    socialProfile?.profile?.display_name?.trim() || user?.displayName || 'کاربر'
  const initials = useMemo(() => getInitials(displayName), [displayName])
  const avatarUrl = user?.photoUrl && !avatarFailed ? user.photoUrl : null
  const showWebAuth = !inTelegram && !user

  const mergedStats = useMemo(
    () => mergeOwnProfileHeaderStats(socialProfile, stats, socialProfileLoading),
    [socialProfile, stats, socialProfileLoading]
  )

  const statDigits = (n: number | null) =>
    n == null ? '—' : toPersianDigits(n)

  const roleBadges = socialProfile?.profile?.role_badges ?? []
  const favoriteListItems = useMemo(() => {
    const byId = new Map(favoriteCards.map((card) => [String(card.id), card]))
    return favoriteAnime
      .map((id) => byId.get(String(id)))
      .filter((card): card is NonNullable<typeof card> => Boolean(card))
      .map((card) => ({
        anime_id: String(card.id),
        slug: card.slug ?? null,
        title: card.title,
        image: card.image,
        episodes_watched: 0,
        episodes_total: null,
        user_rating: null,
        is_favorite: true,
        updated_at: '',
      }))
  }, [favoriteAnime, favoriteCards])
  const watchedItems = socialProfile?.watched?.items ?? []
  const memberSinceLabel = formatProfileMemberSince(socialProfile?.profile?.member_since)
  const showSocialWatch = socialProfile?.enabled === true

  const overview = useMemo(
    () => ({
      watchHours: mergedStats.watchHours,
      byFormat: mergedStats.byFormat,
    }),
    [mergedStats.watchHours, mergedStats.byFormat]
  )

  if (rawTab === 'feed') {
    return <Navigate to="/feed" replace />
  }

  const tabAllowed =
    activeTab === 'watch' ||
    activeTab === 'stats' ||
    activeTab === 'personal' ||
    (activeTab === 'playlists' && hasPublicPlaylists)

  if (!isReady) {
    return <ProfilePageSkeleton />
  }

  if (!tabAllowed) {
    return <Navigate to="/profile" replace />
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

        <div className="relative z-10 flex flex-col items-center px-4 pb-2 pt-24">
          <div className="relative flex w-full justify-center">
            <Button
              asChild
              type="button"
              variant="outline"
              size="icon-sm"
              className="absolute left-0 top-0 z-20 surface-skeuo border-border/60 text-muted-foreground hover:text-foreground"
            >
              <Link to="/profile/settings" aria-label="تنظیمات">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>

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

          {memberSinceLabel ? (
            <p className="mt-1 text-center text-xs text-muted-foreground">{memberSinceLabel}</p>
          ) : null}

          {user?.email && !inTelegram ? (
            <p className="mt-1 text-left text-sm text-muted-foreground" dir="ltr">
              {user.email}
            </p>
          ) : null}

          {roleBadges.length > 0 ? (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {roleBadges.map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center rounded-full border border-primary-400/30 bg-primary-400/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-400"
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
          to="/profile/followers"
          value={statDigits(mergedStats.followers)}
          label="دنبال‌کننده"
        />
        <ProfileStatCell
          to="/profile/following"
          value={statDigits(mergedStats.following)}
          label="دنبال‌شده"
        />
        <ProfileStatCell
          to="/profile/stats"
          value={statDigits(mergedStats.animeCount)}
          label="انیمه دیده"
        />
      </div>

      <div className="mx-4">
        <ProfileFollowButton viewerId={user?.id} targetId={user?.id} />
      </div>

      <ProfileBadgeTeaser
        variant="own"
        badgesSummary={socialProfile?.badges_summary}
        previewBadges={socialProfile?.badges}
      />

      <div className="mx-4 mt-6">
        <ExploreTabBar tabs={[...profileTabs]} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mx-4 mt-4">
        {activeTab === 'watch' ? (
          <ProfileWatchTabPanel
            variant="own"
            watchedItems={showSocialWatch ? watchedItems : []}
            favoriteListItems={favoriteListItems}
            favoriteOrderIds={favoriteAnime}
            profileBase="/profile"
            recentRestoreKey="own-profile-recent"
          />
        ) : null}
        {activeTab === 'stats' ? (
          <ProfileStatsTabPanel
            variant="own"
            overview={overview}
            fullStatsTo="/profile/stats"
            badgesSection={
              <ProfileBadgesSection
                variant="own"
                badgesSummary={socialProfile?.badges_summary}
                previewBadges={socialProfile?.badges}
              />
            }
          />
        ) : null}
        {activeTab === 'playlists' && user?.id != null ? (
          <ProfilePlaylistsTabPanel
            variant="own"
            profileUserId={String(user.id)}
            profileBase="/profile"
          />
        ) : null}
        {activeTab === 'personal' ? (
          <ProfilePersonalPanel
            translator={socialProfile?.translator ?? null}
            profileUserId={user?.id != null ? String(user.id) : undefined}
          />
        ) : null}
      </div>
    </div>
  )
}

export default Profile
