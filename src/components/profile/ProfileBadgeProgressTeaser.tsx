import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useSocialBadgeCatalogMe } from '@/hooks/useSocialProfile'
import {
  BadgeProgressBar,
  BadgeVisual,
} from '@/components/profile/badges/badgeUi'
import type { SocialBadgeCatalogItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

const pickNextBadge = (
  categories: Array<{ badges: SocialBadgeCatalogItem[] }>
): SocialBadgeCatalogItem | null => {
  let best: SocialBadgeCatalogItem | null = null
  let bestRatio = -1
  for (const cat of categories) {
    for (const b of cat.badges) {
      if (b.earned) continue
      const t = b.progress?.target ?? 0
      if (t <= 0) continue
      const ratio = (b.progress?.current ?? 0) / t
      if (ratio > bestRatio) {
        bestRatio = ratio
        best = b
      }
    }
  }
  return best
}

export const ProfileBadgeProgressTeaser = ({
  enabled,
  className,
}: {
  enabled: boolean
  className?: string
}) => {
  const { data, isLoading } = useSocialBadgeCatalogMe(enabled)
  const earned = data?.earned_count ?? 0
  const total = data?.total_count ?? 0

  const next = useMemo(
    () => pickNextBadge(data?.categories ?? []),
    [data?.categories]
  )

  if (!enabled || isLoading) return null

  return (
    <section className={cn('mx-4 mt-5', className)}>
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h3 className="text-sm font-semibold text-foreground">نشان‌ها</h3>
        <Link
          to="/profile/badges"
          className="flex items-center gap-0.5 text-xs font-medium text-primary-400 active:opacity-80"
        >
          <span>
            {toPersianDigits(earned)} از {toPersianDigits(total)}
          </span>
          <ChevronLeft className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </Link>
      </div>
      {next ? (
        <Link
          to="/profile/badges"
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 p-3',
            'active:scale-[0.99] transition-transform'
          )}
        >
          <BadgeVisual
            earned={false}
            imageUrl={next.image_url}
            title={next.title}
            rarity={next.rarity}
            size="sm"
            className="!h-14 !w-14"
          />
          <div className="min-w-0 flex-1 text-right">
            <p className="text-sm font-semibold text-foreground">{next.display_title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{next.unlock_hint ?? next.hint}</p>
            <BadgeProgressBar
              className="mt-2"
              current={next.progress?.current ?? 0}
              target={next.progress?.target ?? 0}
            />
          </div>
        </Link>
      ) : (
        <Link
          to="/profile/badges"
          className="block rounded-2xl border border-border/50 bg-card/60 px-4 py-3 text-center text-xs text-muted-foreground active:opacity-80"
        >
          همه نشان‌ها را ببین
        </Link>
      )}
    </section>
  )
}
