import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
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

const WAVE_STYLES = [
  'rotate-[-10deg] translate-y-1.5 scale-[0.92]',
  '-translate-y-3 scale-110 z-10',
  'rotate-[10deg] translate-y-1.5 scale-[0.92]',
] as const

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

const ShowcaseMoreButton = ({
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
      'relative flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full',
      'border border-amber-300/40 bg-gradient-to-br from-violet-500/35 via-primary-400/25 to-amber-400/20',
      'text-[10px] font-bold leading-none text-primary-50',
      'shadow-[0_0_20px_rgba(167,139,250,0.35)]',
      'ring-2 ring-inset ring-white/20',
      'active:scale-[0.92] transition-transform'
    )}
    aria-label="همه نشان‌ها"
  >
    <Sparkles className="mb-0.5 h-3.5 w-3.5 text-amber-200/90" aria-hidden />
    {moreCount > 0 ? (
      <span className="tabular-nums">+{toPersianDigits(moreCount)}</span>
    ) : (
      <span className="text-[9px]">همه</span>
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
      <div className={cn('flex flex-col items-center', className)} aria-label="نشان‌ها">
        <div className="relative z-10">{children}</div>

        <div className="relative z-20 -mt-5 w-[min(100%,17.5rem)] px-1">
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl border border-white/10',
              'bg-gradient-to-r from-violet-500/15 via-primary-400/10 to-amber-400/15',
              'px-3 pb-2.5 pt-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
              'backdrop-blur-md'
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-6 top-2 h-px bg-gradient-to-r from-transparent via-primary-300/50 to-transparent"
              aria-hidden
            />
            <svg
              className="pointer-events-none absolute inset-x-4 top-3 h-8 w-[calc(100%-2rem)] text-primary-400/25"
              viewBox="0 0 200 32"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M 8 26 Q 100 4 192 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
            </svg>

            <div className="relative flex items-end justify-center gap-0.5">
              {showcase.map((badge, index) => {
                const wave = WAVE_STYLES[index] ?? WAVE_STYLES[1]
                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setDetailBadgeId(badge.id)}
                    className={cn(
                      'relative shrink-0 active:scale-95 transition-transform',
                      wave
                    )}
                    aria-label={badge.title}
                  >
                    <span
                      className="pointer-events-none absolute inset-x-2 -bottom-1 h-2 rounded-full bg-primary-400/30 blur-md"
                      aria-hidden
                    />
                    <BadgeVisual
                      earned
                      imageUrl={badge.image_url}
                      title={badge.title}
                      rarity={badge.rarity ?? 'common'}
                      size="orbit"
                      headerGlow
                    />
                    {badge.is_new ? (
                      <span
                        className="absolute -right-0.5 top-0 rounded-md bg-pink-500 px-1 py-0.5 text-[8px] font-bold text-white"
                      >
                        جدید
                      </span>
                    ) : null}
                  </button>
                )
              })}

              <div className="mb-0.5 ml-1 shrink-0">
                <ShowcaseMoreButton
                  moreCount={moreCount}
                  onClick={() => setSheetOpen(true)}
                />
              </div>
            </div>
          </div>
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
