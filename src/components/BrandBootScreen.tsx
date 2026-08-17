import { useState } from 'react'
import logo from '@/assets/images/shiori-logo.svg'
import { resolveDisplayBootQuote, type BootQuote } from '@/data/bootQuotes'
import { getBootQuotePool } from '@/services/bootQuotes'
import { cn } from '@/lib/utils'

type BrandBootScreenProps = {
  className?: string
  /** Soft exit before the app shell mounts (avoids a hard cut). */
  exiting?: boolean
}

/** Cold-start splash only — black through mid-screen so the quote reads; wallpaper below. */
export const BrandBootScreen = ({ className, exiting = false }: BrandBootScreenProps = {}) => {
  const [quote] = useState<BootQuote>(() => resolveDisplayBootQuote(getBootQuotePool()))
  const wallpaper = quote.image?.trim() || ''

  return (
    <div
      className={cn(
        'boot-splash fixed inset-0 z-[100] flex flex-col overflow-hidden text-foreground transition-opacity duration-280 ease-out',
        wallpaper && 'has-wallpaper',
        exiting && 'pointer-events-none opacity-0',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
    >
      {wallpaper ? (
        <div className="boot-splash-wallpaper" aria-hidden>
          <img src={wallpaper} alt="" />
        </div>
      ) : (
        <div className="boot-splash-void" aria-hidden />
      )}
      <div className="boot-splash-tint" aria-hidden />
      <div className="boot-splash-wash" aria-hidden />
      <div className="boot-splash-grain" aria-hidden />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-6 pb-16 pt-[max(2rem,var(--app-tg-top-inset))]">
        <img src={logo} alt="" className="boot-splash-logo h-5 w-auto max-w-[6rem]" />

        <blockquote className="boot-splash-card w-full max-w-sm">
          <p className="boot-splash-quote-text text-center text-[1.05rem] leading-8 sm:text-lg sm:leading-9">
            <span className="boot-splash-q" aria-hidden>
              «
            </span>
            {quote.text}
            <span className="boot-splash-q" aria-hidden>
              »
            </span>
          </p>
          <footer className="boot-splash-attr mt-3 text-center text-[0.8rem]">
            — {quote.attribution}
          </footer>
        </blockquote>
      </div>

      <div className="relative z-[1] px-8 pb-[max(1.5rem,var(--app-tg-bottom-inset))]">
        <div
          className="boot-splash-progress mx-auto"
          role="progressbar"
          aria-label="در حال بارگذاری"
        >
          <div className="boot-splash-progress-fill" />
        </div>
      </div>
    </div>
  )
}
