import { Link } from 'react-router-dom'
import { ChevronLeft, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useDonationTokenTiers,
  useDownloadTokenBalance,
} from '../hooks/useDownloadTokens'
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

const Donate = () => {
  const { openLink } = useTelegramApp()
  const { data: balanceData, isPending: balancePending } = useDownloadTokenBalance(true)
  const { data: tiers = [], isPending: tiersPending } = useDonationTokenTiers(true)

  const balance = balanceData?.balance ?? 0
  const donateUrl = darametDonateUrl()

  const handleDonate = () => {
    openLink(donateUrl)
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-5">
      <div className="flex items-center gap-2">
        <Link
          to={-1 as unknown as string}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/60 text-muted-foreground"
          aria-label="بازگشت"
          onClick={(e) => {
            e.preventDefault()
            window.history.back()
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">دونیت و تمدید توکن</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-400/15 text-primary-200">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">توکن دانلود رایگان</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              هر دانلود رایگان ۱ توکن مصرف می‌کند
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
          <span className="text-xs text-muted-foreground">موجودی فعلی</span>
          <span className="text-base font-semibold tabular-nums text-foreground">
            {balancePending ? '…' : toPersianNumber(balance)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-0.5">بسته‌های پیشنهادی</h2>
        <p className="text-xs text-muted-foreground leading-relaxed px-0.5">
          پس از دونیت در دارمت، توکن‌ها بر اساس مبلغ واریزی شارژ می‌شوند. اتصال خودکار به‌زودی کامل
          می‌شود.
        </p>
        {tiersPending ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : tiers.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">بسته‌ای تعریف نشده</p>
        ) : (
          <div className="space-y-2">
            {tiers.map((tier) => (
              <div
                key={tier.amount_irr}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {toPersianNumber(tier.tokens)} توکن
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    حدود {formatIrr(tier.amount_irr)}
                  </p>
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={handleDonate}>
                  دونیت
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="button" className="w-full gap-2" size="lg" onClick={handleDonate}>
        <HeartHandshake className="h-4 w-4" />
        رفتن به صفحه دونیت دارمت
      </Button>
    </div>
  )
}

export default Donate
