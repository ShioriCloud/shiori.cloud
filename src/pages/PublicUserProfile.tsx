import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { MoreHorizontal } from 'lucide-react'
import { useAppAuth } from '../hooks/useAppAuth'
import { useSocialProfileUser } from '../hooks/useSocialProfile'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileTranslationsRail } from '@/components/profile/ProfileTranslationsRail'
import { ProfileFollowButton } from '@/components/profile/ProfileFollowButton'
import { ProfileStatCell } from '@/components/profile/ProfileStatCell'
import { ProfileHeaderBadgeOrbit } from '@/components/profile/ProfileHeaderBadgeOrbit'
import { ProfileShareButton } from '@/components/profile/ProfileShareButton'
import { ProfileSocialActionsSheet } from '@/components/profile/ProfileSocialActionsSheet'
import { ProfileDualRowTabBar } from '@/components/profile/ProfileDualRowTabBar'
import { ProfileActivityTabPanel } from '@/components/profile/ProfileActivityTabPanel'
import { ProfileStatsOverviewPanel } from '@/components/profile/ProfileStatsOverviewPanel'
import { ProfileWatchingTabPanel } from '@/components/profile/ProfileWatchingTabPanel'
import { ProfileFavoritesTabPanel } from '@/components/profile/ProfileFavoritesTabPanel'
import { isAllowedProfileTab } from '@/components/profile/profileTabs'
import { useProfileTabParam } from '@/hooks/useProfileTabParam'
import { ProfilePlaylistsTabPanel } from '@/components/profile/ProfilePlaylistsTabPanel'
import { usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { formatProfileMemberSince } from '@/lib/profileMemberSince'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
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

import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton'

const PublicUserProfile = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const telegramUserId = rawId?.trim() ?? ''
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const canFetchProfile = isReady && (inTelegram || Boolean(user))
  const { data, isLoading, isError } = useSocialProfileUser(
    telegramUserId,
    canFetchProfile
  )
  const { rawTab, activeTab, setActiveTab } = useProfileTabParam()
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
    return { watchHours: 0, byFormat: [] as Array<{ format: string; count: number; episodes_watched: number }> }
  }, [data])

  const favoriteListItems = useMemo(
    () => (data?.watched?.items ?? []).filter((item) => item.is_favorite === true),
    [data?.watched?.items]
  )

  if (rawTab === 'feed') {
    return <Navigate to="/feed" replace />
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

  const avatarBlock = (
    <div className="media-card-skeuo h-24 w-24 rounded-2xl shrink-0">
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
  )

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
            {user ? (
              <button
                type="button"
                aria-label="گزینه‌های کاربر"
                className="absolute right-0 top-0 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/90 text-muted-foreground active:scale-95"
                onClick={() => setActionsOpen(true)}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            ) : null}

            <ProfileHeaderBadgeOrbit
              variant="public"
              previewBadges={data.badges}
              displayName={displayName}
              targetUserId={telegramUserId}
            >
              {avatarBlock}
            </ProfileHeaderBadgeOrbit>
          </div>

          <h1 className="mt-3 line-clamp-2 px-2 text-center text-lg font-bold text-foreground">
            {displayName}
          </h1>

          {memberSinceLabel ? (
            <p className="mt-1 text-center text-xs text-muted-foreground">{memberSinceLabel}</p>
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
          followsYou={data.relationship?.follows_you === true}
        />
      </div>

      {data.translator ? (
        <ProfileTranslationsRail
          translator={data.translator}
          profileUserId={telegramUserId}
        />
      ) : null}

      <div className="mx-4 mt-6">
        <ProfileDualRowTabBar
          active={activeTab}
          onChange={setActiveTab}
          isOwnProfile={false}
          hasPublicPlaylists={hasPublicPlaylists}
        />
      </div>

      <div className="mx-4 mt-4">
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
          <ProfileStatsOverviewPanel
            variant="public"
            overview={overview}
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
        {activeTab === 'watching' ? (
          <ProfileWatchingTabPanel
            variant="public"
            watchedItems={watchedItems}
            watchVisible={watchVisible}
          />
        ) : null}
        {activeTab === 'favorites' ? (
          <ProfileFavoritesTabPanel
            variant="public"
            items={favoriteListItems}
            profileBase={profileBase}
            watchVisible={watchVisible}
          />
        ) : null}
        {activeTab === 'playlists' ? (
          <ProfilePlaylistsTabPanel
            variant="public"
            profileUserId={telegramUserId}
            profileBase={profileBase}
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
