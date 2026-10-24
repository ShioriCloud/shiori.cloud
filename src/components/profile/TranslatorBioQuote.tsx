import { cn } from '@/lib/utils'

type TranslatorBioQuoteProps = {
  bio: string
  attribution?: string
  className?: string
}

/** Personal translator line — dialogue-font quote, not plain muted body copy. */
export const TranslatorBioQuote = ({
  bio,
  attribution,
  className,
}: TranslatorBioQuoteProps) => {
  const text = bio.trim()
  if (!text) return null

  return (
    <blockquote
      className={cn(
        'relative mt-4 overflow-hidden rounded-xl',
        'border border-violet-400/20 bg-violet-950/25',
        'px-4 pb-3.5 pt-4',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-3 end-2 select-none font-['ShioriDialogue','Vazirmatn',serif] text-[4.25rem] leading-none text-violet-300/15"
      >
        «
      </span>
      <span
        aria-hidden
        className="absolute inset-y-3 end-0 w-0.5 rounded-full bg-gradient-to-b from-violet-300/70 via-fuchsia-400/45 to-transparent"
      />

      <p className="relative text-[11px] font-medium tracking-wide text-violet-300/75">
        از زبان مترجم
      </p>

      <p
        className={cn(
          'relative mt-2 whitespace-pre-wrap text-right',
          "font-['ShioriDialogue','Vazirmatn',serif]",
          'text-[0.95rem] font-medium leading-[1.95] text-violet-50/95'
        )}
      >
        {text}
      </p>

      {attribution?.trim() ? (
        <footer className="relative mt-3 flex items-center justify-start gap-2">
          <span aria-hidden className="h-px w-5 bg-violet-400/35" />
          <cite className="not-italic text-[11px] font-medium text-violet-200/55">
            {attribution.trim()}
          </cite>
        </footer>
      ) : null}
    </blockquote>
  )
}
