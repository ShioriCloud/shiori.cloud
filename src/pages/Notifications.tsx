import { Link } from 'react-router-dom'
import { AlarmClockIcon, UserIcon } from 'hugeicons-react'
import { BidiText } from '../components/BidiText'
import { RequireAppAuth } from '../components/RequireAppAuth'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { useNotifications } from '../hooks/useNotifications'
import { formatNotificationTime } from '../utils/notificationTime'
import { hapticSelection } from '@/lib/telegramHaptics'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const unreadBadgeClass =
  'inline-flex shrink-0 items-center rounded-md border border-primary-400/40 bg-primary-400/15 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:border-primary-400/35 dark:bg-primary-500/20 dark:text-primary-200'

const NotificationsPage = () => {
  const { notifications, unreadCount, isLoading, isError, refetch, markRead, markAllRead } =
    useNotifications()

  return (
    <div className="pb-24" dir="rtl">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <AlarmClockIcon className="h-6 w-6 text-muted-foreground" />
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
              className="text-sm text-primary-500 transition-colors hover:text-primary-400"
            >
              خواندن همه
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="p-4">
          <SocialListSkeleton rows={4} />
        </div>
      ) : isError && notifications.length === 0 ? (
        <div className="p-4">
          <ExploreEmptyState
            title="خطا در بارگذاری اعلان‌ها"
            subtitle="درخواست انجام نشد. دوباره تلاش کنید."
            actionLabel="تلاش مجدد"
            onAction={() => void refetch()}
          />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3 p-4">
          {notifications.map((notification) => {
            const coverSrc = resolveMediaServeUrl(notification.anime_cover_image)
            const isSocialInbox =
              notification.kind === 'social_follow' ||
              notification.kind === 'comment_reply' ||
              notification.kind === 'comment_like' ||
              notification.kind === 'following_comment' ||
              notification.kind === 'feed_activity_like' ||
              notification.kind === 'feed_activity_note'
            const poster = coverSrc ? (
              <div className="media-card-skeuo w-12 shrink-0 rounded-lg">
                <img
                  src={coverSrc}
                  alt=""
                  className="aspect-[2/3] h-16 w-full rounded-lg object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : (
              <div
                className={cn(
                  'flex h-16 w-12 shrink-0 items-center justify-center rounded-lg border border-border/50',
                  'bg-muted/40'
                )}
                aria-hidden
              >
                {isSocialInbox ? (
                  <UserIcon className="h-5 w-5 text-primary-400/80" />
                ) : (
                  <AlarmClockIcon className="h-5 w-5 text-muted-foreground/70" />
                )}
              </div>
            )

            const onOpen = () => {
              hapticSelection()
              if (!notification.is_read) {
                void markRead(notification.id)
              }
            }

            const cardClass = cn(
              SOCIAL_SURFACE_CLASS,
              'flex gap-3 p-3 transition-opacity active:opacity-90',
              !notification.is_read && 'ring-1 ring-primary-400/30'
            )

            const inner = (
              <>
                {poster}
                <div className="min-w-0 flex-1 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <BidiText as="h3" mode="auto" className="font-semibold text-foreground">
                      {toPersianDigits(notification.title)}
                    </BidiText>
                    {!notification.is_read ? (
                      <span className={unreadBadgeClass}>جدید</span>
                    ) : null}
                  </div>
                  <BidiText
                    as="p"
                    mode="auto"
                    className="mt-1 text-sm leading-6 text-muted-foreground"
                  >
                    {toPersianDigits(notification.message)}
                  </BidiText>
                  <span className="mt-2 block text-xs text-muted-foreground tabular-nums">
                    {formatNotificationTime(notification.created_at)}
                    {notification.episode_number != null ? (
                      <>
                        <span className="mx-1.5 text-border" aria-hidden>·</span>
                        قسمت {toPersianDigits(notification.episode_number)}
                      </>
                    ) : null}
                  </span>
                </div>
              </>
            )

            return notification.href ? (
              <Link
                key={notification.id}
                to={notification.href}
                onClick={onOpen}
                className={cardClass}
              >
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
        <div className="mt-8 px-4">
          <ExploreEmptyState
            title="اعلانی وجود ندارد"
            subtitle="قسمت جدید، پاسخ نظر، دنبال‌کننده و پسند اینجا نمایش داده می‌شود."
          />
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
