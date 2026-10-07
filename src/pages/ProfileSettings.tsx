import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlarmClockIcon, CustomerServiceIcon } from 'hugeicons-react'
import { ChevronLeft, ChevronRight, Crown, Moon, Sun } from 'lucide-react'
import { useAppAuth } from '../hooks/useAppAuth'
import { useNotifications } from '../hooks/useNotifications'
import { useSubscriptionMe } from '../hooks/useSubscription'
import { useTokenRechargeUi } from '../hooks/useTokenRechargeUi'
import { ENABLE_SUBSCRIPTION_DOWNLOAD_GATE } from '../config/monetizationFlags'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ProfileTokenWalletCard } from '@/components/download-tokens/ProfileTokenWalletCard'
import { TokenRechargeSheet } from '@/components/download-tokens/TokenRechargeSheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/utils/theme'
import { hapticSelection } from '@/lib/telegramHaptics'
import type { ThemePreference } from '@/store/themeStore'
import {
  buildTelegramBotLink,
  getMiniAppBotUsername,
} from '@/utils/externalLinks'
import { toPersianDigits } from '@/lib/persianDigits'

const APP_VERSION = String(import.meta.env.VITE_APP_VERSION ?? '0.1.0').trim() || '0.1.0'

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-3 text-sm font-semibold text-foreground">{children}</h2>
)

type MenuRowProps = {
  icon: ReactNode
  label: string
  hint?: string
  badge?: number
}

const MenuRowContent = ({ icon, label, hint, badge }: MenuRowProps) => (
  <>
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
        {badge > 99 ? '۹۹+' : toPersianDigits(badge)}
      </span>
    ) : null}
    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
  </>
)

const MenuItem = ({ to, ...row }: MenuRowProps & { to: string }) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-3 py-3',
      'transition-colors hover:bg-muted/40 active:bg-muted/55'
    )}
  >
    <MenuRowContent {...row} />
  </Link>
)

const ProfileSettings = () => {
  const { user, inTelegram, logout } = useAppAuth()
  const { data: subscriptionMe } = useSubscriptionMe(ENABLE_SUBSCRIPTION_DOWNLOAD_GATE)
  const {
    unreadCount,
    preferences,
    preferencesLoading,
    updatePreferences,
    updatingNotifyNewEpisode,
    updatingNotifyTelegramDm,
    updatingHideTelegramUsername,
    updatingHideWatchActivity,
  } = useNotifications()
  const { preference, setPreference, isDarkMode } = useTheme()
  const tokenRecharge = useTokenRechargeUi(Boolean(user))
  const showNotificationSettings = inTelegram && user != null
  const showPrivacySettings = inTelegram && user != null

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            پروفایل
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">تنظیمات</h1>
          <span className="w-12" aria-hidden />
        </div>
      </div>

      <div className="px-4 pt-4">
        {tokenRecharge.walletEnabled ? (
          <div className="mt-2">
            <SectionTitle>کیف توکن</SectionTitle>
            <ProfileTokenWalletCard
              balance={tokenRecharge.balance}
              pending={tokenRecharge.walletPending}
              onRecharge={tokenRecharge.openRechargeSheet}
            />
          </div>
        ) : null}

        <div className="mt-6">
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
              to="/notifications"
              icon={<AlarmClockIcon className="h-4 w-4" />}
              label="اعلان‌ها"
              hint={
                unreadCount > 0
                  ? `${toPersianDigits(unreadCount)} پیام جدید`
                  : 'همه خوانده شده'
              }
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

        {showPrivacySettings ? (
          <div className="mt-6">
            <SectionTitle>حریم خصوصی</SectionTitle>
            <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
              <div className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0 text-right">
                  <Label
                    htmlFor="hide-telegram-username"
                    className="text-sm font-medium text-foreground"
                  >
                    مخفی کردن آیدی تلگرام
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    آیدی @ در پروفایل عمومی نمایش داده نمی‌شود
                  </p>
                </div>
                <Switch
                  id="hide-telegram-username"
                  checked={preferences?.hide_telegram_username ?? false}
                  disabled={preferencesLoading || updatingHideTelegramUsername}
                  onCheckedChange={(checked) => {
                    hapticSelection()
                    void updatePreferences({ hide_telegram_username: checked })
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0 text-right">
                  <Label
                    htmlFor="hide-watch-activity"
                    className="text-sm font-medium text-foreground"
                  >
                    مخفی کردن فعالیت تماشا
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    لیست و آمار تماشا برای دیگران و فیدشان دیده نمی‌شود
                  </p>
                </div>
                <Switch
                  id="hide-watch-activity"
                  checked={preferences?.hide_watch_activity ?? false}
                  disabled={preferencesLoading || updatingHideWatchActivity}
                  onCheckedChange={(checked) => {
                    hapticSelection()
                    void updatePreferences({ hide_watch_activity: checked })
                  }}
                />
              </div>
            </MyListCompactCard>
          </div>
        ) : null}

        {showNotificationSettings ? (
          <div className="mt-6">
            <SectionTitle>تنظیمات اعلان</SectionTitle>
            <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
              <div className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0 text-right">
                  <Label htmlFor="notify-new-episode" className="text-sm font-medium text-foreground">
                    اعلان قسمت جدید
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    اینباکس مینی‌اپ برای انیمه‌هایی که یادآوری کرده‌ای
                  </p>
                </div>
                <Switch
                  id="notify-new-episode"
                  checked={preferences?.notify_new_episode ?? true}
                  disabled={preferencesLoading || updatingNotifyNewEpisode}
                  onCheckedChange={(checked) => {
                    hapticSelection()
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
                  disabled={preferencesLoading || updatingNotifyTelegramDm}
                  onCheckedChange={(checked) => {
                    hapticSelection()
                    void updatePreferences({ notify_telegram_dm: checked })
                  }}
                />
              </div>
            </MyListCompactCard>
          </div>
        ) : null}

        <div className="mt-6">
          <SectionTitle>ظاهر</SectionTitle>
          <MyListCompactCard className="overflow-hidden p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-right">
                <p className="text-sm font-medium text-foreground">تم</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {preference === 'auto'
                    ? inTelegram
                      ? 'همگام با تم تلگرام'
                      : 'همگام با سیستم'
                    : isDarkMode
                      ? 'تم تیره'
                      : 'تم روشن'}
                </p>
              </div>
              {isDarkMode ? (
                <Moon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <Sun className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'auto', label: 'خودکار' },
                  { id: 'light', label: 'روشن' },
                  { id: 'dark', label: 'تیره' },
                ] as const satisfies ReadonlyArray<{ id: ThemePreference; label: string }>
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    hapticSelection()
                    setPreference(opt.id)
                  }}
                  className={cn(
                    'ui-elevated rounded-md px-2 py-2 text-[11px] font-medium transition-colors',
                    preference === opt.id
                      ? 'border-primary-400/45 bg-primary-400/15 font-semibold text-primary-700 dark:border-primary-400/25 dark:bg-primary-500/15 dark:text-primary-200'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                  aria-pressed={preference === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </MyListCompactCard>
        </div>

        {!inTelegram && user?.source === 'web' ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-6 w-full"
            onClick={() => void logout()}
          >
            خروج از حساب
          </Button>
        ) : null}

        <footer className="mt-8 mb-2 space-y-2 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            مینی‌شیوری | آرشیو جمع‌و‌جور دانلود انیمه
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            نسخه {toPersianDigits(APP_VERSION)}
            <span className="mx-1.5 text-border" aria-hidden>
              ·
            </span>
            <a
              href={buildTelegramBotLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400/90 underline-offset-2 hover:underline"
              dir="ltr"
            >
              @{getMiniAppBotUsername()}
            </a>
          </p>
        </footer>
      </div>

      {tokenRecharge.walletEnabled ? (
        <TokenRechargeSheet
          open={tokenRecharge.sheetOpen}
          onOpenChange={tokenRecharge.setSheetOpen}
          balance={tokenRecharge.balance}
          telegramUserId={tokenRecharge.telegramUserId}
          tiers={tokenRecharge.tiers}
          onConfirm={tokenRecharge.confirmTier}
          onCheckPayment={tokenRecharge.checkPayment}
          checkingPayment={tokenRecharge.checkingPayment}
        />
      ) : null}
    </div>
  )
}

export default ProfileSettings
