import { Link } from 'react-router-dom'
import logo from '@/assets/images/shiori-logo.svg'
import { cn } from '@/lib/utils'

/** Shared chrome height — keep Layout `pt-*` / --app-header-offset in sync. */
export const APP_HEADER_ROW_CLASS = 'flex items-center justify-center h-9'
/** Vertical padding under Telegram content safe area (fullscreen Close / menu). */
export const APP_HEADER_PAD_CLASS =
  'pt-[calc(var(--app-tg-top-inset)+0.625rem)] pb-2.5'
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
