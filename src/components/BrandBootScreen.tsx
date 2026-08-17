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

/** Cold-start splash only — cinematic title card. Do not reuse for route Suspense. */
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
      <div className="boot-splash-scrim" aria-hidden />
      <div className="boot-splash-grain" aria-hidden />
      <div className="boot-splash-ribbon" aria-hidden />
      <div className="boot-splash-sweep" aria-hidden />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col px-6 pt-[max(1.25rem,var(--app-tg-top-inset))] pb-[max(1.25rem,var(--app-tg-bottom-inset))]">
        <img src={logo} alt="" className="boot-splash-logo mx-auto h-5 w-auto max-w-[6rem]" />

        <div className="min-h-0 flex-1" />

        <blockquote className="boot-splash-card mx-auto w-full max-w-sm">
          <div
            className="boot-splash-progress"
            role="progressbar"
            aria-label="در حال بارگذاری"
          >
            <div className="boot-splash-progress-fill" />
          </div>
          <p className="boot-splash-quote-text pt-1 text-center text-[1.05rem] leading-8 sm:text-lg sm:leading-9">
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
    </div>
  )
}
