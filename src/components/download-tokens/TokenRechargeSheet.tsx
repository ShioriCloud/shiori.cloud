import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Coins, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { hapticSelection } from '@/lib/telegramHaptics'
import type { DownloadTokenWalletStatus } from '@/services/downloadTokens'

export type TokenRechargeTier = DownloadTokenWalletStatus['tiers'][number]

type TokenRechargeSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance: number
  telegramUserId: string | number | null | undefined
  tiers: TokenRechargeTier[]
  onConfirm: (tier: TokenRechargeTier) => void
  onCheckPayment?: () => void | Promise<void>
  checkingPayment?: boolean
}

const formatToman = (amountIrr: number): string =>
  `${toPersianDigits(Math.round(amountIrr / 10).toLocaleString('en-US'))} تومان`

export const TokenRechargeSheet = ({
  open,
  onOpenChange,
  balance,
  telegramUserId,
  tiers,
  onConfirm,
  onCheckPayment,
  checkingPayment = false,
}: TokenRechargeSheetProps) => {
  const availableTiers = useMemo(
    () => tiers.filter((tier) => Boolean(tier.recharge_url)),
    [tiers]
  )
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    const preferred =
      availableTiers.find((t) => t.tokens === 25)?.amount_irr ??
      availableTiers[0]?.amount_irr ??
      null
    setSelectedAmount(preferred)
  }, [open, availableTiers])

  const selected = availableTiers.find((t) => t.amount_irr === selectedAmount) ?? null
  const idLabel =
    telegramUserId != null && String(telegramUserId).trim()
      ? toPersianDigits(String(telegramUserId).trim())
      : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-0',
          'shadow-[0_-8px_30px_oklch(0.4_0_0/0.12)] dark:shadow-[0_-8px_30px_oklch(0_0_0/0.45)]',
          'pb-[var(--app-tg-bottom-inset)]'
        )}
      >
        <SheetHeader className="space-y-1 border-b border-border/50 px-4 py-3 text-right">
          <SheetTitle className="flex items-center justify-start gap-2 text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Coins className="h-4 w-4" aria-hidden />
            </span>
            شارژ توکن دانلود
          </SheetTitle>
          <SheetDescription className="text-xs leading-relaxed">
            بسته را انتخاب کنید؛ بعد از پرداخت، توکن‌ها به کیف شما اضافه می‌شود.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 py-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">موجودی فعلی</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {toPersianDigits(balance)} توکن
              </p>
            </div>
            <Sparkles className="h-5 w-5 shrink-0 text-primary/70" aria-hidden />
          </div>

          <div className="grid gap-2">
            {availableTiers.map((tier) => {
              const active = tier.amount_irr === selectedAmount
              const popular = tier.tokens === 25
              return (
                <button
                  key={tier.amount_irr}
                  type="button"
                  onClick={() => {
                    hapticSelection()
                    setSelectedAmount(tier.amount_irr)
                  }}
                  className={cn(
                    'relative flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-right transition-colors',
                    active
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border/60 bg-card/60 hover:bg-muted/40'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {toPersianDigits(tier.tokens)} توکن
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatToman(tier.amount_irr)}
                    </p>
                  </div>
                  {popular ? (
                    <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                      پیشنهاد
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-3 text-right">
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs font-semibold text-foreground">مهم — پیام پرداخت را عوض نکنید</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  در صفحهٔ دارمت، فیلد پیام از قبل با شناسهٔ شما پر می‌شود
                  {idLabel ? (
                    <>
                      {' '}
                      (
                      <span className="font-mono tabular-nums text-foreground" dir="ltr">
                        {idLabel}
                      </span>
                      )
                    </>
                  ) : null}
                  . اگر این پیام را پاک یا تغییر دهید، پرداخت قابل تأیید نیست و توکن شارژ
                  نمی‌شود.
                </p>
              </div>
            </div>
          </div>

          {onCheckPayment ? (
            <button
              type="button"
              className="w-full text-center text-[11px] text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
              disabled={checkingPayment}
              onClick={() => {
                void onCheckPayment()
              }}
            >
              {checkingPayment ? 'در حال بررسی پرداخت…' : 'پرداخت کردم — موجودی را بررسی کن'}
            </button>
          ) : null}
        </div>

        <SheetFooter className="border-t border-border/50 px-4 py-4">
          <Button
            type="button"
            size="lg"
            className={cn('h-12 w-full text-base font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
            disabled={!selected?.recharge_url}
            onClick={() => {
              if (!selected) return
              onConfirm(selected)
            }}
          >
            {selected
              ? `ادامه پرداخت · ${toPersianDigits(selected.tokens)} توکن`
              : 'بسته را انتخاب کنید'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
