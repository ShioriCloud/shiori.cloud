import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type Genre = { slug: string; label: string; percent: number }

export const ProfileTopGenresStrip = ({
  genres,
  className,
}: {
  genres: Genre[]
  className?: string
}) => {
  const top = genres.slice(0, 4)
  if (top.length === 0) return null

  return (
    <section className={cn('mx-4 mt-4', className)}>
      <h3 className="mb-2 px-1 text-sm font-semibold text-foreground">ژانرهای پرتکرار</h3>
      <div className="space-y-2 rounded-2xl border border-border/50 bg-card/50 p-3">
        {top.map((g) => (
          <div key={g.slug} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
              {g.label}
            </span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary-400/80"
                style={{ width: `${Math.min(100, g.percent)}%` }}
              />
            </div>
            <span className="w-8 text-left text-[10px] tabular-nums text-muted-foreground">
              {toPersianDigits(g.percent)}٪
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
