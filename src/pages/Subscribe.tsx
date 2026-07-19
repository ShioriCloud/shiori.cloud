import { Link } from 'react-router-dom'
import { Check, ChevronLeft, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscriptionMe, useSubscriptionPlans } from '../hooks/useSubscription'
import { useTelegramApp } from '../hooks/useTelegramApp'

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

  return (
    <div className="pb-24 px-4 pt-4 space-y-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/60 text-muted-foreground"
          aria-label="بازگشت"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">اشتراک ماهانه</h1>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary-400/10 via-card/80 to-card/60 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-400/15 text-primary-200">
            <Crown className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">دسترسی کامل شیوری</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              سافت‌ساب و هاردساب بدون توکن
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">وضعیت اشتراک</span>
          <span className="text-sm font-semibold text-foreground">
            {mePending
              ? '…'
              : me?.active
                ? `فعال تا ${expiresLabel}`
                : me?.status === 'expired'
                  ? 'منقضی شده'
                  : 'ندارید'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-0.5">مزایا</h2>
        <ul className="space-y-2 rounded-2xl border border-border bg-card/60 p-4">
          {(plan?.benefits ?? [
            'دسترسی کامل سافت‌ساب',
            'دسترسی کامل هاردساب',
            'بدون مصرف توکن رایگان',
          ]).map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-300" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            {plan?.label ?? 'اشتراک ماهانه'}
          </p>
          <p className="text-base font-bold tabular-nums text-foreground">
            {plansPending || !plan ? '…' : formatIrr(plan.amount_irr)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          پس از پرداخت در دارمت، اشتراک به‌صورت خودکار (یا توسط ادمین تا اتصال کامل webhook) برای{' '}
          {toPersianNumber(plan?.days ?? 30)} روز فعال می‌شود. در توضیحات پرداخت شناسه تلگرام خود را
          بنویسید.
        </p>
        <Button
          type="button"
          className="w-full gap-2"
          size="lg"
          onClick={() => openLink(donateUrl)}
        >
          <Crown className="h-4 w-4" />
          پرداخت و فعال‌سازی
        </Button>
        <Button asChild type="button" variant="ghost" size="sm" className="w-full">
          <Link to="/profile">بازگشت به پروفایل</Link>
        </Button>
      </div>
    </div>
  )
}

export default Subscribe
