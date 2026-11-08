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
import { ProfileAccountSheet } from '@/components/profile/ProfileAccountSheet'
import { ProfileActivitiesTabPanel } from '@/components/profile/ProfileActivitiesTabPanel'
import { ProfileBadgesHeaderStrip } from '@/components/profile/ProfileBadgesHeaderStrip'
import {
  getProfileInitials,
  ProfileHeroHeader,
} from '@/components/profile/ProfileHeroHeader'
import { ProfileSocialStatsRow } from '@/components/profile/ProfileSocialStatsRow'
import { ProfileStatsTabPanel } from '@/components/profile/ProfileStatsTabPanel'
import { ProfileSubTabBar } from '@/components/profile/ProfileSubTabBar'
import { ProfileTranslationsTabPanel } from '@/components/profile/ProfileTranslationsTabPanel'
import {
  buildActivitiesSubTabs,
  buildStatsSubTabs,
  type ProfileActivitiesSubTabId,
  type ProfileStatsSubTabId,
} from '@/components/profile/profileSubTabs'
import {
  buildOwnProfileTabs,
  parseProfileTabQuery,
  serializeProfileTabQuery,
  type ProfilePrimaryTabId,
  type ProfileTabQuery,
} from '@/components/profile/profileTabs'
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
  const { data: favoriteCards = [], isLoading: favoriteCardsLoading } =
    useFavoriteAnimeCardsQuery(favoriteAnime)
  const { data: socialProfile, isLoading: socialProfileLoading } = useSocialProfileMe(
    Boolean(user)
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const hasTranslator = Boolean(socialProfile?.translator)
  const profileTabs = useMemo(() => buildOwnProfileTabs(hasTranslator), [hasTranslator])
  const activitiesSubTabs = useMemo(
    () => buildActivitiesSubTabs({ includePlaylists: hasPublicPlaylists }),
    [hasPublicPlaylists]
  )
  const statsSubTabs = useMemo(() => buildStatsSubTabs(), [])

  const tabQuery = parseProfileTabQuery(
    searchParams.get('tab'),
    searchParams.get('sub')
  )
  const activeTab = tabQuery.primary
  const activitiesSub = tabQuery.activitiesSub
  const statsSub = tabQuery.statsSub

  const applyTabQuery = (next: ProfileTabQuery) => {
    withViewTransition(() => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.delete('tab')
          params.delete('sub')
          const serialized = serializeProfileTabQuery(next, { hasTranslator })
          if (serialized.tab) params.set('tab', serialized.tab)
          if (serialized.sub) params.set('sub', serialized.sub)
          return params
        },
        { replace: true }
      )
    })
  }

  const setActiveTab = (tab: ProfilePrimaryTabId) => {
    applyTabQuery({
      primary: tab,
      activitiesSub,
      statsSub,
    })
  }

  const setActivitiesSub = (sub: ProfileActivitiesSubTabId) => {
    applyTabQuery({
      primary: 'activities',
      activitiesSub: sub,
      statsSub,
    })
  }

  const setStatsSub = (sub: ProfileStatsSubTabId) => {
    applyTabQuery({
      primary: 'stats',
      activitiesSub,
      statsSub: sub,
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

  if (searchParams.get('tab') === 'feed') {
    return <Navigate to="/feed" replace />
  }

  if (activeTab === 'translations' && !hasTranslator) {
    return <Navigate to="/profile" replace />
  }

  if (
    activeTab === 'activities' &&
    activitiesSub === 'playlists' &&
    !hasPublicPlaylists
  ) {
    return <Navigate to="/profile" replace />
  }

  if (!isReady) {
    return <ProfilePageSkeleton variant="own" />
  }

  if (showWebAuth) {
    return (
      <div className="pb-24 px-4 pt-10">
        <ProfileAuthPanel login={login} register={register} layout="page" />
      </div>
    )
  }

  const profileUserId = user?.id != null ? String(user.id) : ''

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
              type="button"
              variant="outline"
              size="icon-sm"
              className="surface-skeuo border-border/60 text-muted-foreground hover:text-foreground"
              aria-label="حساب من و تنظیمات"
              onClick={() => setAccountOpen(true)}
            >
              <Settings className="h-4 w-4" />
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

      <ProfileBadgesHeaderStrip
        variant="own"
        badgesSummary={socialProfile?.badges_summary}
        previewBadges={socialProfile?.badges}
        isLoading={socialProfileLoading}
      />

      <ProfileTabSwipeShell
        tabs={profileTabs}
        active={activeTab}
        onChange={setActiveTab}
        panelClassName="!mx-0"
      >
        {activeTab === 'activities' ? (
          <div className="space-y-3">
            <div className="mx-4">
              <ProfileSubTabBar
                tabs={activitiesSubTabs}
                active={activitiesSub}
                onChange={setActivitiesSub}
              />
            </div>
            <ProfileActivitiesTabPanel
              variant="own"
              subTab={activitiesSub}
              profileUserId={profileUserId}
              profileBase="/profile"
              watchedItems={showSocialWatch ? watchedItems : []}
              watchLoading={socialProfileLoading && showSocialWatch}
            />
          </div>
        ) : null}
        {activeTab === 'stats' ? (
          <div className="space-y-3">
            <div className="mx-4">
              <ProfileSubTabBar tabs={statsSubTabs} active={statsSub} onChange={setStatsSub} />
            </div>
            <ProfileStatsTabPanel
              variant="own"
              subTab={statsSub}
              overview={overview}
              isLoading={socialProfileLoading}
              watchAnimeCount={mergedStats.animeCount}
              favoriteListItems={favoriteListItems}
              favoriteOrderIds={favoriteAnime}
              favoritesTotal={favoriteAnime.length}
              profileBase="/profile"
              favoritesLoading={favoriteAnime.length > 0 && favoriteCardsLoading}
              topGenres={mergedStats.topGenres}
            />
          </div>
        ) : null}
        {activeTab === 'translations' && socialProfile?.translator ? (
          <ProfileTranslationsTabPanel
            translator={socialProfile.translator}
            profileUserId={profileUserId}
            isLoading={socialProfileLoading}
          />
        ) : null}
      </ProfileTabSwipeShell>

      <ProfileAccountSheet
        open={accountOpen}
        onOpenChange={setAccountOpen}
        displayName={displayName}
        roleLabel={socialProfile?.translator?.name ?? null}
      />
    </div>
  )
}

export default Profile
