import { AlarmClockIcon } from 'hugeicons-react'
import { RequireAppAuth } from '../components/RequireAppAuth'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { NotificationCard } from '@/components/notifications/NotificationCard'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { SocialUserListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { useNotifications } from '../hooks/useNotifications'
import { hapticSelection } from '@/lib/telegramHaptics'

const unreadBadgeClass =
  'inline-flex shrink-0 items-center rounded-md border border-primary-400/40 bg-primary-400/15 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:border-primary-400/35 dark:bg-primary-500/20 dark:text-primary-200'

const NotificationsPage = () => {
  const { notifications, unreadCount, isLoading, isError, refetch, markRead, markAllRead } =
    useNotifications()

  return (
    <ProfilePersonalSubpageLayout
      stickyHeader
      title="اعلان‌ها"
      titleLeading={<AlarmClockIcon className="h-6 w-6 text-muted-foreground" aria-hidden />}
      titleAddon={
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? <span className={unreadBadgeClass}>جدید</span> : null}
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
      }
      contentClassName="pt-4"
    >
      {isLoading ? (
        <SocialUserListSkeleton rows={5} showAction={false} />
      ) : isError && notifications.length === 0 ? (
        <ExploreEmptyState
          title="خطا در بارگذاری اعلان‌ها"
          subtitle="درخواست انجام نشد. دوباره تلاش کنید."
          actionLabel="تلاش مجدد"
          onAction={() => void refetch()}
        />
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              unreadBadgeClass={unreadBadgeClass}
              onOpen={() => {
                if (!notification.is_read) {
                  void markRead(notification.id)
                }
              }}
            />
          ))}
        </div>
      ) : (
        <ExploreEmptyState
          title="اعلانی وجود ندارد"
          subtitle="قسمت جدید، پاسخ نظر، دنبال‌کننده و لایک اینجا نمایش داده می‌شود."
        />
      )}
    </ProfilePersonalSubpageLayout>
  )
}

export default function Notifications() {
  return (
    <RequireAppAuth>
      <NotificationsPage />
    </RequireAppAuth>
  )
}
