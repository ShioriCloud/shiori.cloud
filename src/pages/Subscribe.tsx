import { Check, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { useSubscriptionMe, useSubscriptionPlans } from '../hooks/useSubscription'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { cn } from '@/lib/utils'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

const formatIrr = (amount: number): string =>
  `${toPersianNumber(amount.toLocaleString('en-US'))} تومان`

const darametDonateUrl = (): string => {
  const raw = String(import.meta.env.VITE_DARAMET_DONATE_URL ?? '').trim()
  return raw || 'https://daramet.com'
}

const StatusSkeleton = () => (
  <span className="inline-block h-4 w-28 animate-pulse rounded bg-muted" aria-hidden />
)

const Subscribe = () => {
  const { openLink } = useTelegramApp()
  const { data: me, isPending: mePending } = useSubscriptionMe(true)
  const { data: plans = [], isPending: plansPending } = useSubscriptionPlans(true)
  const plan = plans[0]
  const donateUrl = darametDonateUrl()

  const expiresLabel = me?.expires_at
    ? new Date(me.expires_at).toLocaleDateString('fa-IR', {
        dateStyle: 'medium',
      })
    : null

  const statusLabel = mePending
    ? null
    : me?.active
      ? `فعال تا ${expiresLabel}`
      : me?.status === 'expired'
        ? 'منقضی شده'
        : 'ندارید'

  return (
    <div className="pb-24 px-4 pt-4 space-y-5">
      <h1 className="text-lg font-semibold text-foreground">اشتراک ماهانه</h1>

      <div className="surface-skeuo rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary-400/35 bg-primary-400/15 text-primary-700 dark:border-primary-400/25 dark:bg-primary-400/15 dark:text-primary-200">
            <Crown className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">دسترسی کامل شیوری</p>
            <p className="text-xs text-muted-foreground mt-0.5">سافت‌ساب و هاردساب بدون توکن</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">وضعیت اشتراک</span>
          {statusLabel == null ? (
            <StatusSkeleton />
          ) : (
            <span className="text-sm font-semibold text-foreground">{statusLabel}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-0.5">مزایا</h2>
        <ul className="space-y-2 surface-skeuo rounded-2xl p-4">
          {(plan?.benefits ?? [
            'دسترسی کامل سافت‌ساب',
            'دسترسی کامل هاردساب',
            'بدون مصرف توکن رایگان',
          ]).map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-300" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-skeuo rounded-2xl p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{plan?.label ?? 'اشتراک ماهانه'}</p>
          {plansPending || !plan ? (
            <StatusSkeleton />
          ) : (
            <p className="text-base font-bold tabular-nums text-foreground">
              {formatIrr(plan.amount_irr)}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          پس از پرداخت در دارمت، اشتراک به‌صورت خودکار (یا توسط ادمین تا اتصال کامل webhook) برای{' '}
          {toPersianNumber(plan?.days ?? 30)} روز فعال می‌شود. در توضیحات پرداخت شناسه تلگرام خود را
          بنویسید.
        </p>
        <Button
          type="button"
          className={cn('w-full gap-2 font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
          size="lg"
          onClick={() => openLink(donateUrl)}
        >
          <Crown className="h-4 w-4" />
          پرداخت و فعال‌سازی
        </Button>
      </div>
    </div>
  )
}

export default Subscribe
