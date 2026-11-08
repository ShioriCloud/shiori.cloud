import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, ChevronLeft } from 'lucide-react'
import {
  BadgeDetailBody,
  BadgeDetailDialog,
} from '@/components/profile/badges/BadgeDetailDialog'
import { BadgeNewPill, BadgeVisual, badgeShowsAsNew } from '@/components/profile/badges/badgeUi'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'
import {
  profileBadgeShowcaseAuraClass,
  profileBadgeShowcaseFaceClass,
  profileBadgeShowcaseOuterClass,
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import {
  PROFILE_BADGES_SHOWCASE_GRID_MIN_H,
  ProfileBadgesShowcaseSkeleton,
} from '@/components/profile/ProfileSectionSkeletons'
import {
  useSocialBadgeCatalogMe,
  useSocialBadgeCatalogUser,
} from '@/hooks/useSocialProfile'
import type { SocialBadgeCatalogItem, SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toPersianDigits } from '@/lib/persianDigits'

type PreviewBadge = NonNullable<SocialProfileMe['badges']>[number]

const PREVIEW_COUNT = 4

type ProfileBadgesHeaderStripProps = {
  variant: 'own' | 'public'
  badgesSummary?: { earned_count: number; total_count: number }
  previewBadges?: SocialProfileMe['badges']
  displayName?: string
  targetUserId?: string
  isLoading?: boolean
  className?: string
}

export const ProfileBadgesHeaderStrip = ({
  variant,
  badgesSummary,
  previewBadges,
  displayName = 'کاربر',
  targetUserId,
  isLoading = false,
  className,
}: ProfileBadgesHeaderStripProps) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedOwn, setSelectedOwn] = useState<SocialBadgeCatalogItem | null>(null)
  const [selectedPublic, setSelectedPublic] = useState<
    {
      id: string
      title: string
      description: string
      earned_at: string
      rarity?: string
      image_url: string | null
      unlock_hint?: string | null
      is_new?: boolean
    } | null
  >(null)

  const earned = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const total = badgesSummary?.total_count ?? earned
  const preview = previewBadges?.slice(0, PREVIEW_COUNT) ?? []
  const title = variant === 'own' ? 'نشان‌هام' : 'نشان‌هاش'

  const { data: ownCatalog } = useSocialBadgeCatalogMe(variant === 'own' && !isLoading)
  const ownCatalogMap = useMemo(() => {
    const map = new Map<string, SocialBadgeCatalogItem>()
    for (const cat of ownCatalog?.categories ?? []) {
      for (const badge of cat.badges) map.set(badge.id, badge)
    }
    return map
  }, [ownCatalog?.categories])

  const { data: publicCatalog } = useSocialBadgeCatalogUser(
    targetUserId ?? '',
    variant === 'public' && Boolean(targetUserId) && !isLoading
  )
  const publicCatalogMap = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string
        title: string
        description: string
        earned_at: string
        rarity?: string
        image_url: string | null
        unlock_hint?: string | null
        is_new?: boolean
      }
    >()
    for (const badge of publicCatalog?.badges ?? []) map.set(badge.id, badge)
    return map
  }, [publicCatalog?.badges])

  if (isLoading) {
    return <ProfileBadgesShowcaseSkeleton className={cn('!mt-3', className)} />
  }

  const headerMore =
    variant === 'own' ? (
      <Link
        to="/profile/badges"
        className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary-400 active:opacity-75"
      >
        همه
        <ChevronLeft className="h-3.5 w-3.5 opacity-80" aria-hidden />
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary-400 active:opacity-75"
      >
        همه
        <ChevronLeft className="h-3.5 w-3.5 opacity-80" aria-hidden />
      </button>
    )

  const openPreview = (badge: PreviewBadge) => {
    if (variant === 'own') {
      const full = ownCatalogMap.get(badge.id)
      if (full) setSelectedOwn(full)
      return
    }
    const full = publicCatalogMap.get(badge.id)
    if (full) setSelectedPublic(full)
    else setSheetOpen(true)
  }

  const rarityForPreview = (badge: PreviewBadge) => {
    if (variant === 'own') return ownCatalogMap.get(badge.id)?.rarity
    return publicCatalogMap.get(badge.id)?.rarity
  }

  return (
    <>
      <div className={cn('mx-4 mt-3', className)}>
        <section className={profileHighlightSectionClass('amber')}>
          <div className={profileHighlightGlowClass('right', 'amber')} aria-hidden />
          <div
            className={cn(profileHighlightGlowClass('left', 'primary'), 'bottom-0 top-auto')}
            aria-hidden
          />

          <div className="relative px-3.5 py-3.5 text-right" dir="rtl">
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  'border border-amber-400/30 bg-amber-400/15 text-amber-700 dark:text-amber-200'
                )}
              >
                <Award className="h-4 w-4" aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                  {(earned > 0 || preview.length > 0) && headerMore}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {earned > 0
                    ? `${toPersianDigits(earned)} از ${toPersianDigits(total)} نشان`
                    : 'با تماشا و فعالیت در شیوری باز می‌شوند'}
                </p>
              </div>
            </div>

            {preview.length > 0 ? (
              <div
                className={cn('mt-3 grid grid-cols-4 gap-2', PROFILE_BADGES_SHOWCASE_GRID_MIN_H)}
              >
                {preview.map((badge) => {
                  const rarity = rarityForPreview(badge)
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => openPreview(badge)}
                      className="relative w-full min-w-0"
                      aria-label={badge.title}
                    >
                      <span className={profileBadgeShowcaseAuraClass(rarity)} aria-hidden />
                      <div className={profileBadgeShowcaseOuterClass(rarity)}>
                        <div className={profileBadgeShowcaseFaceClass()}>
                          <BadgeVisual
                            earned
                            imageUrl={badge.image_url}
                            title={badge.title}
                            rarity={rarity}
                            size="sm"
                            className="h-11 w-11 drop-shadow-[0_0_16px_rgba(251,191,36,0.35)]"
                          />
                        </div>
                      </div>
                      {badgeShowsAsNew(badge) ? (
                        <BadgeNewPill className="absolute -left-0.5 -top-0.5 z-10" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-border/55 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
                هنوز نشانی کسب نکرده‌ای — با تماشا و تعامل در شیوری باز می‌شوند.
              </p>
            )}

          </div>
        </section>
      </div>

      <BadgeDetailDialog
        badge={selectedOwn}
        open={selectedOwn != null}
        onOpenChange={(open) => {
          if (!open) setSelectedOwn(null)
        }}
      />

      <Dialog
        open={selectedPublic != null}
        onOpenChange={(open) => {
          if (!open) setSelectedPublic(null)
        }}
      >
        {selectedPublic ? (
          <DialogContent className="max-w-sm border-0 bg-transparent p-0 shadow-none sm:rounded-2xl">
            <BadgeDetailBody
              badge={{
                title: selectedPublic.title,
                description: selectedPublic.description,
                rarity: selectedPublic.rarity,
                image_url: selectedPublic.image_url,
                earned: true,
                unlock_hint: selectedPublic.unlock_hint ?? null,
                earned_at: selectedPublic.earned_at,
                is_new: selectedPublic.is_new,
              }}
            />
          </DialogContent>
        ) : null}
      </Dialog>

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
