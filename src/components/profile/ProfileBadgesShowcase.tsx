import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, ChevronLeft } from 'lucide-react'
import { BadgeVisual } from '@/components/profile/badges/badgeUi'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'
import { ProfileSectionMoreLink } from '@/components/profile/ProfileSectionMoreLink'
import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

type ProfileBadgesShowcaseProps = {
  variant: 'own' | 'public'
  badgesSummary?: { earned_count: number; total_count: number }
  previewBadges?: SocialProfileMe['badges']
  displayName?: string
  targetUserId?: string
  className?: string
}

export const ProfileBadgesShowcase = ({
  variant,
  badgesSummary,
  previewBadges,
  displayName = 'کاربر',
  targetUserId,
  className,
}: ProfileBadgesShowcaseProps) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const earned = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const total = badgesSummary?.total_count ?? 0
  const preview = previewBadges?.slice(0, 4) ?? []
  const title = variant === 'own' ? 'نشان‌هام' : 'نشان‌هاش'
  const counter =
    total > 0
      ? `${toPersianDigits(earned)} از ${toPersianDigits(total)}`
      : toPersianDigits(earned)

  const moreHref = variant === 'own' ? '/profile/badges' : null

  const headerMore =
    variant === 'own' && moreHref ? (
      <ProfileSectionMoreLink to={moreHref} className="shrink-0 self-center" />
    ) : (
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className={cn(
          'inline-flex shrink-0 items-center gap-0.5 self-center text-xs font-medium text-primary-400',
          'active:opacity-75'
        )}
      >
        همه
        <ChevronLeft className="h-3.5 w-3.5 opacity-80" aria-hidden />
      </button>
    )

  return (
    <>
      <div className={cn('mx-4 mt-3', className)}>
        <section className={profileHighlightSectionClass('amber')}>
          <div className={profileHighlightGlowClass('right', 'amber')} aria-hidden />
          <div
            className={cn(profileHighlightGlowClass('left', 'primary'), 'bottom-0 top-auto')}
            aria-hidden
          />

          <div className="relative px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  'border border-amber-400/30 bg-amber-400/15 text-amber-700 dark:text-amber-200'
                )}
              >
                <Award className="h-4 w-4" aria-hidden />
              </span>

              <div className="min-w-0 flex-1 text-start">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {earned > 0 ? (
                    <>
                      <span className="tabular-nums">{counter}</span>
                      <span className="mx-1.5 text-border" aria-hidden>|</span>
                      <span>دستاورد تماشا و فعالیت</span>
                    </>
                  ) : (
                    'با تماشا و فعالیت در شیوری باز می‌شوند'
                  )}
                </p>
              </div>

              {earned > 0 || preview.length > 0 ? headerMore : null}
            </div>

            {preview.length > 0 ? (
              <div className="mt-3 flex items-center justify-center gap-3">
                {preview.map((badge) =>
                  variant === 'own' ? (
                    <Link
                      key={badge.id}
                      to="/profile/badges"
                      className="active:scale-95 transition-transform"
                      aria-label={badge.title}
                    >
                      <BadgeVisual
                        earned
                        imageUrl={badge.image_url}
                        title={badge.title}
                        size="sm"
                        className="h-11 w-11"
                      />
                    </Link>
                  ) : (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => setSheetOpen(true)}
                      className="active:scale-95 transition-transform"
                      aria-label={badge.title}
                    >
                      <BadgeVisual
                        earned
                        imageUrl={badge.image_url}
                        title={badge.title}
                        size="sm"
                        className="h-11 w-11"
                      />
                    </button>
                  )
                )}
              </div>
            ) : variant === 'own' ? (
              <Link
                to="/profile/badges"
                className="mt-3 block text-center text-xs font-medium text-primary-400 active:opacity-80"
              >
                مشاهده نشان‌ها
              </Link>
            ) : null}
          </div>
        </section>
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
