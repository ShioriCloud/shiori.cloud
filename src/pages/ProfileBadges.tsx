import { useEffect, useMemo, useState } from 'react'
import { ContentLoadingSkeleton } from '@/components/RouteFallback'
import { BadgeDetailDialog } from '@/components/profile/badges/BadgeDetailDialog'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import {
  BADGE_RARITY_LABEL,
  BadgeProgressBar,
  BadgeVisual,
  formatBadgeProgress,
} from '@/components/profile/badges/badgeUi'
import {
  useSocialBadgeCatalogMe,
  useUpdateSocialBadgeShowcase,
} from '@/hooks/useSocialProfile'
import type { SocialBadgeCatalogItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { isBadgeNew } from '@/lib/badgeFreshness'
import { BadgeNewPill } from '@/components/profile/badges/badgeUi'
import { profileScrollKey, useTabScrollRestoration } from '@/hooks/useTabScrollRestoration'

const SHOWCASE_MAX = 4

const ProfileBadges = () => {
  useTabScrollRestoration(profileScrollKey('badges'))
  const { data, isLoading, isError } = useSocialBadgeCatalogMe(true)
  const showcaseMutation = useUpdateSocialBadgeShowcase()
  const [selected, setSelected] = useState<SocialBadgeCatalogItem | null>(null)
  const [showcaseEdit, setShowcaseEdit] = useState(false)
  const [draftShowcase, setDraftShowcase] = useState<string[]>([])

  const earned = data?.earned_count ?? 0
  const total = data?.total_count ?? 0

  const earnedBadges = useMemo(() => {
    const list: SocialBadgeCatalogItem[] = []
    for (const cat of data?.categories ?? []) {
      for (const b of cat.badges) {
        if (b.earned) list.push(b)
      }
    }
    return list
  }, [data?.categories])

  const activeShowcase = showcaseEdit ? draftShowcase : (data?.showcase ?? [])

  const showcaseSet = useMemo(
    () => new Set(activeShowcase),
    [activeShowcase]
  )

  useEffect(() => {
    if (showcaseEdit) {
      setDraftShowcase(data?.showcase ?? [])
    }
  }, [showcaseEdit, data?.showcase])

  const toggleShowcaseDraft = (badgeId: string) => {
    const has = draftShowcase.includes(badgeId)
    if (has) {
      setDraftShowcase(draftShowcase.filter((id) => id !== badgeId))
    } else if (draftShowcase.length >= SHOWCASE_MAX) {
      return
    } else {
      setDraftShowcase([...draftShowcase, badgeId])
    }
  }

  const finishShowcaseEdit = () => {
    setShowcaseEdit(false)
    showcaseMutation.mutate(draftShowcase)
  }

  if (isLoading) {
    return (
      <ProfilePersonalSubpageLayout title="نشان‌ها">
        <ContentLoadingSkeleton />
      </ProfilePersonalSubpageLayout>
    )
  }

  return (
    <ProfilePersonalSubpageLayout
      title="نشان‌ها"
      titleAddon={
        <span className="text-sm font-medium text-primary-400">
          {toPersianDigits(earned)} از {toPersianDigits(total)}
        </span>
      }
      contentClassName="space-y-8 pt-5"
    >
      {isError || data?.enabled === false ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          نشان‌ها برای حساب شما فعال نیست.
        </p>
      ) : (
        <>
          {earnedBadges.length > 0 ? (
            <section className="rounded-2xl border border-border/55 bg-card/80 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">نشان‌های پروفایل</h2>
                <button
                  type="button"
                  onClick={() =>
                    showcaseEdit ? finishShowcaseEdit() : setShowcaseEdit(true)
                  }
                  className="text-xs font-medium text-primary-400 active:opacity-80"
                >
                  {showcaseEdit ? 'ذخیره' : 'ویرایش'}
                </button>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                حداکثر {toPersianDigits(SHOWCASE_MAX)} نشان دریافت‌شده در پروفایل نمایش داده می‌شود.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(showcaseEdit ? earnedBadges : earnedBadges.filter((b) => showcaseSet.has(b.id)))
                  .slice(0, SHOWCASE_MAX)
                  .map((badge) => (
                    <button
                      key={badge.id}
                      type="button"
                      disabled={!showcaseEdit}
                      onClick={() => showcaseEdit && toggleShowcaseDraft(badge.id)}
                      className={cn(
                        'flex min-w-0 flex-col items-center gap-1 rounded-xl p-1.5',
                        showcaseEdit && 'active:scale-[0.98]',
                        showcaseSet.has(badge.id) && showcaseEdit
                          ? 'ring-2 ring-primary-400/60'
                          : ''
                      )}
                    >
                      <BadgeVisual
                        earned
                        imageUrl={badge.image_url}
                        title={badge.title}
                        rarity={badge.rarity}
                        size="sm"
                        className="h-14 w-14"
                      />
                      <span className="max-w-full truncate text-[10px]">
                        {badge.display_title}
                      </span>
                    </button>
                  ))}
              </div>
              {showcaseEdit ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {earnedBadges.map((badge) => {
                    const picked = showcaseSet.has(badge.id)
                    const full = draftShowcase.length >= SHOWCASE_MAX && !picked
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        disabled={full}
                        onClick={() => toggleShowcaseDraft(badge.id)}
                        className={cn(
                          'rounded-xl border border-border/50 p-2 text-center text-[10px]',
                          picked && 'border-primary-400/50 bg-primary-500/10',
                          full && 'opacity-40'
                        )}
                      >
                        {badge.display_title}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </section>
          ) : null}

          {data?.categories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-3 text-sm font-semibold text-foreground">{category.label}</h2>
              <div className="grid grid-cols-3 gap-2.5">
                {category.badges.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelected(badge)}
                    className={cn(
                      'flex flex-col rounded-2xl border border-border/55 bg-card/90 p-2.5 text-center',
                      'active:scale-[0.98] transition-transform min-h-[8.5rem]'
                    )}
                  >
                    <div className="relative mb-2">
                      <BadgeVisual
                        earned={badge.earned}
                        hidden={badge.hidden}
                        imageUrl={badge.image_url}
                        title={badge.title}
                        rarity={badge.rarity}
                        size="sm"
                      />
                      <p className="text-[9px] text-muted-foreground">
                        {BADGE_RARITY_LABEL[badge.rarity] ?? badge.rarity}
                      </p>
                      {isBadgeNew(badge) ? (
                        <BadgeNewPill className="absolute -right-1 -top-1" />
                      ) : null}
                    </div>
                    <p className="line-clamp-2 flex-1 text-[11px] font-medium leading-snug text-foreground">
                      {badge.display_title}
                    </p>
                    {(() => {
                      const progressDone =
                        badge.earned ||
                        (badge.progress.target > 0 &&
                          badge.progress.current >= badge.progress.target)
                      if (progressDone || (badge.hidden && !badge.earned)) return null
                      if (badge.progress.target <= 0) return null
                      return (
                        <div className="mt-2 w-full">
                          <BadgeProgressBar
                            current={badge.progress.current}
                            target={badge.progress.target}
                            earned={false}
                          />
                          <p className="mt-1 text-[9px] text-muted-foreground">
                            {formatBadgeProgress(
                              badge.progress.current,
                              badge.progress.target
                            )}
                          </p>
                        </div>
                      )
                    })()}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <BadgeDetailDialog
        badge={selected}
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfileBadges
