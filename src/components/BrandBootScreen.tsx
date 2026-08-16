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

/** Cold-start splash only — quote + aurora. Do not reuse for route Suspense. */
export const BrandBootScreen = ({ className, exiting = false }: BrandBootScreenProps = {}) => {
  const [quote] = useState<BootQuote>(() => resolveDisplayBootQuote(getBootQuotePool()))

  return (
    <div
      className={cn(
        'boot-splash fixed inset-0 z-[100] flex flex-col overflow-hidden bg-background text-foreground transition-opacity duration-280 ease-out',
        exiting && 'pointer-events-none opacity-0',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
    >
      <div className="boot-splash-aurora pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="boot-splash-orb boot-splash-orb-a pointer-events-none absolute will-change-transform"
        aria-hidden
      />
      <div
        className="boot-splash-orb boot-splash-orb-b pointer-events-none absolute will-change-transform"
        aria-hidden
      />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-7 pb-16 pt-[max(2rem,var(--app-tg-top-inset))]">
        <img src={logo} alt="" className="h-6 w-auto max-w-[6.5rem] opacity-80" />

        <blockquote className="boot-splash-quote mx-auto w-full max-w-sm text-center">
          <p className="text-lg font-semibold leading-8 text-foreground sm:text-xl sm:leading-9">
            <span className="text-primary-400/80" aria-hidden>
              «
            </span>
            {quote.text}
            <span className="text-primary-400/80" aria-hidden>
              »
            </span>
          </p>
          <footer className="mt-4 text-sm text-muted-foreground">— {quote.attribution}</footer>
        </blockquote>
      </div>

      <div className="relative z-[1] px-8 pb-[max(1.5rem,var(--app-tg-bottom-inset))]">
        <div
          className="mx-auto h-0.5 w-28 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="در حال بارگذاری"
        >
          <div className="boot-splash-progress-fill h-full rounded-full bg-primary-500" />
        </div>
      </div>
    </div>
  )
}
