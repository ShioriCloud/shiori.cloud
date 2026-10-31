import { useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { useAppAuth } from '../hooks/useAppAuth'
import { useNotifications } from '../hooks/useNotifications'
import { useUserAnimeList } from '../hooks/useUserAnimeList'
import { useSocialProfileMe } from '../hooks/useSocialProfile'
import { useFavoriteAnimeCardsQuery } from '../hooks/queries/useAnimeQueries'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFollowButton } from '@/components/profile/ProfileFollowButton'
import { ProfilePersonalPanel } from '@/components/profile/ProfilePersonalPanel'
import { ProfileBadgesShowcase } from '@/components/profile/ProfileBadgesShowcase'
import {
  getProfileInitials,
  ProfileHeroHeader,
} from '@/components/profile/ProfileHeroHeader'
import { ProfileTranslationsRail } from '@/components/profile/ProfileTranslationsRail'
import { ProfileSocialStatsRow } from '@/components/profile/ProfileSocialStatsRow'
import { ProfileStatsTabPanel } from '@/components/profile/ProfileStatsTabPanel'
import { ProfileWatchTabPanel } from '@/components/profile/ProfileWatchTabPanel'
import {
  buildOwnProfileTabs,
  isDefaultProfileTab,
  parseProfileTab,
  type ProfileTabId,
} from '@/components/profile/profileTabs'
import { ProfilePlaylistsTabPanel } from '@/components/profile/ProfilePlaylistsTabPanel'
import { useCustomLists } from '@/hooks/useCustomLists'
import { ProfileTabSwipeShell } from '@/components/profile/ProfileTabSwipeShell'
import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton'
import { mergeOwnProfileHeaderStats } from '@/lib/ownProfileStats'
import { formatProfileMemberSince } from '@/lib/profileMemberSince'
import { toPersianDigits } from '@/lib/persianDigits'
import { withViewTransition } from '@/lib/viewTransition'

const Profile = () => {
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const { stats, favoriteAnime } = useUserAnimeList({ syncRemoteList: false })
  const { customLists } = useCustomLists({ syncRemote: false })
  const { unreadCount } = useNotifications()
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
    withViewTransition(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (isDefaultProfileTab(tab)) next.delete('tab')
          else next.set('tab', tab)
          return next
        },
        { replace: true }
      )
    })
  }

  const displayName =
    socialProfile?.profile?.display_name?.trim() || user?.displayName || 'کاربر'
  const initials = useMemo(() => getProfileInitials(displayName), [displayName])
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
      <ProfileHeroHeader
        displayName={displayName}
        initials={initials}
        avatarUrl={avatarUrl}
        memberSinceLabel={memberSinceLabel}
        roleBadges={roleBadges}
        onAvatarError={() => setAvatarFailed(true)}
        leftAction={
          <ButtonGroup orientation="vertical" aria-label="میانبرهای پروفایل">
            <Button
              asChild
              type="button"
              variant="outline"
              size="icon-sm"
              className="relative surface-skeuo border-border/60 text-muted-foreground hover:text-foreground"
            >
              <Link
                to="/notifications"
                aria-label={
                  unreadCount > 0
                    ? `اعلان‌ها، ${toPersianDigits(unreadCount)} خوانده‌نشده`
                    : 'اعلان‌ها'
                }
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[9px] font-bold leading-none text-white">
                    {unreadCount > 9 ? '۹+' : toPersianDigits(unreadCount)}
                  </span>
                ) : null}
              </Link>
            </Button>
            <Button
              asChild
              type="button"
              variant="outline"
              size="icon-sm"
              className="surface-skeuo border-border/60 text-muted-foreground hover:text-foreground"
            >
              <Link to="/profile/settings" aria-label="تنظیمات">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </ButtonGroup>
        }
        subtitle={
          user?.email && !inTelegram ? (
            <p className="mt-1 text-left text-sm text-muted-foreground" dir="ltr">
              {user.email}
            </p>
          ) : null
        }
      />

      <ProfileSocialStatsRow
        metrics={[
          {
            to: '/profile/followers',
            value: statDigits(mergedStats.followers),
            label: 'دنبال‌کننده',
          },
          {
            to: '/profile/following',
            value: statDigits(mergedStats.following),
            label: 'دنبال‌شده',
          },
          {
            to: '/profile/stats',
            value: statDigits(mergedStats.animeCount),
            label: 'انیمه دیده',
          },
        ]}
      />

      <ProfileFollowButton viewerId={user?.id} targetId={user?.id} className="mx-4" />

      {socialProfile?.translator && user?.id != null ? (
        <ProfileTranslationsRail
          translator={socialProfile.translator}
          profileUserId={String(user.id)}
          title="ترجمه‌هام"
          className="!mt-3"
        />
      ) : null}

      <ProfileBadgesShowcase
        variant="own"
        badgesSummary={socialProfile?.badges_summary}
        previewBadges={socialProfile?.badges}
        className={socialProfile?.translator ? 'mt-2.5' : 'mt-3'}
      />

      <ProfileTabSwipeShell tabs={profileTabs} active={activeTab} onChange={setActiveTab}>
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
            hideTranslatorLink={Boolean(socialProfile?.translator)}
          />
        ) : null}
      </ProfileTabSwipeShell>
    </div>
  )
}

export default Profile
