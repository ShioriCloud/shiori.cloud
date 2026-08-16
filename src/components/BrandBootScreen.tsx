import { useState } from 'react'
import { BOOT_SPLASH_BG, pickRandomBootQuote, type BootQuote } from '@/data/bootQuotes'
import { getBootQuotePool } from '@/services/bootQuotes'
import { cn } from '@/lib/utils'

/** Branded boot / gate — IGN-style dialogue panel; fixed so it never scrolls away. */
export const BrandBootScreen = ({ className }: { className?: string } = {}) => {
  const [quote] = useState<BootQuote>(() => pickRandomBootQuote(getBootQuotePool()))

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col justify-center px-7 sm:px-10',
        className
      )}
      style={{ backgroundColor: BOOT_SPLASH_BG }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <blockquote className="mx-auto w-full max-w-md text-right text-white">
        <p className="text-[1.65rem] font-extrabold leading-[1.35] tracking-tight sm:text-3xl">
          <span className="select-none" aria-hidden>
            «
          </span>
          {quote.text}
          <span className="select-none" aria-hidden>
            »
          </span>
        </p>
        <footer className="mt-5 text-base font-medium text-white/90 sm:text-lg">
          —{quote.attribution}
        </footer>
      </blockquote>
    </div>
  )
}
