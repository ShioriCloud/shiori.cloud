import { useEffect, useState } from 'react'
import { Calendar01Icon, CheckmarkCircle02Icon, FavouriteIcon, TelegramIcon } from 'hugeicons-react'
import { cn } from '@/lib/utils'
import { toPersianNumber } from './animeDetailLabels'

const TELEGRAM_BLUE = '#229ED9'

export const ReminderStatCard = ({
  active,
  busy = false,
  onClick,
}: {
  active: boolean
  busy?: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    className={cn(
      'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-center transition-colors disabled:opacity-60',
      active
        ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
        : 'border-border bg-card/60 hover:bg-muted/40'
    )}
    aria-label={active ? 'یادآوری قسمت جدید فعال است' : 'فعال‌سازی یادآوری قسمت جدید'}
    aria-pressed={active}
  >
    {active ? (
      <CheckmarkCircle02Icon className="h-5 w-5 shrink-0 text-emerald-400" />
    ) : (
      <TelegramIcon className="h-5 w-5 shrink-0" style={{ color: TELEGRAM_BLUE }} />
    )}
    <span
      className={cn(
        'text-[12px] font-medium leading-tight',
        active ? 'text-emerald-300' : 'text-foreground'
      )}
    >
      {active ? 'یادآوری فعال است' : 'یادآوری قسمت جدید'}
    </span>
  </button>
)

export const formatNextAiringTehran = (airingAtUnix: number) => {
  const d = new Date(airingAtUnix * 1000)
  if (!Number.isFinite(d.getTime())) return null
  const weekday = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    timeZone: 'Asia/Tehran',
  }).format(d)
  const time = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tehran',
  }).format(d)
  return { weekday, time }
}

export const splitCountdown = (remainingMs: number) => {
  const totalSec = Math.max(0, Math.floor(remainingMs / 1000))
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

export const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex min-w-[2.5rem] flex-col items-center justify-center rounded-lg border border-primary-400/20 bg-primary-400/10 px-1.5 py-1.5">
    <span className="text-[13px] font-bold tabular-nums leading-none text-primary-200">
      {toPersianNumber(String(value).padStart(2, '0'))}
    </span>
    <span className="mt-1 text-[9px] font-medium leading-none text-muted-foreground">
      {label}
    </span>
  </div>
)

export const NextAiringCard = ({
  episode,
  airingAt,
}: {
  episode: number
  airingAt: number
}) => {
  const [nowMs, setNowMs] = useState(() => Date.now())
  const formatted = formatNextAiringTehran(airingAt)

  useEffect(() => {
    const targetMs = airingAt * 1000
    if (!Number.isFinite(targetMs)) return
    const tick = () => setNowMs(Date.now())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [airingAt])

  if (!formatted) return null

  const remainingMs = airingAt * 1000 - nowMs
  const expired = remainingMs <= 0
  const { days, hours, minutes, seconds } = splitCountdown(remainingMs)

  return (
    <div className="mx-4 mt-2 flex items-center gap-2.5 rounded-2xl border border-primary-400/20 bg-gradient-to-l from-primary-500/[0.10] to-card/60 px-3 py-2">
      <Calendar01Icon className="h-5 w-5 shrink-0 text-primary-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground">
          قسمت بعدی · {toPersianNumber(episode)}
        </p>
        <p className="truncate text-[11px] text-muted-foreground leading-relaxed">
          {expired
            ? 'زمان پخش رسیده یا در حال به‌روزرسانی است'
            : `${formatted.weekday} · ساعت ${formatted.time}`}
        </p>
      </div>
      {expired ? null : (
        <div className="flex shrink-0 items-center gap-1" dir="ltr">
          {days > 0 ? <CountdownUnit value={days} label="روز" /> : null}
          <CountdownUnit value={hours} label="ساعت" />
          <CountdownUnit value={minutes} label="دقیقه" />
          <CountdownUnit value={seconds} label="ثانیه" />
        </div>
      )}
    </div>
  )
}

export const FavoriteStatCard = ({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors',
      active
        ? 'border-red-500/35 bg-red-500/10 hover:bg-red-500/15'
        : 'border-border bg-card/60 hover:bg-muted/40'
    )}
    aria-label={active ? 'ویرایش پیشرفت و امتیاز' : 'افزودن به علاقه‌مندی‌ها'}
  >
    <FavouriteIcon
      className={cn(
        'h-5 w-5',
        active ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
      )}
    />
  </button>
)

export const ScoreChip = ({
  value,
  logo,
  logoAlt,
  fallbackLabel,
  loading = false,
  href,
  onOpenLink,
  logoClassName,
  logoWrapClassName,
}: {
  value: string
  logo?: string
  logoAlt?: string
  fallbackLabel?: string
  loading?: boolean
  href?: string
  onOpenLink?: (url: string) => void
  logoClassName?: string
  logoWrapClassName?: string
}) => {
  const logoEl = logo ? (
    logoWrapClassName ? (
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded',
          logoWrapClassName
        )}
      >
        <img
          src={logo}
          className={cn('h-3.5 w-3.5 object-contain', logoClassName)}
          alt={logoAlt ?? ''}
        />
      </span>
    ) : (
      <img
        src={logo}
        className={cn('h-5 w-5 shrink-0 rounded', logoClassName)}
        alt={logoAlt ?? ''}
      />
    )
  ) : (
    <span className="text-[10px] font-bold text-yellow-500 leading-none shrink-0">
      {fallbackLabel ?? '—'}
    </span>
  )

  const inner = (
    <>
      {logoEl}
      {loading ? (
        <span className="h-4 w-9 rounded-md bg-muted animate-pulse" aria-hidden />
      ) : (
        <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
      )}
    </>
  )

  const className = cn(
    'flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-2 py-1.5 transition-colors',
    href && !loading && 'hover:bg-muted/40 active:scale-[0.98] cursor-pointer'
  )

  if (href && onOpenLink && !loading) {
    return (
      <button
        type="button"
        className={className}
        aria-label={`${logoAlt ?? 'امتیاز'} در سایت مرجع`}
        onClick={() => onOpenLink(href)}
      >
        {inner}
      </button>
    )
  }

  return <div className={className}>{inner}</div>
}

export const posterStatusClass = (status: string) => {
  switch (status) {
    case 'RELEASING':
      return 'bg-green-500/90 text-white'
    case 'FINISHED':
      return 'bg-slate-600/90 text-white'
    case 'NOT_YET_RELEASED':
      return 'bg-amber-500/90 text-white'
    case 'HIATUS':
      return 'bg-orange-500/90 text-white'
    case 'CANCELLED':
      return 'bg-red-600/90 text-white'
    default:
      return 'bg-muted/90 text-foreground border border-border'
  }
}

