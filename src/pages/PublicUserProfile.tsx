import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { useAppAuth } from '../hooks/useAppAuth'
import { useSocialProfileUser } from '../hooks/useSocialProfile'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFollowButton } from '@/components/profile/ProfileFollowButton'
import { ProfileIdentityHeader } from '@/components/profile/ProfileIdentityHeader'
import { ProfileInlineMetrics } from '@/components/profile/ProfileInlineMetrics'
import { ProfileShowcaseStrip } from '@/components/profile/ProfileShowcaseStrip'
import { ProfileShareButton } from '@/components/profile/ProfileShareButton'
import { ProfileSocialActionsSheet } from '@/components/profile/ProfileSocialActionsSheet'
import { ProfileMainTabBar } from '@/components/profile/ProfileMainTabBar'
import { ProfileActivityTabPanel } from '@/components/profile/ProfileActivityTabPanel'
import { ProfileStatsAndBadgesTabPanel } from '@/components/profile/ProfileStatsAndBadgesTabPanel'
import { ProfileLibraryTabPanel } from '@/components/profile/ProfileLibraryTabPanel'
import {
  isAllowedProfileTab,
  isLegacyProfileTab,
  legacyProfileRedirectPath,
} from '@/components/profile/profileTabs'
import { useProfileTabParam } from '@/hooks/useProfileTabParam'
import { usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { formatProfileMemberSince } from '@/lib/profileMemberSince'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
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

const PublicUserProfile = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const telegramUserId = rawId?.trim() ?? ''
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const canFetchProfile = isReady && (inTelegram || Boolean(user))
  const { data, isLoading, isError } = useSocialProfileUser(
    telegramUserId,
    canFetchProfile
  )
  const { rawTab, activeTab, librarySection, setActiveTab, setLibrarySection } =
    useProfileTabParam()
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const { data: publicListsData } = usePublicCustomListsQuery(
    telegramUserId,
    canFetchProfile && telegramUserId.length > 0
  )
  const hasPublicPlaylists = (publicListsData?.lists?.length ?? 0) > 0

  const profileBase = `/u/${encodeURIComponent(telegramUserId)}`

  const displayName = data?.profile?.display_name ?? 'کاربر'
  const initials = useMemo(() => getInitials(displayName), [displayName])
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
    return {
      watchHours: 0,
      byFormat: [] as Array<{ format: string; count: number; episodes_watched: number }>,
    }
  }, [data])

  const favoriteListItems = useMemo(
    () => (data?.watched?.items ?? []).filter((item) => item.is_favorite === true),
    [data?.watched?.items]
  )

  if (rawTab === 'feed') {
    return <Navigate to="/feed" replace />
  }

  if (isLegacyProfileTab(rawTab)) {
    return <Navigate to={legacyProfileRedirectPath(rawTab, profileBase)} replace />
  }

  const initialProfileLoad = canFetchProfile && isLoading && !data

  if (!isReady) {
    return <ProfilePageSkeleton />
  }

  if (initialProfileLoad) {
    return <ProfilePageSkeleton />
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
          title="پروفایل در دسترس نیست"
          subtitle="این پروفایل اجتماعی را نمی‌توانی ببینی؛ ممکن است برای تو هنوز شبکه اجتماعی فعال نشده باشد."
        />
        <Link to="/profile" className="mt-6 block text-center text-sm font-medium text-primary-400">
          برگشت به پروفایل من
        </Link>
      </div>
    )
  }

  if (!data?.enabled || !data.profile) {
    return <ProfilePageSkeleton />
  }

  if (
    !isAllowedProfileTab(activeTab, {
      isOwnProfile: false,
      hasPublicPlaylists,
    })
  ) {
    return <Navigate to={profileBase} replace />
  }

  const followers = data.profile.followers_count ?? 0
  const following = data.profile.following_count ?? 0
  const animeWatched = data.summary?.anime_count ?? 0
  const roleBadges = data.profile.role_badges ?? []
  const translator = data.translator ?? null
  const watchedItems = data.watched?.items ?? []
  const memberSinceLabel = formatProfileMemberSince(data.profile.member_since)
  const watchVisible = !data.privacy?.watch_activity_hidden

  const translationsHref = translator
    ? `/u/${encodeURIComponent(telegramUserId)}/translations`
    : null

  const metrics = [
    {
      value: toPersianDigits(followers),
      label: 'دنبال‌کننده',
      to: `${profileBase}/followers`,
    },
    {
      value: toPersianDigits(following),
      label: 'دنبال‌شده',
      to: `${profileBase}/following`,
    },
    {
      value: toPersianDigits(animeWatched),
      label: 'انیمه',
    },
  ]

  return (
    <div className="relative bg-background pb-24 text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary-400/10 to-transparent" />

      <div className="relative z-10 flex items-center justify-between px-4 pt-3">
        <ProfileShareButton
          telegramUserId={telegramUserId}
          displayName={displayName}
        />
        {user ? (
          <button
            type="button"
            aria-label="گزینه‌های کاربر"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/90 text-muted-foreground active:scale-95"
            onClick={() => setActionsOpen(true)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        ) : (
          <span className="w-9" aria-hidden />
        )}
      </div>

      <ProfileIdentityHeader
        className="mt-4"
        displayName={displayName}
        avatarUrl={avatarUrl}
        initials={initials}
        memberSinceLabel={memberSinceLabel}
        roleBadges={roleBadges}
        translationsHref={translationsHref}
        onAvatarError={() => setAvatarFailed(true)}
        footer={
          <ProfileFollowButton
            viewerId={user?.id}
            targetId={telegramUserId}
            apiEnabled
            isFollowing={data.relationship?.is_following === true}
            followsYou={data.relationship?.follows_you === true}
          />
        }
      />

      <ProfileInlineMetrics className="mt-4 px-4" metrics={metrics} />

      <ProfileShowcaseStrip
        className="mt-4"
        variant="public"
        previewBadges={data.badges}
        badgesSummary={data.badges_summary}
        displayName={displayName}
        targetUserId={telegramUserId}
      />

      <div className="mx-4 mt-5">
        <ProfileMainTabBar active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mx-4 mt-3">
        {activeTab === 'library' ? (
          <ProfileLibraryTabPanel
            variant="public"
            section={librarySection}
            onSectionChange={setLibrarySection}
            showPlaylistsChip={hasPublicPlaylists}
            profileUserId={telegramUserId}
            profileBase={profileBase}
            watchedItems={watchedItems}
            favoriteListItems={favoriteListItems}
            watchVisible={watchVisible}
          />
        ) : null}
        {activeTab === 'activity' ? (
          <ProfileActivityTabPanel
            variant="public"
            profileUserId={telegramUserId}
            watchedItems={watchedItems}
            recentRestoreKey={`public-${telegramUserId}-recent`}
            watchVisible={watchVisible}
          />
        ) : null}
        {activeTab === 'stats' ? (
          <ProfileStatsAndBadgesTabPanel
            variant="public"
            overview={overview}
            topGenres={data.top_genres ?? []}
            publicExtras={
              watchVisible
                ? {
                    profileUserId: telegramUserId,
                    translator,
                    displayName,
                    hideTranslatorDupes: Boolean(translator),
                  }
                : undefined
            }
          />
        ) : null}
      </div>

      {user ? (
        <ProfileSocialActionsSheet
          open={actionsOpen}
          onOpenChange={setActionsOpen}
          targetTelegramUserId={telegramUserId}
          displayName={displayName}
          isMuted={data.relationship?.is_muted === true}
          blockedByYou={data.relationship?.blocked_by_you === true}
        />
      ) : null}
    </div>
  )
}

export default PublicUserProfile
