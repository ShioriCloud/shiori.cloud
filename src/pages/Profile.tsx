import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlarmClockIcon, CustomerServiceIcon, FavouriteIcon, UserIcon } from 'hugeicons-react'
import { ChevronLeft, Crown } from 'lucide-react'
import { useAppAuth } from '../hooks/useAppAuth'
import { useUserAnimeList } from '../hooks/useUserAnimeList'
import { useNotifications } from '../hooks/useNotifications'
import { useSubscriptionMe } from '../hooks/useSubscription'
import { ENABLE_SUBSCRIPTION_DOWNLOAD_GATE } from '../config/monetizationFlags'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { cn } from '@/lib/utils'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

const getInitials = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return 'ک'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`
  }
  return trimmed.charAt(0)
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-3 text-sm font-semibold text-foreground">{children}</h2>
)

type MenuItemProps = {
  to: string
  icon: ReactNode
  label: string
  hint?: string
  badge?: number
}

const MenuItem = ({ to, icon, label, hint, badge }: MenuItemProps) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-3 py-3',
      'transition-colors hover:bg-muted/40 active:bg-muted/55'
    )}
  >
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border',
        'border-border/50 bg-muted/35 text-muted-foreground'
      )}
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1 text-right">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </span>
    {typeof badge === 'number' && badge > 0 ? (
      <span
        className={cn(
          'flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5',
          'border-border/50 bg-muted/50 text-[11px] font-medium tabular-nums text-foreground'
        )}
      >
        {badge > 99 ? '۹۹+' : toPersianNumber(badge)}
      </span>
    ) : null}
    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
  </Link>
)

const StatCell = ({
  value,
  label,
  to,
}: {
  value: string
  label: string
  to?: string
}) => {
  const className = cn(
    'rounded-lg border border-border/40 bg-card/55 px-2 py-3 text-center',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
    to && 'active:scale-[0.98] transition-transform'
  )
  const body = (
    <>
      <p className="text-base font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{label}</p>
    </>
  )
  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

const ProfileSkeleton = () => (
  <div className="animate-pulse pb-24">
    <div className="relative h-44">
      <div className="absolute inset-x-0 top-0 h-full bg-muted/60" />
      <div className="relative z-10 flex flex-col items-center pt-24">
        <div className="h-24 w-24 rounded-2xl border-4 border-background bg-muted" />
        <div className="mt-4 h-6 w-36 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-24 rounded-md bg-muted" />
      </div>
    </div>
    <div className="mx-4 mt-6 grid grid-cols-3 gap-2">
      <div className="h-16 rounded-lg bg-muted/70" />
      <div className="h-16 rounded-lg bg-muted/70" />
      <div className="h-16 rounded-lg bg-muted/70" />
    </div>
    <div className="mx-4 mt-6 h-32 rounded-lg bg-muted/70" />
  </div>
)

const Profile = () => {
  const { user, isReady, inTelegram } = useAppAuth()
  const { stats } = useUserAnimeList()
  const { data: subscriptionMe } = useSubscriptionMe(ENABLE_SUBSCRIPTION_DOWNLOAD_GATE)
  const {
    unreadCount,
    preferences,
    preferencesLoading,
    updatePreferences,
    updatingPreferences,
  } = useNotifications()
  const [avatarFailed, setAvatarFailed] = useState(false)

  const displayName = user?.displayName ?? 'کاربر'

  const initials = useMemo(() => getInitials(displayName), [displayName])
  const username = user?.username ? `@${user.username}` : null
  const avatarUrl = user?.photoUrl && !avatarFailed ? user.photoUrl : null
  const favoritesCount = stats.animeCount
  const avgRatingLabel =
    stats.averageRating != null ? toPersianNumber(stats.averageRating.toFixed(1)) : '—'
  const showNotificationSettings = inTelegram && user != null

  if (!isReady) {
    return <ProfileSkeleton />
  }

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
          <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-lg ring-2 ring-primary-400/30">
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

          <h1 className="mt-3 line-clamp-2 px-2 text-center text-lg font-bold text-foreground">
            {displayName}
          </h1>

          {username ? (
            <p className="mt-1 text-left text-sm text-muted-foreground">{username}</p>
          ) : null}

          {user?.isPremium ? (
            <span className="mt-2 inline-flex items-center rounded-full border border-primary-400/30 bg-primary-400/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-400">
              Telegram Premium
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-4 mt-5">
        <SectionTitle>فعالیت تماشا</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          <StatCell
            to="/my-list"
            value={toPersianNumber(favoritesCount)}
            label="انیمه"
          />
          <StatCell value={toPersianNumber(stats.episodesWatched)} label="قسمت دیده" />
          <StatCell value={avgRatingLabel} label="میانگین امتیاز" />
        </div>
      </div>

      <div className="mx-4 mt-6">
        <SectionTitle>دسترسی سریع</SectionTitle>
        <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
          {ENABLE_SUBSCRIPTION_DOWNLOAD_GATE ? (
            <MenuItem
              to="/subscribe"
              icon={<Crown className="h-4 w-4" />}
              label="اشتراک ماهانه"
              hint={
                subscriptionMe?.active && subscriptionMe.expires_at
                  ? `فعال تا ${new Date(subscriptionMe.expires_at).toLocaleDateString('fa-IR')}`
                  : subscriptionMe?.status === 'expired'
                    ? 'منقضی شده — تمدید کنید'
                    : 'دسترسی سافت‌ساب و هاردساب'
              }
            />
          ) : null}
          <MenuItem
            to="/my-list"
            icon={<FavouriteIcon className="h-4 w-4" />}
            label="علاقه‌مندی‌ها"
            hint={
              favoritesCount > 0
                ? `${toPersianNumber(favoritesCount)} انیمه · ${toPersianNumber(stats.episodesWatched)} قسمت`
                : 'لیست خالی است'
            }
          />
          <MenuItem
            to="/notifications"
            icon={<AlarmClockIcon className="h-4 w-4" />}
            label="اعلان‌ها"
            hint={unreadCount > 0 ? `${toPersianNumber(unreadCount)} پیام جدید` : 'همه خوانده شده'}
            badge={unreadCount}
          />
          <MenuItem
            to="/support"
            icon={<CustomerServiceIcon className="h-4 w-4" />}
            label="تیکت پشتیبانی"
            hint="گزارش خطا، پیشنهاد و درخواست قابلیت"
          />
        </MyListCompactCard>
      </div>

      {showNotificationSettings ? (
        <div className="mx-4 mt-6">
          <SectionTitle>تنظیمات اعلان</SectionTitle>
          <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="min-w-0 text-right">
                <Label htmlFor="notify-new-episode" className="text-sm font-medium text-foreground">
                  قسمت جدید انیمه‌های لیست
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">inbox داخل مینی‌اپ</p>
              </div>
              <Switch
                id="notify-new-episode"
                checked={preferences?.notify_new_episode ?? true}
                disabled={preferencesLoading || updatingPreferences}
                onCheckedChange={(checked) => {
                  void updatePreferences({ notify_new_episode: checked })
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="min-w-0 text-right">
                <Label htmlFor="notify-telegram-dm" className="text-sm font-medium text-foreground">
                  پیام Telegram
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">وقتی مینی‌اپ بسته است</p>
              </div>
              <Switch
                id="notify-telegram-dm"
                checked={preferences?.notify_telegram_dm ?? true}
                disabled={preferencesLoading || updatingPreferences}
                onCheckedChange={(checked) => {
                  void updatePreferences({ notify_telegram_dm: checked })
                }}
              />
            </div>
          </MyListCompactCard>
        </div>
      ) : null}
    </div>
  )
}

export default Profile
