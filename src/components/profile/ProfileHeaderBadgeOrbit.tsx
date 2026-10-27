import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
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

/** Matches `ProfileCircleAvatar` size `lg` (6.5rem ≈ 104px). */
const AVATAR_PX = 104
const SHELL_W = 172
const SHELL_H = 132
const ORBIT_RADIUS_PX = 58
/** Arc on the physical left of the avatar (math angles, 0° = right). */
const ARC_START_DEG = 118
const ARC_END_DEG = 242

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

const avatarCenter = () => ({
  x: SHELL_W - AVATAR_PX / 2,
  y: SHELL_H / 2,
})

const leftFlankArcStyle = (slotIndex: number, totalSlots: number): CSSProperties => {
  const { x: cx, y: cy } = avatarCenter()
  const t = totalSlots <= 1 ? 0.5 : slotIndex / (totalSlots - 1)
  const deg = ARC_START_DEG + (ARC_END_DEG - ARC_START_DEG) * t
  const rad = (deg * Math.PI) / 180
  const x = cx + ORBIT_RADIUS_PX * Math.cos(rad)
  const y = cy + ORBIT_RADIUS_PX * Math.sin(rad)
  return {
    left: x,
    top: y,
    transform: 'translate(-50%, -50%)',
  }
}

const ProfileBadgesMoreButton = ({
  moreCount,
  onClick,
}: {
  moreCount: number
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex h-9 min-w-[2.35rem] items-center justify-center gap-1 rounded-xl px-2',
      'border border-primary-400/50 bg-gradient-to-b from-primary-400/30 via-primary-500/15 to-card/90',
      'text-[11px] font-bold leading-none text-primary-100',
      'shadow-[0_4px_14px_rgba(0,0,0,0.35)] shadow-primary-400/20',
      'ring-1 ring-inset ring-white/20',
      'active:scale-[0.96] transition-transform'
    )}
    aria-label="همه نشان‌ها"
  >
    {moreCount > 0 ? (
      <>
        <span className="text-[10px] font-extrabold opacity-90">+</span>
        <span className="tabular-nums">{toPersianDigits(moreCount)}</span>
      </>
    ) : (
      <>
        <LayoutGrid className="h-3.5 w-3.5 opacity-90" aria-hidden />
        <span>همه</span>
      </>
    )}
  </button>
)

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
  const arcSlotCount = stripBadges.length + 1

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
        className={cn('relative mx-auto shrink-0', className)}
        style={{ width: SHELL_W, height: SHELL_H }}
        aria-label="نشان‌ها"
      >
        <div className="absolute right-0 top-1/2 z-0 -translate-y-1/2">{children}</div>

        {stripBadges.map((badge, index) => (
          <button
            key={badge.id}
            type="button"
            onClick={() => setDetailBadgeId(badge.id)}
            className="absolute z-10 block active:scale-95 transition-transform"
            style={leftFlankArcStyle(index, arcSlotCount)}
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

        <div
          className="absolute z-10"
          style={leftFlankArcStyle(stripBadges.length, arcSlotCount)}
        >
          <ProfileBadgesMoreButton moreCount={moreCount} onClick={() => setSheetOpen(true)} />
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
