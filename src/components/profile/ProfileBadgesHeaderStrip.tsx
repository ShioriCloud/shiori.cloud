import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
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
} from '@/components/profile/profileHighlightCard'
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
    { id: string; title: string; description: string; earned_at: string; rarity?: string; image_url: string | null; unlock_hint?: string | null; is_new?: boolean } | null
  >(null)

  const earned = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const total = badgesSummary?.total_count ?? earned
  const preview = previewBadges?.slice(0, PREVIEW_COUNT) ?? []
  const overflow = Math.max(0, earned - preview.length)

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
    return (
      <div className={cn('mx-4 mt-2.5 animate-pulse rounded-xl border border-border/50 bg-muted/30 p-3', className)}>
        <div className="flex justify-end gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-11 w-11 rounded-xl bg-muted/70" />
          ))}
        </div>
      </div>
    )
  }

  const openAll = () => {
    if (variant === 'own') return
    setSheetOpen(true)
  }

  const openPreview = (badge: PreviewBadge) => {
    if (variant === 'own') {
      const full = ownCatalogMap.get(badge.id)
      if (full) setSelectedOwn(full)
      return
    }
    const full = publicCatalogMap.get(badge.id)
    if (full) setSelectedPublic(full)
    else openAll()
  }

  return (
    <>
      <div
        className={cn(
          'mx-4 mt-2.5 rounded-xl border border-border/55 bg-card/40 px-3 py-2.5',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            {variant === 'own' ? (
              <Link to="/profile/badges" className="inline-flex items-center gap-0.5 font-medium text-primary-400">
                نشان‌ها
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : (
              <button
                type="button"
                onClick={openAll}
                className="inline-flex items-center gap-0.5 font-medium text-primary-400 active:opacity-80"
              >
                نشان‌ها
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
            {total > 0 ? (
              <span className="tabular-nums">{toPersianDigits(total)}</span>
            ) : null}
          </div>

          <div className="flex flex-row-reverse flex-wrap items-center justify-end gap-2">
            {overflow > 0 ? (
              variant === 'own' ? (
                <Link
                  to="/profile/badges"
                  className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-border/50 bg-muted/40 px-2 text-xs font-semibold text-muted-foreground"
                >
                  +{toPersianDigits(overflow)}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openAll}
                  className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-border/50 bg-muted/40 px-2 text-xs font-semibold text-muted-foreground"
                >
                  +{toPersianDigits(overflow)}
                </button>
              )
            ) : null}
            {preview.map((badge) => {
              const rarity =
                variant === 'own'
                  ? ownCatalogMap.get(badge.id)?.rarity
                  : publicCatalogMap.get(badge.id)?.rarity
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => openPreview(badge)}
                  className="relative"
                  aria-label={badge.title}
                >
                  <span className={cn(profileBadgeShowcaseAuraClass(rarity), 'scale-90')} aria-hidden />
                  <div className={cn(profileBadgeShowcaseOuterClass(rarity), 'scale-90')}>
                    <div className={profileBadgeShowcaseFaceClass()}>
                      <BadgeVisual
                        earned
                        imageUrl={badge.image_url}
                        title={badge.title}
                        rarity={rarity}
                        size="sm"
                        className="h-9 w-9"
                      />
                    </div>
                  </div>
                  {badgeShowsAsNew(badge) ? (
                    <BadgeNewPill className="absolute -left-0.5 -top-0.5 z-10 scale-90" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
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
