import { Link } from 'react-router-dom'
import { AlarmClockIcon } from 'hugeicons-react'
import { BidiText } from '../components/BidiText'
import { RequireAppAuth } from '../components/RequireAppAuth'
import { useNotifications } from '../hooks/useNotifications'
import { formatNotificationTime } from '../utils/notificationTime'
import { hapticSelection } from '@/lib/telegramHaptics'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import emptyListImage from '@/assets/images/frieren-03.webp'

const unreadBadgeClass =
  'inline-flex shrink-0 items-center rounded-md border border-primary-400/40 bg-primary-400/15 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:border-primary-400/35 dark:bg-primary-500/20 dark:text-primary-200'

const NotificationsPage = () => {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications()

  return (
    <div className="pb-24">
      <div className="sticky top-[var(--app-header-offset)] z-10 bg-background/95 backdrop-blur-sm">
        <div className="px-4 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <AlarmClockIcon className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-lg font-semibold text-foreground">اعلان‌ها</h1>
            {unreadCount > 0 ? <span className={unreadBadgeClass}>جدید</span> : null}
          </div>
          {notifications.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                hapticSelection()
                void markAllRead()
              }}
              className="text-primary-500 text-sm hover:text-primary-400 transition-colors"
            >
              خواندن همه
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 rounded-lg surface-skeuo p-3">
              <div className="h-16 w-12 shrink-0 rounded-md bg-muted" />
              <div className="min-w-0 flex-1 space-y-2 py-1">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3 p-4">
          {notifications.map((notification) => {
            const coverSrc = resolveMediaServeUrl(notification.anime_cover_image)
            const poster = coverSrc ? (
              <img
                src={coverSrc}
                alt=""
                className="h-16 w-12 shrink-0 rounded-md object-cover ring-1 ring-border/60"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="flex h-16 w-12 shrink-0 items-center justify-center rounded-md bg-muted ring-1 ring-border/40"
                aria-hidden
              >
                <AlarmClockIcon className="h-5 w-5 text-muted-foreground/70" />
              </div>
            )

            const inner = (
              <>
                {poster}
                <div className="mt-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <BidiText as="h3" mode="auto" className="font-medium text-foreground">
                      {toPersianDigits(notification.title)}
                    </BidiText>
                    {!notification.is_read ? (
                      <span className={unreadBadgeClass}>جدید</span>
                    ) : null}
                  </div>
                  <BidiText as="p" mode="auto" className="mt-1 text-sm text-muted-foreground">
                    {toPersianDigits(notification.message)}
                  </BidiText>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {formatNotificationTime(notification.created_at)}
                    {notification.episode_number != null ? (
                      <>
                        <span className="mx-1.5 text-border" aria-hidden>
                          ·
                        </span>
                        قسمت {toPersianDigits(notification.episode_number)}
                      </>
                    ) : null}
                  </span>
                </div>
              </>
            )

            const onOpen = () => {
              hapticSelection()
              if (!notification.is_read) {
                void markRead(notification.id)
              }
            }

            const cardClass = cn(
              'flex gap-3 p-3 rounded-lg surface-skeuo',
              !notification.is_read && 'ring-1 ring-primary-400/25'
            )

            return notification.href ? (
              <Link key={notification.id} to={notification.href} onClick={onOpen} className={cardClass}>
                {inner}
              </Link>
            ) : (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={onOpen}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpen()
                }}
                className={cn(cardClass, 'cursor-pointer')}
              >
                {inner}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex h-[55vh] flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
          <img src={emptyListImage} alt="" className="mb-2 w-36 opacity-90" />
          <p className="font-medium text-foreground">اعلانی وجود ندارد</p>
          <p className="text-sm leading-6">
            وقتی قسمت جدید انیمه‌ای از لیستت منتشر شود اینجا نمایش داده می‌شود.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Notifications() {
  return (
    <RequireAppAuth>
      <NotificationsPage />
    </RequireAppAuth>
  )
}
