import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import {
  BadgeDetailBody,
  BadgeDetailDialog,
} from '@/components/profile/badges/BadgeDetailDialog'
import { BadgeVisual } from '@/components/profile/badges/badgeUi'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'
import { ProfileBadgesShowcaseSkeleton } from '@/components/profile/ProfileSectionSkeletons'
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
  const title = 'نشان‌ها'

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
        نمایش همه
        <ChevronLeft className="h-3.5 w-3.5 opacity-80" aria-hidden />
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary-400 active:opacity-75"
      >
        نمایش همه
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

  const rarityRank: Record<string, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    uncommon: 3,
    common: 4,
  }
  const preview = [...(previewBadges ?? [])]
    .sort((a, b) => {
      const ra = rarityRank[rarityForPreview(a) ?? 'common'] ?? 4
      const rb = rarityRank[rarityForPreview(b) ?? 'common'] ?? 4
      return ra - rb
    })
    .slice(0, PREVIEW_COUNT)

  return (
    <>
      <div className={cn('mx-4 mt-4', className)}>
        <section className="flex items-center justify-between gap-3 rounded-[14px] border border-border/70 bg-card px-3 py-3.5 dark:border-[#1e1e24] dark:bg-[#141418]">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="shrink-0 text-right">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-foreground">{title}</h2>
                {earned > 0 ? (
                  <span className="rounded-full bg-[#a78bfa] px-1.5 text-[11.5px] font-semibold leading-5 text-[#8b5cf6]">
                    {toPersianDigits(earned)}
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {earned > 0 ? 'کمیاب‌ترین‌ها' : 'با تماشا و فعالیت در شیوری باز می‌شوند'}
              </p>
            </div>
            {preview.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {preview.map((badge) => {
                  const rarity = rarityForPreview(badge)
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => openPreview(badge)}
                      className="relative size-9 shrink-0"
                      aria-label={badge.title}
                    >
                      <BadgeVisual
                        earned
                        imageUrl={badge.image_url}
                        title={badge.title}
                        rarity={rarity}
                        size="sm"
                        className="!h-9 !w-9"
                      />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
          {(earned > 0 || preview.length > 0) && headerMore}
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
