import { Link } from 'react-router-dom'
import logo from '@/assets/images/shiori-logo.svg'
import { cn } from '@/lib/utils'

/**
 * Logo sits in the Telegram fullscreen chrome gap (between Close and menu).
 * pt = notch/safe only; row height = content safe area (chrome strip).
 */
export const APP_HEADER_ROW_CLASS =
  'flex items-center justify-center min-h-9 h-[max(2.25rem,var(--app-tg-content-top,2.25rem))]'
/** Notch padding + chrome row; tabs/content start below this block. */
export const APP_HEADER_PAD_CLASS =
  'pt-[var(--app-tg-safe-top,0px)] pb-2.5'
export const APP_HEADER_LOGO_CLASS =
  'h-5 w-auto max-w-[7.5rem] object-contain'

type AppHeaderProps = {
  className?: string
  /** When true, only the inner row (for fixed Layout header that owns outer padding). */
  bare?: boolean
}

export function AppHeader({ className, bare = false }: AppHeaderProps) {
  const row = (
    <div className={APP_HEADER_ROW_CLASS}>
      <Link to="/" className="flex items-center" aria-label="شیوری">
        <img src={logo} alt="شیوری" className={APP_HEADER_LOGO_CLASS} />
      </Link>
    </div>
  )

  if (bare) return row

  return <div className={cn('px-4', APP_HEADER_PAD_CLASS, className)}>{row}</div>
}
