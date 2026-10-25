import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ContentLoadingSkeleton } from '@/components/RouteFallback'
import { BadgeDetailDialog } from '@/components/profile/badges/BadgeDetailDialog'
import {
  BadgeProgressBar,
  BadgeVisual,
  formatBadgeProgress,
} from '@/components/profile/badges/badgeUi'
import { useSocialBadgeCatalogMe } from '@/hooks/useSocialProfile'
import type { SocialBadgeCatalogItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

const ProfileBadges = () => {
  const { data, isLoading, isError } = useSocialBadgeCatalogMe(true)
  const [selected, setSelected] = useState<SocialBadgeCatalogItem | null>(null)

  const earned = data?.earned_count ?? 0
  const total = data?.total_count ?? 0

  if (isLoading) return <ContentLoadingSkeleton />

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            پروفایل
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">نشان‌ها</h1>
          <span className="min-w-[3.5rem] text-left text-sm font-medium text-primary-400">
            {toPersianDigits(earned)} از {toPersianDigits(total)}
          </span>
        </div>
      </div>

      {isError || data?.enabled === false ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          نشان‌ها برای حساب شما فعال نیست.
        </p>
      ) : (
        <div className="space-y-8 px-4 pt-5">
          {data?.categories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-3 text-sm font-semibold text-foreground">{category.label}</h2>
              <div className="grid grid-cols-3 gap-2.5">
                {category.badges.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelected(badge)}
                    className={cn(
                      'flex flex-col rounded-2xl border border-border/55 bg-card/90 p-2.5 text-center',
                      'active:scale-[0.98] transition-transform min-h-[8.5rem]'
                    )}
                  >
                    <div className="relative mb-2">
                      <BadgeVisual
                        earned={badge.earned}
                        hidden={badge.hidden}
                        imageUrl={badge.image_url}
                        title={badge.title}
                        size="sm"
                      />
                      {badge.is_new ? (
                        <span
                          className="absolute -right-1 -top-1 rounded-md bg-pink-500/90 px-1 py-0.5 text-[9px] font-bold text-white"
                        >
                          جدید
                        </span>
                      ) : null}
                    </div>
                    <p className="line-clamp-2 flex-1 text-[11px] font-medium leading-snug text-foreground">
                      {badge.display_title}
                    </p>
                    {badge.hint && !badge.earned ? (
                      <p className="mt-1 line-clamp-2 text-[9px] leading-tight text-muted-foreground">
                        {badge.hint}
                      </p>
                    ) : null}
                    <div className="mt-2 w-full">
                      <BadgeProgressBar
                        current={badge.progress.current}
                        target={badge.progress.target}
                        earned={badge.earned}
                      />
                      {!badge.earned && badge.progress.target > 0 ? (
                        <p className="mt-1 text-[9px] text-muted-foreground">
                          {formatBadgeProgress(
                            badge.progress.current,
                            badge.progress.target
                          )}
                        </p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BadgeDetailDialog
        badge={selected}
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}

export default ProfileBadges
