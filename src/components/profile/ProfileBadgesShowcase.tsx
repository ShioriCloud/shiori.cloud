import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, ChevronLeft } from 'lucide-react'
import { BadgeDetailDialog } from '@/components/profile/badges/BadgeDetailDialog'
import { BadgeVisual } from '@/components/profile/badges/badgeUi'
import { ProfileBadgesSheet } from '@/components/profile/badges/ProfileBadgesSheet'
import { ProfileSectionMoreLink } from '@/components/profile/ProfileSectionMoreLink'
import {
  profileBadgeShowcaseFaceClass,
  profileBadgeShowcaseOuterClass,
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useSocialBadgeCatalogMe,
  useSocialBadgeCatalogUser,
} from '@/hooks/useSocialProfile'
import type { SocialBadgeCatalogItem, SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

type PreviewBadge = NonNullable<SocialProfileMe['badges']>[number]
type PublicBadge = {
  id: string
  title: string
  description: string
  earned_at: string
  is_new?: boolean
  rarity?: string
  image_url: string | null
}

type ProfileBadgesShowcaseProps = {
  variant: 'own' | 'public'
  badgesSummary?: { earned_count: number; total_count: number }
  previewBadges?: SocialProfileMe['badges']
  displayName?: string
  targetUserId?: string
  className?: string
}

const PREVIEW_COUNT = 4

export const ProfileBadgesShowcase = ({
  variant,
  badgesSummary,
  previewBadges,
  displayName = 'کاربر',
  targetUserId,
  className,
}: ProfileBadgesShowcaseProps) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedOwn, setSelectedOwn] = useState<SocialBadgeCatalogItem | null>(null)
  const [selectedPublic, setSelectedPublic] = useState<PublicBadge | null>(null)

  const earned = badgesSummary?.earned_count ?? previewBadges?.length ?? 0
  const preview = previewBadges?.slice(0, PREVIEW_COUNT) ?? []
  const title = variant === 'own' ? 'نشان‌هام' : 'نشان‌هاش'

  const { data: ownCatalog } = useSocialBadgeCatalogMe(variant === 'own')
  const ownCatalogMap = useMemo(() => {
    const map = new Map<string, SocialBadgeCatalogItem>()
    for (const cat of ownCatalog?.categories ?? []) {
      for (const badge of cat.badges) map.set(badge.id, badge)
    }
    return map
  }, [ownCatalog?.categories])

  const { data: publicCatalog } = useSocialBadgeCatalogUser(
    targetUserId ?? '',
    variant === 'public' && Boolean(targetUserId)
  )
  const publicCatalogMap = useMemo(() => {
    const map = new Map<string, PublicBadge>()
    for (const badge of publicCatalog?.badges ?? []) map.set(badge.id, badge)
    return map
  }, [publicCatalog?.badges])

  const headerMore =
    variant === 'own' ? (
      <ProfileSectionMoreLink to="/profile/badges" className="shrink-0 self-center" />
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

  const openPreview = (badge: PreviewBadge) => {
    if (variant === 'own') {
      const full = ownCatalogMap.get(badge.id)
      if (full) {
        setSelectedOwn(full)
        return
      }
      setSelectedOwn({
        id: badge.id,
        title: badge.title,
        display_title: badge.title,
        description: 'برای جزئیات بیشتر صفحه نشان‌ها را ببین.',
        category_id: '',
        category_label: '',
        rarity: 'common',
        hidden: false,
        hint: null,
        unlock_hint: null,
        earned: true,
        earned_at: null,
        is_new: badge.is_new ?? false,
        progress: { current: 0, target: 0 },
        progress_parts: [],
        image_url: badge.image_url ?? null,
      })
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

          <div className="relative px-4 py-4">
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
                  {earned > 0
                    ? 'دستاورد تماشا و فعالیت در شیوری'
                    : 'با تماشا و فعالیت در شیوری باز می‌شوند'}
                </p>
              </div>

              {earned > 0 || preview.length > 0 ? headerMore : null}
            </div>

            {preview.length > 0 ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 px-1">
                {preview.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => openPreview(badge)}
                    className={profileBadgeShowcaseOuterClass}
                    aria-label={badge.title}
                  >
                    <div className={profileBadgeShowcaseFaceClass(rarityForPreview(badge))}>
                      <BadgeVisual
                        earned
                        imageUrl={badge.image_url}
                        title={badge.title}
                        rarity={rarityForPreview(badge)}
                        size="sm"
                        className="h-11 w-11 drop-shadow-[0_0_18px_rgba(251,191,36,0.35)]"
                      />
                    </div>
                  </button>
                ))}
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
          <DialogContent className="max-w-sm border-border/60 bg-card">
            <DialogHeader className="items-center text-center">
              <BadgeVisual
                earned
                imageUrl={selectedPublic.image_url}
                title={selectedPublic.title}
                rarity={selectedPublic.rarity}
                size="lg"
                className="mb-2"
              />
              <DialogTitle>{selectedPublic.title}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-foreground/85">
                {selectedPublic.description}
              </DialogDescription>
            </DialogHeader>
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
