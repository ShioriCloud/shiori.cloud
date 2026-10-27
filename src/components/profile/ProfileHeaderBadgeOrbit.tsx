import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { BadgeVisual } from '@/components/profile/badges/badgeUi'
import { BadgeDetailDialog } from '@/components/profile/badges/BadgeDetailDialog'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'
import { ProfileBadgesSheetMe } from '@/components/profile/badges/ProfileBadgesSheetMe'
import { findBadgeInCatalog, findPublicBadgeForDetail } from '@/lib/badgeCatalog'
import {
  useSocialBadgeCatalogMe,
  useSocialBadgeCatalogUser,
} from '@/hooks/useSocialProfile'

const ORBIT_MAX = 4

type BadgePreview = NonNullable<SocialProfileMe['badges']>[number]

type ProfileHeaderBadgeOrbitProps = {
  variant: 'own' | 'public'
  previewBadges?: BadgePreview[]
  displayName?: string
  targetUserId?: string
  className?: string
  children: ReactNode
}

export const ProfileHeaderBadgeOrbit = ({
  variant,
  previewBadges,
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

  const preview = previewBadges?.slice(0, ORBIT_MAX) ?? []
  const left = preview.slice(0, 2)
  const right = preview.slice(2, ORBIT_MAX)
  const hasEarned = (previewBadges?.length ?? 0) > 0

  const detailBadge = useMemo(() => {
    if (!detailBadgeId) return null
    if (variant === 'own') {
      return findBadgeInCatalog(ownCatalog.data, detailBadgeId)
    }
    return findPublicBadgeForDetail(publicCatalog.data, detailBadgeId)
  }, [detailBadgeId, variant, ownCatalog.data, publicCatalog.data])

  const orbitButton = (badge: BadgePreview) => (
    <button
      key={badge.id}
      type="button"
      onClick={() => setDetailBadgeId(badge.id)}
      className="rounded-full ring-2 ring-background/80 active:scale-95 transition-transform"
      aria-label={badge.title}
    >
      <BadgeVisual
        earned
        imageUrl={badge.image_url}
        title={badge.title}
        rarity={badge.rarity ?? 'common'}
        size="sm"
      />
    </button>
  )

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
        className={cn('flex items-center justify-center gap-2', className)}
        aria-label="نشان‌ها"
      >
        <div className="flex min-w-[2.25rem] flex-col items-center gap-1.5">
          {left.map(orbitButton)}
        </div>
        {children}
        <div className="flex min-w-[2.25rem] flex-col items-center gap-1.5">
          {right.map(orbitButton)}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-border/60',
              'bg-card/90 text-muted-foreground active:scale-95 transition-transform'
            )}
            aria-label="همه نشان‌ها"
          >
            <Plus className="h-4 w-4" aria-hidden />
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
