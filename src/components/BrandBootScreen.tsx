import { useState } from 'react'
import {
  preventTrailingOrphan,
  resolveDisplayBootQuote,
  splitBootAttribution,
  type BootQuote,
} from '@/data/bootQuotes'
import { getBootQuotePool } from '@/services/bootQuotes'
import { cn } from '@/lib/utils'

type BrandBootScreenProps = {
  className?: string
  exiting?: boolean
  /** 0–1 real Home P0 progress */
  progress?: number
}

const STATUS = 'در حال آماده‌سازی…'

/** Cold-start splash — cinematic top hero, quote-first below. */
export const BrandBootScreen = ({
  className,
  exiting = false,
  progress = 0,
}: BrandBootScreenProps = {}) => {
  const [quote] = useState<BootQuote>(() => resolveDisplayBootQuote(getBootQuotePool()))
  const parts = splitBootAttribution(quote.attribution)
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)))

  return (
    <div
      className={cn(
        'boot-splash fixed inset-0 z-[100] flex flex-col overflow-hidden transition-opacity duration-280 ease-out',
        exiting && 'pointer-events-none opacity-0',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
    >
      <div className="boot-splash-scene" aria-hidden>
        <img
          className="boot-splash-hero-img"
          src="/boot-splash-hero.png"
          alt=""
          decoding="async"
        />
        <div className="boot-splash-scene-veil" />
      </div>

      <div className="boot-splash-content relative z-[1] flex min-h-0 flex-1 flex-col items-center px-6 pt-[max(1.25rem,var(--app-tg-top-inset))] pb-[max(1.25rem,var(--app-tg-bottom-inset))]">
        <div className="boot-splash-copy flex w-full max-w-[20rem] flex-1 flex-col items-center justify-center">
          <blockquote className="boot-splash-quote-block w-full text-center">
            <p className="boot-splash-quote-text">{preventTrailingOrphan(quote.text)}</p>
            <footer className="boot-splash-credit">
              {parts.series ? `${parts.character} · ${parts.series}` : parts.character}
            </footer>
          </blockquote>
        </div>

        <div className="boot-splash-footer mt-auto flex w-full max-w-[14rem] flex-col items-center gap-2.5 pt-8">
          <div
            className="boot-splash-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={STATUS}
          >
            <div className="boot-splash-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="boot-splash-status">{STATUS}</p>
        </div>
      </div>
    </div>
  )
}
