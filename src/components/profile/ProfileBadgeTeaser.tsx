import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { BadgeVisual } from '@/components/profile/badges/badgeUi'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

type ProfileBadgeTeaserProps = {
  variant: 'own' | 'public'
  badgesSummary?: { earned_count: number; total_count: number }
  previewBadges?: SocialProfileMe['badges']
  displayName?: string
  targetUserId?: string
  className?: string
}

const teaserGlow =
  'rounded-2xl bg-primary-400/5 ring-1 ring-primary-400/20 shadow-[0_0_14px_-2px] shadow-primary-400/25'

export const ProfileBadgeTeaser = ({
  variant,
  badgesSummary,
  previewBadges,
  displayName = 'کاربر',
  targetUserId,
  className,
}: ProfileBadgeTeaserProps) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const earned = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const preview = previewBadges?.slice(0, 3) ?? []
  const extraCount = Math.max(0, earned - preview.length)

  if (earned === 0 && preview.length === 0) return null

  const openAll = () => setSheetOpen(true)

  const badgeNode = (badge: NonNullable<SocialProfileMe['badges']>[number]) => (
    <BadgeVisual
      earned
      imageUrl={badge.image_url}
      title={badge.title}
      size="sm"
      className="h-12 w-12"
    />
  )

  const moreButton = (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-400/35',
        'bg-primary-400/10 text-xs font-semibold text-primary-400',
        teaserGlow
      )}
    >
      {extraCount > 0 ? (
        <span>+{toPersianDigits(extraCount)}</span>
      ) : (
        <Plus className="h-4 w-4" aria-hidden />
      )}
    </span>
  )

  return (
    <>
      <div className={cn('mx-4 mt-4 flex items-center justify-center gap-2.5', className)}>
        {preview.map((badge) =>
          variant === 'own' ? (
            <Link
              key={badge.id}
              to="/profile/badges"
              className={cn('block p-1 active:scale-95 transition-transform', teaserGlow)}
              aria-label={badge.title}
            >
              {badgeNode(badge)}
            </Link>
          ) : (
            <button
              key={badge.id}
              type="button"
              onClick={openAll}
              className={cn('p-1 active:scale-95 transition-transform', teaserGlow)}
              aria-label={badge.title}
            >
              {badgeNode(badge)}
            </button>
          )
        )}

        {variant === 'own' ? (
          <Link
            to="/profile?tab=stats"
            className="active:scale-95 transition-transform"
            aria-label="همه نشان‌ها"
          >
            {moreButton}
          </Link>
        ) : (
          <button
            type="button"
            onClick={openAll}
            className="active:scale-95 transition-transform"
            aria-label="همه نشان‌ها"
          >
            {moreButton}
          </button>
        )}
      </div>

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
