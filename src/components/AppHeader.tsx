import { Link } from 'react-router-dom'
import logo from '@/assets/images/shiori-logo.svg'
import { cn } from '@/lib/utils'

/** Shared chrome height — keep Layout `pt-*` in sync with this. */
export const APP_HEADER_ROW_CLASS = 'flex items-center justify-center h-9'
export const APP_HEADER_PAD_CLASS = 'py-2.5'
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
