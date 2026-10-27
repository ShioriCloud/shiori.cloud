import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
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

/** Badges on the ring; last slot is always «همه». */
const ORBIT_BADGE_SLOTS = 3
const ORBIT_RADIUS_PX = 54

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

const orbitStyle = (index: number, totalSlots: number): CSSProperties => {
  const startDeg = -92
  const step = 360 / totalSlots
  const deg = startDeg + index * step
  const rad = (deg * Math.PI) / 180
  const x = ORBIT_RADIUS_PX * Math.cos(rad)
  const y = ORBIT_RADIUS_PX * Math.sin(rad)
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: 'translate(-50%, -50%)',
  }
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

  const orbitBadges = previewBadges?.slice(0, ORBIT_BADGE_SLOTS) ?? []
  const earnedCount = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const hasEarned = earnedCount > 0 || orbitBadges.length > 0
  const moreCount = Math.max(0, earnedCount - orbitBadges.length)

  const satelliteCount = orbitBadges.length + 1
  const moreSlotIndex = orbitBadges.length

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
        <div className="relative flex h-[9.75rem] w-[9.75rem] items-center justify-center">
          {children}
        </div>
        <Link
          to="/profile/badges"
          className="mt-1 text-xs font-medium text-primary-400 active:opacity-80"
        >
          نشان‌ها
        </Link>
      </div>
    )
  }

  if (variant === 'public' && !hasEarned) {
    return (
      <div
        className={cn(
          'relative flex h-[9.75rem] w-[9.75rem] items-center justify-center',
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          'relative mx-auto h-[9.75rem] w-[9.75rem] shrink-0',
          className
        )}
        aria-label="نشان‌ها"
      >
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>

        {orbitBadges.map((badge, index) => (
          <button
            key={badge.id}
            type="button"
            onClick={() => setDetailBadgeId(badge.id)}
            className="absolute z-10 rounded-full ring-2 ring-background/90 active:scale-95 transition-transform"
            style={orbitStyle(index, satelliteCount)}
            aria-label={badge.title}
          >
            <BadgeVisual
              earned
              imageUrl={badge.image_url}
              title={badge.title}
              rarity={badge.rarity ?? 'common'}
              size="orbit"
            />
          </button>
        ))}

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={cn(
            'absolute z-10 flex h-10 w-10 flex-col items-center justify-center rounded-full',
            'border border-border/60 bg-card/95 text-[10px] font-bold text-primary-400',
            'shadow-md shadow-black/10 active:scale-95 transition-transform'
          )}
          style={orbitStyle(moreSlotIndex, satelliteCount)}
          aria-label="همه نشان‌ها"
        >
          {moreCount > 0 ? (
            <span className="leading-none">+{toPersianDigits(moreCount)}</span>
          ) : (
            <span className="text-[11px] font-semibold leading-none">همه</span>
          )}
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
