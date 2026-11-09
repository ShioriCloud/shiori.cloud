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
      label: 'لایک',
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

const MEDIA_RADIUS = 'rounded-md'

export const NotificationCard = ({
  notification,
  unreadBadgeClass,
  onOpen,
}: NotificationCardProps) => {
  const coverSrc = resolveMediaServeUrl(notification.anime_cover_image)
  const target = resolveNotificationTarget(notification)
  const message = formatNotificationMessage(notification)
  const rawTitle = notification.title.trim()
  const displayTitle =
    rawTitle === 'پسند روی فعالیت' || rawTitle === 'پسند روی فعالیتت'
      ? 'فعالیتت رو پسندیدن'
      : rawTitle
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
  const [commentExpanded, setCommentExpanded] = useState(false)
  const commentIsLong = commentText.length > 180
  const shownComment =
    commentIsLong && !commentExpanded ? `${commentText.slice(0, 180)}…` : commentText

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
          className="!h-12 !w-12 !rounded-md !ring-1"
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

  const summary = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-semibold leading-5 text-foreground">
          {toPersianDigits(displayTitle)}
        </h3>
        {!notification.is_read ? <span className={cn(unreadBadgeClass, 'shrink-0')}>جدید</span> : null}
      </div>
      <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-foreground/75">
        {toPersianDigits(message)}
      </p>
    </>
  )

  const commentBlock = commentText ? (
    <div className="mt-2">
      <p className="whitespace-pre-wrap rounded-lg bg-muted/45 px-2.5 py-2 text-[13px] leading-6 text-foreground">
        {shownComment}
      </p>
      {commentIsLong ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setCommentExpanded((open) => !open)
          }}
          className="mt-2 text-xs font-medium text-primary-400"
        >
          {commentExpanded ? 'نمایش کمتر' : 'نمایش بیشتر'}
        </button>
      ) : null}
    </div>
  ) : null

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
        'inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium active:opacity-80',
        liked ? 'text-rose-500' : 'text-foreground/60'
      )}
      aria-pressed={liked}
    >
      <Heart className={cn('size-3.5', liked && 'fill-current')} aria-hidden />
      {likeCount > 0 ? toPersianDigits(likeCount) : 'لایک'}
    </button>
  ) : null

  const internalTarget = Boolean(target && !target.startsWith('http://') && !target.startsWith('https://'))

  const openable = (node: ReactNode, className: string) =>
    internalTarget ? (
      <Link to={target!} onClick={openTarget} className={cn('no-underline', className)}>
        {node}
      </Link>
    ) : (
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
        className={cn('cursor-pointer', className)}
      >
        {node}
      </div>
    )

  const body = (
    <div className="flex gap-3 p-3" dir="rtl">
      {openable(media, 'shrink-0')}
      <div className="min-w-0 flex-1 text-right">
        {openable(summary, 'block')}
        {commentBlock}
        <div className={cn('flex items-center justify-between gap-3', commentText ? 'mt-4' : 'mt-2')}>
          <time dateTime={notification.created_at} className="text-[11px] tabular-nums text-foreground/60">
            {when}
          </time>
          {likeControl}
        </div>
      </div>
    </div>
  )

  return <div className={shellClass}>{body}</div>
}
