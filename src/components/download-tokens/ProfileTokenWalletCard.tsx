import { Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

/** Compact wallet summary for Profile — opens recharge sheet via callback. */
export const ProfileTokenWalletCard = ({
  balance,
  pending,
  onRecharge,
  className,
}: {
  balance: number
  pending?: boolean
  onRecharge: () => void
  className?: string
}) => (
  <div
    className={cn(
      'overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-card p-4',
      className
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-1 text-right">
        <div className="flex items-center justify-start gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Coins className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-foreground">توکن دانلود</p>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          هر قسمت رایگان ۱ توکن · با دارمت شارژ کنید
        </p>
      </div>
      <div className="shrink-0 rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-center">
        <p className="text-[10px] text-muted-foreground">موجودی</p>
        <p className="text-xl font-bold tabular-nums leading-tight text-foreground">
          {pending ? '…' : toPersianDigits(balance)}
        </p>
      </div>
    </div>
    <Button type="button" size="sm" className="mt-3 w-full" onClick={onRecharge}>
      شارژ توکن
    </Button>
  </div>
)
