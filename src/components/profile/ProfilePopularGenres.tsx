import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type GenreRow = { slug: string; label: string; percent: number }

export const ProfilePopularGenres = ({
  genres,
  title = 'ژانرهای محبوب',
  className,
}: {
  genres: GenreRow[]
  title?: string
  className?: string
}) => {
  if (genres.length === 0) return null

  const top = genres.slice(0, 5)
  const maxPercent = Math.max(...top.map((g) => g.percent), 1)

  return (
    <section className={cn('px-4 pt-2', className)}>
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      <section className={profileHighlightSectionClass('primary')}>
        <div className={profileHighlightGlowClass('left', 'primary')} aria-hidden />
        <div className={cn(profileHighlightGlowClass('right', 'sky'), 'opacity-50')} aria-hidden />
        <div className="relative space-y-3 px-3.5 py-3.5">
          {top.map((g) => {
            const width = Math.max(10, Math.round((g.percent / maxPercent) * 100))
            return (
              <div key={g.slug}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-foreground">{g.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {toPersianDigits(g.percent)}٪
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-primary-400 to-primary-500/85"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </section>
  )
}
