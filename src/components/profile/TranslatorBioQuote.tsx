import { cn } from '@/lib/utils'

type TranslatorBioQuoteProps = {
  bio: string
  attribution?: string
  className?: string
}

/** Compact translator quote — light type treatment, no heavy violet chrome. */
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
        'relative mt-4 border-s-2 border-primary-400/55 ps-3.5',
        className
      )}
    >
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
        از زبان مترجم
      </p>
      <p
        className={cn(
          'mt-1.5 whitespace-pre-wrap text-right',
          "font-['ShioriDialogue','Vazirmatn',serif]",
          'text-[0.95rem] leading-[1.85] text-foreground/90'
        )}
      >
        {text}
      </p>
      {attribution?.trim() ? (
        <footer className="mt-2">
          <cite className="not-italic text-[11px] text-muted-foreground">
            — {attribution.trim()}
          </cite>
        </footer>
      ) : null}
    </blockquote>
  )
}
