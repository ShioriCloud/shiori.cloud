import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Heart, MessageSquareText, UserRound } from 'lucide-react'
import { PROFILE_PANEL_CLASS } from '@/components/profile/profileStatsCard'
import { SocialUserAvatar } from '@/components/profile/social/SocialUserAvatar'
import {
  formatNotificationMessage,
  resolveNotificationTarget,
} from '@/lib/notificationDisplay'
import { openTelegramDeepLink } from '@/lib/telegramOpenLink'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import { toPersianDigits } from '@/lib/persianDigits'
import { formatNotificationTime } from '@/utils/notificationTime'
import { hapticSelection } from '@/lib/telegramHaptics'
import { likeAnimeComment, unlikeAnimeComment } from '@/services/animeComments'
import { toggleSocialFeedLike } from '@/services/socialProfile'
import { showAppToast } from '@/store/appFeedbackStore'
import { cn } from '@/lib/utils'
import type { UserNotificationRow } from '@/types/notifications'

type NotificationCardProps = {
  notification: UserNotificationRow
  unreadBadgeClass: string
  onOpen: () => void
}

const kindVisual = (kind: string): { label: string; icon: ReactNode; tone: string } => {
  if (kind.includes('like')) {
    return {
      label: 'پسند',
      icon: <Heart className="size-4" aria-hidden />,
      tone: 'bg-rose-400/15 text-rose-700 dark:text-rose-200',
    }
  }
  if (kind.includes('comment') || kind.includes('reply') || kind.includes('note')) {
    return {
      label: 'نظر',
      icon: <MessageSquareText className="size-4" aria-hidden />,
      tone: 'bg-sky-400/15 text-sky-700 dark:text-sky-200',
    }
  }
  if (kind.includes('follow')) {
    return {
      label: 'دنبال‌کردن',
      icon: <UserRound className="size-4" aria-hidden />,
      tone: 'bg-violet-400/15 text-violet-700 dark:text-violet-200',
    }
  }
  return {
    label: 'قسمت',
    icon: <Bell className="size-4" aria-hidden />,
    tone: 'bg-amber-400/15 text-amber-800 dark:text-amber-200',
  }
}

const showsActor = (kind: string) => kind.includes('like') || kind.includes('follow')

const isCommentCard = (kind: string) =>
  kind.includes('comment') || kind.includes('reply') || kind.includes('note')

const MEDIA_RADIUS = 'rounded-lg'

export const NotificationCard = ({
  notification,
  unreadBadgeClass,
  onOpen,
}: NotificationCardProps) => {
  const coverSrc = resolveMediaServeUrl(notification.anime_cover_image)
  const target = resolveNotificationTarget(notification)
  const message = formatNotificationMessage(notification)
  const visual = kindVisual(notification.kind)
  const when = formatNotificationTime(notification.created_at)
  const useAvatar = showsActor(notification.kind) && !coverSrc
  const commentId = notification.comment_id?.trim() || ''
  const activityKey = notification.activity_key?.trim() || ''
  const commentText = isCommentCard(notification.kind)
    ? notification.content_body?.trim() || ''
    : ''
  const canLike = Boolean(commentId || activityKey)
  const [liked, setLiked] = useState(notification.liked_by_me === true)
  const [likeCount, setLikeCount] = useState(notification.like_count ?? 0)
  const [liking, setLiking] = useState(false)

  const shellClass = cn(
    PROFILE_PANEL_CLASS,
    'block overflow-hidden rounded-2xl',
    !notification.is_read && 'ring-1 ring-primary-400/40'
  )

  const openTarget = () => {
    hapticSelection()
    onOpen()
    if (!target) return
    if (target.startsWith('http://') || target.startsWith('https://')) {
      openTelegramDeepLink(target)
    }
  }

  const onLike = async () => {
    if (!canLike || liking) return
    hapticSelection()
    const next = !liked
    setLiked(next)
    setLikeCount((count) => Math.max(0, count + (next ? 1 : -1)))
    setLiking(true)
    try {
      const result = commentId
        ? next
          ? await likeAnimeComment(commentId)
          : await unlikeAnimeComment(commentId)
        : await toggleSocialFeedLike(activityKey)
      setLiked(result.liked_by_me)
      setLikeCount(result.like_count)
    } catch {
      setLiked(!next)
      setLikeCount((count) => Math.max(0, count + (next ? -1 : 1)))
      showAppToast('لایک ثبت نشد', 'error')
    } finally {
      setLiking(false)
    }
  }

  const media = (
      <div className="flex w-12 shrink-0 flex-col items-stretch gap-1.5">
        {coverSrc ? (
          <div className={cn('h-16 w-12 overflow-hidden bg-muted ring-1 ring-inset ring-border/70', MEDIA_RADIUS)}>
            <img src={coverSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ) : useAvatar ? (
          <SocialUserAvatar
            photoUrl={notification.actor_photo_url}
            displayName={notification.actor_display_name || 'کاربر'}
            size="md"
            className="!h-12 !w-12 !rounded-lg !ring-1"
          />
        ) : (
          <span className={cn('flex size-12 items-center justify-center', MEDIA_RADIUS, visual.tone)}>
            {visual.icon}
          </span>
        )}
        <span
          className={cn(
            'w-full truncate px-1 py-0.5 text-center text-[10px] font-medium leading-4',
            MEDIA_RADIUS,
            visual.tone
          )}
        >
          {visual.label}
        </span>
      </div>
  )

  const text = (
        <div className="min-w-0 flex-1 text-right">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-semibold leading-5 text-foreground">
            {toPersianDigits(notification.title)}
          </h3>
          {!notification.is_read ? <span className={cn(unreadBadgeClass, 'shrink-0')}>جدید</span> : null}
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-foreground/75">
          {toPersianDigits(message)}
        </p>
        {commentText ? (
          <p className="mt-2 line-clamp-4 rounded-lg bg-muted/45 px-2.5 py-2 text-[13px] leading-6 text-foreground">
            {commentText}
          </p>
        ) : null}
        <time
          dateTime={notification.created_at}
          className={cn('mt-2 block text-[11px] tabular-nums text-foreground/60', canLike && 'pe-16')}
        >
          {when}
        </time>
        </div>
  )

  const likeControl = canLike ? (
    <button
      type="button"
      disabled={liking}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void onLike()
      }}
      className={cn(
        'absolute bottom-3 end-3 inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium active:opacity-80',
        liked ? 'text-rose-500' : 'text-foreground/60'
      )}
      aria-pressed={liked}
    >
      <Heart className={cn('size-3.5', liked && 'fill-current')} aria-hidden />
      {likeCount > 0 ? toPersianDigits(likeCount) : 'لایک'}
    </button>
  ) : null

  const linked = (
    <div className="flex gap-3 p-3" dir="rtl">
      {media}
      {text}
    </div>
  )

  if (target && !target.startsWith('http://') && !target.startsWith('https://')) {
    return (
      <div className={cn(shellClass, 'relative')}>
        <Link to={target} onClick={openTarget} className="block no-underline">
          {linked}
        </Link>
        {likeControl}
      </div>
    )
  }

  return (
    <div className={cn(shellClass, 'relative')}>
      <div
        role="button"
        tabIndex={0}
        onClick={openTarget}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openTarget()
          }
        }}
        className="cursor-pointer"
      >
        {linked}
      </div>
      {likeControl}
    </div>
  )
}
