import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { BadgeRarityLabel, BadgeVisual } from '@/components/profile/badges/badgeUi'
import { BadgeDetailDialog } from '@/components/profile/badges/BadgeDetailDialog'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'
import { findBadgeInCatalog, findPublicBadgeForDetail } from '@/lib/badgeCatalog'
import {
  useSocialBadgeCatalogMe,
  useSocialBadgeCatalogUser,
} from '@/hooks/useSocialProfile'

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
  const [detailBadgeId, setDetailBadgeId] = useState<string | null>(null)

  const ownCatalog = useSocialBadgeCatalogMe(variant === 'own')
  const userId = targetUserId?.trim() ?? ''
  const publicCatalog = useSocialBadgeCatalogUser(
    userId,
    variant === 'public' && userId.length > 0
  )

  const earned = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const total = badgesSummary?.total_count ?? 0
  const title = variant === 'own' ? 'نشان‌هام' : 'نشان‌هاش'
  const counter =
    total > 0
      ? `${toPersianDigits(earned)} از ${toPersianDigits(total)}`
      : toPersianDigits(earned)

  const preview = previewBadges?.slice(0, 3) ?? []

  const detailBadge = useMemo(() => {
    if (!detailBadgeId) return null
    if (variant === 'own') {
      return findBadgeInCatalog(ownCatalog.data, detailBadgeId)
    }
    return findPublicBadgeForDetail(publicCatalog.data, detailBadgeId)
  }, [detailBadgeId, variant, ownCatalog.data, publicCatalog.data])

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
        <div className="px-3 py-4">
          {preview.length > 0 ? (
            <div className="flex items-start justify-center gap-4">
              {preview.map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => setDetailBadgeId(badge.id)}
                  className="flex max-w-[6.5rem] flex-col items-center gap-1.5 active:scale-[0.98] transition-transform"
                >
                  <BadgeVisual
                    earned
                    imageUrl={badge.image_url}
                    title={badge.title}
                    rarity={badge.rarity ?? 'common'}
                    size="profile"
                  />
                  <span className="line-clamp-2 text-center text-[11px] font-semibold leading-snug text-foreground">
                    {badge.title}
                  </span>
                  {badge.rarity ? (
                    <BadgeRarityLabel rarity={badge.rarity} className="text-[10px]" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              {variant === 'own'
                ? 'هنوز نشانی نگرفتی — ببین چطور می‌توانی جمع کنی'
                : 'هنوز نشانی ندارد'}
            </p>
          )}
        </div>
      </MyListCompactCard>

      <BadgeDetailDialog
        badge={detailBadge}
        open={detailBadge != null}
        onOpenChange={(open) => !open && setDetailBadgeId(null)}
      />

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
