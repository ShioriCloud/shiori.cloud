import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { BadgeVisual } from '@/components/profile/badges/badgeUi'
import { BadgeDetailDialog } from '@/components/profile/badges/BadgeDetailDialog'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'
import { ProfileBadgesSheetMe } from '@/components/profile/badges/ProfileBadgesSheetMe'
import { findBadgeInCatalog, findPublicBadgeForDetail } from '@/lib/badgeCatalog'
import {
  useSocialBadgeCatalogMe,
  useSocialBadgeCatalogUser,
} from '@/hooks/useSocialProfile'

const SHOWCASE_SLOTS = 3

type BadgePreview = NonNullable<SocialProfileMe['badges']>[number]

type ProfileShowcaseStripProps = {
  variant: 'own' | 'public'
  previewBadges?: BadgePreview[]
  badgesSummary?: { earned_count: number; total_count: number }
  displayName?: string
  targetUserId?: string
  className?: string
}

export const ProfileShowcaseStrip = ({
  variant,
  previewBadges,
  badgesSummary,
  displayName = 'کاربر',
  targetUserId,
  className,
}: ProfileShowcaseStripProps) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailBadgeId, setDetailBadgeId] = useState<string | null>(null)

  const ownCatalog = useSocialBadgeCatalogMe(variant === 'own')
  const userId = targetUserId?.trim() ?? ''
  const publicCatalog = useSocialBadgeCatalogUser(
    userId,
    variant === 'public' && userId.length > 0
  )

  const showcase = previewBadges?.slice(0, SHOWCASE_SLOTS) ?? []
  const earnedCount = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const hasEarned = earnedCount > 0 || showcase.length > 0
  const moreCount = Math.max(0, earnedCount - showcase.length)

  const detailBadge = useMemo(() => {
    if (!detailBadgeId) return null
    if (variant === 'own') {
      return findBadgeInCatalog(ownCatalog.data, detailBadgeId)
    }
    return findPublicBadgeForDetail(publicCatalog.data, detailBadgeId)
  }, [detailBadgeId, variant, ownCatalog.data, publicCatalog.data])

  if (variant === 'own' && !hasEarned) {
    return (
      <div className={cn('px-4', className)}>
        <Link
          to="/profile/badges"
          className="text-xs font-medium text-primary-400 active:opacity-80"
        >
          نشان‌ها — هنوز چیزی نگرفتی
        </Link>
      </div>
    )
  }

  if (variant === 'public' && !hasEarned) return null

  return (
    <>
      <div
        className={cn('flex items-center gap-2 px-4', className)}
        aria-label="نشان‌ها"
      >
        <div className="flex items-center -space-x-2 space-x-reverse">
          {showcase.map((badge) => (
            <button
              key={badge.id}
              type="button"
              onClick={() => setDetailBadgeId(badge.id)}
              className="relative rounded-full active:scale-95 transition-transform"
              aria-label={badge.title}
            >
              <BadgeVisual
                earned
                imageUrl={badge.image_url}
                title={badge.title}
                rarity={badge.rarity ?? 'common'}
                size="orbit"
                headerGlow
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={cn(
            'rounded-full border border-border/60 bg-card/80 px-2.5 py-1',
            'text-[11px] font-semibold text-primary-400 active:opacity-80'
          )}
          aria-label="همه نشان‌ها"
        >
          {moreCount > 0 ? `+${toPersianDigits(moreCount)}` : 'همه'}
        </button>
      </div>

      <BadgeDetailDialog
        badge={detailBadge}
        open={detailBadge != null}
        onOpenChange={(open) => !open && setDetailBadgeId(null)}
      />

      {variant === 'public' && userId ? (
        <ProfileBadgesSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          telegramUserId={userId}
          displayName={displayName}
        />
      ) : (
        <ProfileBadgesSheetMe
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          displayName={displayName}
        />
      )}
    </>
  )
}
