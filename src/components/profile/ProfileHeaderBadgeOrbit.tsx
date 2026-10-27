import { useMemo, useState, type ReactNode } from 'react'
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

const HEADER_BADGE_SLOTS = 4

type BadgePreview = NonNullable<SocialProfileMe['badges']>[number]

type ProfileHeaderBadgeOrbitProps = {
  variant: 'own' | 'public'
  previewBadges?: BadgePreview[]
  badgesSummary?: { earned_count: number; total_count: number }
  displayName?: string
  targetUserId?: string
  className?: string
  children: ReactNode
}

export const ProfileHeaderBadgeOrbit = ({
  variant,
  previewBadges,
  badgesSummary,
  displayName = 'کاربر',
  targetUserId,
  className,
  children,
}: ProfileHeaderBadgeOrbitProps) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detailBadgeId, setDetailBadgeId] = useState<string | null>(null)

  const ownCatalog = useSocialBadgeCatalogMe(variant === 'own')
  const userId = targetUserId?.trim() ?? ''
  const publicCatalog = useSocialBadgeCatalogUser(
    userId,
    variant === 'public' && userId.length > 0
  )

  const stripBadges = previewBadges?.slice(0, HEADER_BADGE_SLOTS) ?? []
  const earnedCount = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const hasEarned = earnedCount > 0 || stripBadges.length > 0
  const moreCount = Math.max(0, earnedCount - stripBadges.length)

  const detailBadge = useMemo(() => {
    if (!detailBadgeId) return null
    if (variant === 'own') {
      return findBadgeInCatalog(ownCatalog.data, detailBadgeId)
    }
    return findPublicBadgeForDetail(publicCatalog.data, detailBadgeId)
  }, [detailBadgeId, variant, ownCatalog.data, publicCatalog.data])

  if (variant === 'own' && !hasEarned) {
    return (
      <div className={cn('flex flex-col items-center', className)}>
        {children}
        <Link
          to="/profile/badges"
          className="mt-2 text-xs font-medium text-primary-400 active:opacity-80"
        >
          نشان‌ها
        </Link>
      </div>
    )
  }

  if (variant === 'public' && !hasEarned) {
    return <div className={cn('flex flex-col items-center', className)}>{children}</div>
  }

  return (
    <>
      <div
        className={cn('inline-flex items-center gap-3', className)}
        aria-label="نشان‌ها"
      >
        {children}

        <div className="flex flex-col items-center gap-1.5">
          {stripBadges.map((badge) => (
            <button
              key={badge.id}
              type="button"
              onClick={() => setDetailBadgeId(badge.id)}
              className="block active:scale-95 transition-transform"
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

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="min-h-8 px-1 text-[11px] font-semibold text-primary-400 active:opacity-75"
            aria-label="همه نشان‌ها"
          >
            {moreCount > 0 ? (
              <span>+{toPersianDigits(moreCount)}</span>
            ) : (
              <span>همه</span>
            )}
          </button>
        </div>
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
