import { useState } from 'react'
import {
  resolveDisplayBootQuote,
  splitBootAttribution,
  type BootQuote,
} from '@/data/bootQuotes'
import { getBootQuotePool } from '@/services/bootQuotes'
import { cn } from '@/lib/utils'

type BrandBootScreenProps = {
  className?: string
  exiting?: boolean
  statusLabel?: string
  litSegmentCount?: number
  segmentCount?: number
}

const DEFAULT_STATUS = 'در حال آماده‌سازی کتابخانه انیمه…'
const DEFAULT_SEGMENTS = 6

/** Cold-start splash — cinematic library scene with centered quote. */
export const BrandBootScreen = ({
  className,
  exiting = false,
  statusLabel = DEFAULT_STATUS,
  litSegmentCount = 0,
  segmentCount = DEFAULT_SEGMENTS,
}: BrandBootScreenProps = {}) => {
  const [quote] = useState<BootQuote>(() => resolveDisplayBootQuote(getBootQuotePool()))
  const parts = splitBootAttribution(quote.attribution)
  const lit = Math.max(0, Math.min(segmentCount, litSegmentCount))

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
        <div className="boot-splash-petals">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="boot-splash-content relative z-[1] flex min-h-0 flex-1 flex-col items-center px-6 pt-[max(1.25rem,var(--app-tg-top-inset))] pb-[max(1.25rem,var(--app-tg-bottom-inset))]">
        <div className="boot-splash-hero-spacer" aria-hidden />

        <div className="boot-splash-copy flex w-full max-w-[22rem] flex-1 flex-col items-center justify-center gap-5">
          <header className="boot-splash-identity text-center">
            <h1 className="boot-splash-character">{parts.character}</h1>
            <div className="boot-splash-rule-row" aria-hidden>
              <span className="boot-splash-rule" />
              <span className="boot-splash-rule-dot" />
              <span className="boot-splash-rule" />
            </div>
          </header>

          <blockquote className="boot-splash-quote-block w-full text-center">
            <div className="boot-splash-quote-line" aria-hidden />
            <p className="boot-splash-quote-text">
              <span className="boot-splash-q" aria-hidden>
                «
              </span>
              {quote.text}
              <span className="boot-splash-q" aria-hidden>
                »
              </span>
            </p>
            <div className="boot-splash-quote-line" aria-hidden />
          </blockquote>

          <div className="boot-splash-meta flex flex-col items-center gap-2.5">
            <span className="boot-splash-star" aria-hidden>
              ✦
            </span>
            <p className="boot-splash-credit">
              {parts.series ? `${parts.character} | ${parts.series}` : parts.character}
            </p>
          </div>
        </div>

        <div className="boot-splash-footer mt-auto flex w-full max-w-[22rem] flex-col items-center gap-3 pt-6">
          <div
            className="boot-splash-segments"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={segmentCount}
            aria-valuenow={lit}
            aria-label={statusLabel}
          >
            {Array.from({ length: segmentCount }, (_, index) => (
              <span key={index} className={cn(index < lit && 'is-on')} />
            ))}
          </div>
          <p className="boot-splash-status">{statusLabel}</p>
          <p className="boot-splash-tagline" lang="ja">
            <span className="boot-splash-tagline-rule" aria-hidden />
            アニメの力で、もっと先へ
            <span className="boot-splash-tagline-rule" aria-hidden />
          </p>
        </div>
      </div>
    </div>
  )
}
