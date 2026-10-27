import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LayoutGrid, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '../hooks/useAppAuth'
import { useUserAnimeList } from '../hooks/useUserAnimeList'
import { useSocialProfileMe } from '../hooks/useSocialProfile'
import { useFavoriteAnimeCardsQuery } from '../hooks/queries/useAnimeQueries'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileIdentityHeader } from '@/components/profile/ProfileIdentityHeader'
import { ProfileInlineMetrics } from '@/components/profile/ProfileInlineMetrics'
import { ProfileShowcaseStrip } from '@/components/profile/ProfileShowcaseStrip'
import { ProfileMainTabBar } from '@/components/profile/ProfileMainTabBar'
import { ProfileActivityTabPanel } from '@/components/profile/ProfileActivityTabPanel'
import { ProfileStatsAndBadgesTabPanel } from '@/components/profile/ProfileStatsAndBadgesTabPanel'
import { ProfileLibraryTabPanel } from '@/components/profile/ProfileLibraryTabPanel'
import { ProfileWatchingRail } from '@/components/profile/ProfileWatchingRail'
import { ProfileToolsSheet } from '@/components/profile/ProfileToolsSheet'
import {
  isAllowedProfileTab,
  isLegacyProfileTab,
  legacyProfileRedirectPath,
} from '@/components/profile/profileTabs'
import { useProfileTabParam } from '@/hooks/useProfileTabParam'
import { mergeOwnProfileHeaderStats } from '@/lib/ownProfileStats'
import { formatProfileMemberSince } from '@/lib/profileMemberSince'
import { toPersianDigits } from '@/lib/persianDigits'
import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton'

const getInitials = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return 'ک'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`
  }
  return trimmed.charAt(0)
}

const Profile = () => {
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const { stats, favoriteAnime } = useUserAnimeList({ syncRemoteList: false })
  const { data: favoriteCards = [] } = useFavoriteAnimeCardsQuery(favoriteAnime)
  const { data: socialProfile, isLoading: socialProfileLoading } = useSocialProfileMe(
    Boolean(user)
  )
  const { rawTab, activeTab, librarySection, setActiveTab, setLibrarySection } =
    useProfileTabParam()
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  const displayName =
    socialProfile?.profile?.display_name?.trim() || user?.displayName || 'کاربر'
  const initials = useMemo(() => getInitials(displayName), [displayName])
  const avatarUrl = user?.photoUrl && !avatarFailed ? user.photoUrl : null
  const showWebAuth = !inTelegram && !user

  const mergedStats = useMemo(
    () => mergeOwnProfileHeaderStats(socialProfile, stats, socialProfileLoading),
    [socialProfile, stats, socialProfileLoading]
  )

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

  const translationsHref =
    socialProfile?.translator && user?.id != null
      ? `/u/${encodeURIComponent(String(user.id))}/translations`
      : null

  const metrics = useMemo(
    () => [
      {
        value: mergedStats.followers == null ? '—' : toPersianDigits(mergedStats.followers),
        label: 'دنبال‌کننده',
        to: '/profile/followers',
      },
      {
        value: mergedStats.following == null ? '—' : toPersianDigits(mergedStats.following),
        label: 'دنبال‌شده',
        to: '/profile/following',
      },
      {
        value: toPersianDigits(mergedStats.animeCount),
        label: 'انیمه',
        to: '/profile/stats',
      },
    ],
    [mergedStats.followers, mergedStats.following, mergedStats.animeCount]
  )

  if (rawTab === 'feed') {
    return <Navigate to="/feed" replace />
  }

  if (isLegacyProfileTab(rawTab)) {
    return <Navigate to={legacyProfileRedirectPath(rawTab)} replace />
  }

  const tabAllowed = isAllowedProfileTab(activeTab, {
    isOwnProfile: true,
    hasPublicPlaylists: true,
  })

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
    <div className="relative bg-background pb-24 text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary-400/10 to-transparent" />

      <div className="relative z-10 flex items-center justify-between px-4 pt-3">
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
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="surface-skeuo border-border/60 text-muted-foreground hover:text-foreground"
          aria-label="ابزارهای پروفایل"
          onClick={() => setToolsOpen(true)}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      <ProfileIdentityHeader
        className="mt-4"
        displayName={displayName}
        avatarUrl={avatarUrl}
        initials={initials}
        memberSinceLabel={memberSinceLabel}
        roleBadges={roleBadges}
        translationsHref={translationsHref}
        translationsLabel="ترجمه‌هام"
        onAvatarError={() => setAvatarFailed(true)}
        footer={
          user?.email && !inTelegram ? (
            <p className="text-left text-xs text-muted-foreground" dir="ltr">
              {user.email}
            </p>
          ) : null
        }
      />

      <ProfileInlineMetrics className="mt-4 px-4" metrics={metrics} />

      <ProfileShowcaseStrip
        className="mt-4"
        variant="own"
        previewBadges={socialProfile?.badges}
        badgesSummary={socialProfile?.badges_summary}
        displayName={displayName}
      />

      <div className="mt-5">
        <ProfileWatchingRail />
      </div>

      <div className="mx-4 mt-5">
        <ProfileMainTabBar active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mx-4 mt-3">
        {activeTab === 'library' && user?.id != null ? (
          <ProfileLibraryTabPanel
            variant="own"
            section={librarySection}
            onSectionChange={setLibrarySection}
            showPlaylistsChip
            profileUserId={String(user.id)}
            profileBase="/profile"
            watchedItems={watchedItems}
            favoriteListItems={favoriteListItems}
            favoriteOrderIds={favoriteAnime}
          />
        ) : null}
        {activeTab === 'activity' ? (
          <ProfileActivityTabPanel
            variant="own"
            watchedItems={showSocialWatch ? watchedItems : []}
            recentRestoreKey="own-profile-recent"
          />
        ) : null}
        {activeTab === 'stats' ? (
          <ProfileStatsAndBadgesTabPanel
            variant="own"
            overview={overview}
            topGenres={mergedStats.topGenres}
            fullStatsTo="/profile/stats"
            showBadgeTeaser
          />
        ) : null}
      </div>

      <ProfileToolsSheet
        open={toolsOpen}
        onOpenChange={setToolsOpen}
        translator={socialProfile?.translator ?? null}
        profileUserId={user?.id != null ? String(user.id) : undefined}
      />
    </div>
  )
}

export default Profile
