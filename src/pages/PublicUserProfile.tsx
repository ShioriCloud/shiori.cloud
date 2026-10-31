import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { useAppAuth } from '../hooks/useAppAuth'
import { useSocialProfileUser } from '../hooks/useSocialProfile'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { ProfileFollowButton } from '@/components/profile/ProfileFollowButton'
import { ProfileStatsTabPanel } from '@/components/profile/ProfileStatsTabPanel'
import { ProfileWatchTabPanel } from '@/components/profile/ProfileWatchTabPanel'
import { ProfileBadgesShowcase } from '@/components/profile/ProfileBadgesShowcase'
import {
  getProfileInitials,
  ProfileHeroHeader,
} from '@/components/profile/ProfileHeroHeader'
import { ProfileSocialStatsRow } from '@/components/profile/ProfileSocialStatsRow'
import { ProfileTranslationsRail } from '@/components/profile/ProfileTranslationsRail'
import { ProfileShareButton } from '@/components/profile/ProfileShareButton'
import { ProfileSocialActionsSheet } from '@/components/profile/ProfileSocialActionsSheet'
import {
  buildPublicProfileTabs,
  isDefaultProfileTab,
  parseProfileTab,
  type ProfileTabId,
} from '@/components/profile/profileTabs'
import { ProfilePlaylistsTabPanel } from '@/components/profile/ProfilePlaylistsTabPanel'
import { usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { formatProfileMemberSince } from '@/lib/profileMemberSince'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileTabSwipeShell } from '@/components/profile/ProfileTabSwipeShell'
import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton'
import { toPersianDigits } from '@/lib/persianDigits'
import { withViewTransition } from '@/lib/viewTransition'

const PublicUserProfile = () => {
  const { telegramUserId: rawId } = useParams<{ telegramUserId: string }>()
  const telegramUserId = rawId?.trim() ?? ''
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const canFetchProfile = isReady && (inTelegram || Boolean(user))
  const { data, isLoading, isError } = useSocialProfileUser(
    telegramUserId,
    canFetchProfile
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)

  const rawTab = searchParams.get('tab')
  const parsedTab = parseProfileTab(rawTab)
  const { data: publicListsData } = usePublicCustomListsQuery(
    telegramUserId,
    canFetchProfile && telegramUserId.length > 0
  )
  const hasPublicPlaylists = (publicListsData?.lists?.length ?? 0) > 0
  const profileTabs = useMemo(
    () => buildPublicProfileTabs(hasPublicPlaylists),
    [hasPublicPlaylists]
  )
  const activeTab: ProfileTabId =
    parsedTab === 'personal' ? 'watch' : parsedTab

  useEffect(() => {
    if (rawTab !== 'personal') return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('tab')
        return next
      },
      { replace: true }
    )
  }, [rawTab, setSearchParams])

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

  const profileBase = `/u/${encodeURIComponent(telegramUserId)}`

  const displayName = data?.profile?.display_name ?? 'کاربر'
  const initials = useMemo(() => getProfileInitials(displayName), [displayName])
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
          subtitle="این پروفایل را نمی‌توانی ببینی؛ ممکن است حساب مسدود باشد یا برای تو قابل نمایش نباشد."
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

  const followers = data.profile.followers_count ?? 0
  const following = data.profile.following_count ?? 0
  const animeWatched = data.summary?.anime_count ?? 0
  const roleBadges = data.profile.role_badges ?? []
  const translator = data.translator ?? null
  const watchedItems = data.watched?.items ?? []
  const memberSinceLabel = formatProfileMemberSince(data.profile.member_since)
  const watchVisible = !data.privacy?.watch_activity_hidden

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
          <ProfileShareButton
            telegramUserId={telegramUserId}
            displayName={displayName}
          />
        }
        rightAction={
          user ? (
            <button
              type="button"
              aria-label="گزینه‌های کاربر"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/90 text-muted-foreground active:scale-95"
              onClick={() => setActionsOpen(true)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          ) : null
        }
      />

      <ProfileSocialStatsRow
        metrics={[
          {
            to: `${profileBase}/followers`,
            value: toPersianDigits(followers),
            label: 'دنبال‌کننده',
          },
          {
            to: `${profileBase}/following`,
            value: toPersianDigits(following),
            label: 'دنبال‌شده',
          },
          { value: toPersianDigits(animeWatched), label: 'انیمه دیده' },
        ]}
      />

      <div className="px-4">
        <ProfileFollowButton
          viewerId={user?.id}
          targetId={telegramUserId}
          apiEnabled
          isFollowing={data.relationship?.is_following === true}
          followsYou={data.relationship?.follows_you === true}
        />
      </div>

      {translator ? (
        <ProfileTranslationsRail
          translator={translator}
          profileUserId={telegramUserId}
          title="ترجمه‌هاش"
          className="!mt-3"
        />
      ) : null}

      <ProfileBadgesShowcase
        variant="public"
        badgesSummary={data.badges_summary}
        previewBadges={data.badges}
        displayName={displayName}
        targetUserId={telegramUserId}
        className={translator ? 'mt-2.5' : 'mt-3'}
      />

      <ProfileTabSwipeShell tabs={profileTabs} active={activeTab} onChange={setActiveTab}>
        {activeTab === 'watch' ? (
          <ProfileWatchTabPanel
            variant="public"
            watchedItems={watchedItems}
            favoriteListItems={favoriteListItems}
            profileBase={profileBase}
            recentRestoreKey={`public-${telegramUserId}-recent`}
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
        {activeTab === 'stats' ? (
          <ProfileStatsTabPanel
            variant="public"
            overview={overview}
            fullStatsTo={null}
            watchVisible={watchVisible}
            publicExtras={{
              profileUserId: telegramUserId,
              translator,
              hideTranslatorDupes: Boolean(translator),
            }}
          />
        ) : null}
      </ProfileTabSwipeShell>

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
