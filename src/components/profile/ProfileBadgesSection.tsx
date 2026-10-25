import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { BadgeVisual } from '@/components/profile/badges/badgeUi'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'

type ProfileBadgesSectionProps = {
  variant: 'own' | 'public'
  badgesSummary?: { earned_count: number; total_count: number }
  previewBadges?: SocialProfileMe['badges']
  displayName?: string
  targetUserId?: string
  className?: string
}

export const ProfileBadgesSection = ({
  variant,
  badgesSummary,
  previewBadges,
  displayName = 'کاربر',
  targetUserId,
  className,
}: ProfileBadgesSectionProps) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const earned = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const total = badgesSummary?.total_count ?? 0
  const title = variant === 'own' ? 'نشان‌هام' : 'نشان‌هاش'
  const counter =
    total > 0
      ? `${toPersianDigits(earned)} از ${toPersianDigits(total)}`
      : toPersianDigits(earned)

  const preview = previewBadges?.slice(0, 3) ?? []
  const firstPreview = preview[0]

  const headerLink =
    variant === 'own' ? (
      <Link
        to="/profile/badges"
        className="flex items-center gap-1 text-xs font-medium text-primary-400 active:opacity-80"
      >
        <span>{counter}</span>
        <span className="text-muted-foreground">·</span>
        <span>همه</span>
        <ChevronLeft className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="flex items-center gap-1 text-xs font-medium text-primary-400 active:opacity-80"
      >
        <span>{counter}</span>
        <span className="text-muted-foreground">·</span>
        <span>همه</span>
        <ChevronLeft className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </button>
    )

  if (variant === 'own' && earned === 0 && total === 0) {
    return (
      <MyListCompactCard
        className={cn('px-4 py-5 text-xs text-muted-foreground', className)}
      >
        <Link to="/profile/badges" className="block text-center active:opacity-80">
          نشان‌هام — با تماشا و فعالیت باز می‌شوند
        </Link>
      </MyListCompactCard>
    )
  }

  return (
    <>
      <MyListCompactCard className={cn('overflow-hidden p-0', className)}>
        <div className="flex items-center justify-between gap-2 border-b border-border/40 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {headerLink}
        </div>
        <div className="px-4 py-4">
          {variant === 'public' ? (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex w-full items-center gap-3 text-right active:opacity-90"
            >
              {firstPreview ? (
                <>
                  <BadgeVisual earned title={firstPreview.title} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {firstPreview.title}
                    </p>
                    {preview.length > 1 ? (
                      <p className="text-xs text-muted-foreground">
                        و {toPersianDigits(preview.length - 1)} نشان دیگر
                      </p>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">هنوز نشانی ندارد</p>
              )}
            </button>
          ) : (
            <Link
              to="/profile/badges"
              className="flex items-center gap-3 active:opacity-90"
            >
              {firstPreview ? (
                <>
                  <BadgeVisual earned title={firstPreview.title} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {firstPreview.title}
                    </p>
                    {preview.length > 1 ? (
                      <p className="text-xs text-muted-foreground">
                        و {toPersianDigits(preview.length - 1)} نشان دیگر
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">مشاهده و پیشرفت</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  هنوز نشانی نگرفتی — ببین چطور می‌توانی جمع کنی
                </p>
              )}
            </Link>
          )}
        </div>
      </MyListCompactCard>

      {variant === 'public' && targetUserId ? (
        <ProfileBadgesSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          telegramUserId={targetUserId}
          displayName={displayName}
        />
      ) : null}
    </>
  )
}
