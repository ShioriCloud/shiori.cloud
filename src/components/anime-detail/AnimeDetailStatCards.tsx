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
        : 'surface-skeuo hover:brightness-[0.98] dark:hover:brightness-110'
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
        active ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'
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
  <div className="flex min-w-[2.5rem] flex-col items-center justify-center rounded-lg border border-primary-400/25 bg-primary-400/10 px-1.5 py-1.5">
    <span className="text-[13px] font-bold tabular-nums leading-none text-primary-700 dark:text-primary-200">
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
    <div className="mx-4 mt-2 flex items-center gap-2.5 rounded-2xl surface-skeuo px-3 py-2">
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

/** Reserves countdown card height while AniList next_airing is fetching. */
export const NextAiringCardSkeleton = () => (
  <div
    className="mx-4 mt-2 flex items-center gap-2.5 rounded-2xl surface-skeuo px-3 py-2"
    aria-busy="true"
    aria-label="در حال بارگذاری زمان پخش قسمت بعد"
  >
    <div className="h-5 w-5 shrink-0 animate-pulse rounded-md bg-muted" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="h-3.5 w-28 max-w-full animate-pulse rounded bg-muted" />
      <div className="h-3 w-40 max-w-full animate-pulse rounded bg-muted" />
    </div>
    <div className="flex shrink-0 items-center gap-1" dir="ltr">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-10 animate-pulse rounded-lg border border-border/40 bg-muted/60"
        />
      ))}
    </div>
  </div>
)

export const FavoriteStatCard = ({
  active,
  onClick,
  expanded = false,
}: {
  active: boolean
  onClick: () => void
  /** When true, fills the row with icon + label (no reminder beside it). */
  expanded?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'relative flex items-center justify-center rounded-xl border transition-colors',
      expanded
        ? 'min-h-12 flex-1 gap-2 px-3 py-2.5 text-center'
        : 'h-12 w-12 shrink-0',
      active
        ? 'border-red-500/35 bg-red-500/10 hover:bg-red-500/15'
        : 'surface-skeuo hover:brightness-[0.98] dark:hover:brightness-110'
    )}
    aria-label={active ? 'ویرایش پیشرفت و امتیاز' : 'افزودن به علاقه‌مندی‌ها'}
  >
    <FavouriteIcon
      className={cn(
        'h-5 w-5 shrink-0',
        active ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
      )}
    />
    {expanded ? (
      <span
        className={cn(
          'text-[12px] font-medium leading-tight',
          active ? 'text-red-600 dark:text-red-300' : 'text-foreground'
        )}
      >
        {active ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
      </span>
    ) : null}
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
    'flex items-center gap-1.5 rounded-xl surface-skeuo px-2 py-1.5 transition-colors',
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
      return 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:border-emerald-400/35 dark:bg-emerald-500/25 dark:text-emerald-100'
    case 'FINISHED':
      return 'border border-slate-400/45 bg-slate-500/15 text-slate-800 dark:border-slate-400/35 dark:bg-slate-500/25 dark:text-slate-100'
    case 'NOT_YET_RELEASED':
      return 'border border-amber-500/45 bg-amber-500/15 text-amber-900 dark:border-amber-400/40 dark:bg-amber-500/25 dark:text-amber-100'
    case 'HIATUS':
      return 'border border-orange-500/45 bg-orange-500/15 text-orange-900 dark:border-orange-400/40 dark:bg-orange-500/25 dark:text-orange-100'
    case 'CANCELLED':
      return 'border border-red-500/40 bg-red-500/15 text-red-800 dark:border-red-400/40 dark:bg-red-500/25 dark:text-red-100'
    default:
      return 'border border-border bg-muted/90 text-foreground'
  }
}

