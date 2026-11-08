import { Link } from 'react-router-dom'
import { AlarmClockIcon, UserIcon } from 'hugeicons-react'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import {
  formatNotificationMessage,
  isSocialInboxKind,
  resolveNotificationTarget,
} from '@/lib/notificationDisplay'
import { openTelegramDeepLink } from '@/lib/telegramOpenLink'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import { toPersianDigits } from '@/lib/persianDigits'
import { formatNotificationTime } from '@/utils/notificationTime'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'
import type { UserNotificationRow } from '@/types/notifications'

const POSTER_SLOT_CLASS =
  'flex h-[4.5rem] w-12 shrink-0 items-stretch justify-center overflow-hidden rounded-xl border border-border/45 bg-muted/35'

const unreadRingClass = 'ring-1 ring-primary-400/35'

type NotificationCardProps = {
  notification: UserNotificationRow
  unreadBadgeClass: string
  onOpen: () => void
}

export const NotificationCard = ({
  notification,
  unreadBadgeClass,
  onOpen,
}: NotificationCardProps) => {
  const coverSrc = resolveMediaServeUrl(notification.anime_cover_image)
  const social = isSocialInboxKind(notification.kind)
  const target = resolveNotificationTarget(notification)
  const message = formatNotificationMessage(notification)

  const poster = coverSrc ? (
    <div className={cn(POSTER_SLOT_CLASS, 'border-0 p-0')}>
      <img
        src={coverSrc}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  ) : (
    <div className={POSTER_SLOT_CLASS} aria-hidden>
      {social ? (
        <UserIcon className="h-5 w-5 text-primary-400/85" />
      ) : (
        <AlarmClockIcon className="h-5 w-5 text-muted-foreground/75" />
      )}
    </div>
  )

  const when = formatNotificationTime(notification.created_at)
  const episodeLabel =
    notification.episode_number != null
      ? `قسمت ${toPersianDigits(notification.episode_number)}`
      : null

  const shellClass = cn(
    SOCIAL_SURFACE_CLASS,
    'block overflow-hidden transition-opacity active:opacity-90',
    !notification.is_read && unreadRingClass
  )

  const inner = (
    <>
      <div className="flex items-stretch gap-3 p-3">
        {poster}
        <div className="min-w-0 flex-1 text-right">
          <div className="flex items-start justify-end gap-2">
            <h3 className="min-w-0 text-sm font-semibold leading-5 text-foreground">
              {toPersianDigits(notification.title)}
            </h3>
            {!notification.is_read ? (
              <span className={cn(unreadBadgeClass, 'mt-0.5 shrink-0')}>جدید</span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground" dir="rtl">
            {toPersianDigits(message)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/35 px-3 py-1.5">
        {episodeLabel ? (
          <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
            {episodeLabel}
          </span>
        ) : null}
        <time
          dateTime={notification.created_at}
          className="ms-auto shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground"
        >
          {when}
        </time>
      </div>
    </>
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
