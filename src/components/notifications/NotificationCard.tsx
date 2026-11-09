import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Heart, MessageSquareText, UserRound } from 'lucide-react'
import { PROFILE_PANEL_CLASS } from '@/components/profile/profileStatsCard'
import {
  formatNotificationMessage,
  resolveNotificationTarget,
} from '@/lib/notificationDisplay'
import { openTelegramDeepLink } from '@/lib/telegramOpenLink'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import { toPersianDigits } from '@/lib/persianDigits'
import { formatNotificationTime } from '@/utils/notificationTime'
import { hapticSelection } from '@/lib/telegramHaptics'
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
  const episodeLabel =
    notification.episode_number != null
      ? `قسمت ${toPersianDigits(notification.episode_number)}`
      : null

  const shellClass = cn(
    PROFILE_PANEL_CLASS,
    'block overflow-hidden rounded-2xl transition-opacity active:opacity-90',
    !notification.is_read && 'ring-1 ring-primary-400/40'
  )

  const inner = (
    <div className="flex gap-3 p-3" dir="rtl">
      {coverSrc ? (
        <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-inset ring-border/70">
          <img src={coverSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', visual.tone)}>
          {visual.icon}
        </span>
      )}
      <div className="min-w-0 flex-1 text-right">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-semibold leading-5 text-foreground">
            {toPersianDigits(notification.title)}
          </h3>
          {!notification.is_read ? <span className={cn(unreadBadgeClass, 'shrink-0')}>جدید</span> : null}
        </div>
        <p className="mt-1 line-clamp-3 text-[13px] leading-6 text-foreground/75">
          {toPersianDigits(message)}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-[11px] text-foreground/60">
          <span className={cn('rounded-md px-1.5 py-0.5 font-medium', visual.tone)}>{visual.label}</span>
          {episodeLabel ? <span className="tabular-nums">{episodeLabel}</span> : null}
          <time dateTime={notification.created_at} className="tabular-nums">
            {when}
          </time>
        </div>
      </div>
    </div>
  )

  const handleActivate = () => {
    hapticSelection()
    onOpen()
  }

  if (target?.startsWith('http://') || target?.startsWith('https://')) {
    return (
      <a
        href={target}
        onClick={(e) => {
          e.preventDefault()
          handleActivate()
          openTelegramDeepLink(target)
        }}
        className={cn(shellClass, 'cursor-pointer no-underline')}
      >
        {inner}
      </a>
    )
  }

  if (target) {
    return (
      <Link to={target} onClick={handleActivate} className={cn(shellClass, 'no-underline')}>
        {inner}
      </Link>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleActivate()
        }
      }}
      className={cn(shellClass, 'cursor-pointer')}
    >
      {inner}
    </div>
  )
}
