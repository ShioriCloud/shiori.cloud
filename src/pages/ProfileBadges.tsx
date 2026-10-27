import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ContentLoadingSkeleton } from '@/components/RouteFallback'
import { BadgeDetailDialog } from '@/components/profile/badges/BadgeDetailDialog'
import {
  BadgeProgressBar,
  BadgeRarityLabel,
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

const ProfileBadges = () => {
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
    } else if (draftShowcase.length >= 3) {
      return
    } else {
      setDraftShowcase([...draftShowcase, badgeId])
    }
  }

  const finishShowcaseEdit = () => {
    setShowcaseEdit(false)
    showcaseMutation.mutate(draftShowcase)
  }

  const showcasePreview = useMemo(() => {
    const pool = showcaseEdit
      ? earnedBadges
      : earnedBadges.filter((b) => showcaseSet.has(b.id))
    return pool.slice(0, 3)
  }, [showcaseEdit, earnedBadges, showcaseSet])

  if (isLoading) return <ContentLoadingSkeleton />

  return (
    <div className="bg-background pb-24 text-foreground">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground active:opacity-80"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            پروفایل
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">نشان‌ها</h1>
          <span className="min-w-[3.5rem] text-left text-sm font-medium text-primary-400">
            {toPersianDigits(earned)} از {toPersianDigits(total)}
          </span>
        </div>
      </div>

      {isError || data?.enabled === false ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          نشان‌ها برای حساب شما فعال نیست.
        </p>
      ) : (
        <div className="space-y-8 px-4 pt-5">
          {earnedBadges.length > 0 ? (
            <section className="rounded-2xl border border-border/55 bg-card/80 p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">نشان‌های پروفایل</h2>
                <button
                  type="button"
                  onClick={() =>
                    showcaseEdit ? finishShowcaseEdit() : setShowcaseEdit(true)
                  }
                  className="text-sm font-medium text-primary-400 active:opacity-80"
                >
                  {showcaseEdit ? 'ذخیره' : 'ویرایش'}
                </button>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                حداکثر ۳ نشان دریافت‌شده در پروفایل نمایش داده می‌شود.
              </p>
              <div className="flex flex-wrap justify-center gap-5">
                {showcasePreview.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    disabled={showcaseEdit}
                    onClick={() => !showcaseEdit && setSelected(badge)}
                    className={cn(
                      'flex max-w-[7rem] flex-col items-center gap-2 rounded-xl p-2',
                      !showcaseEdit && 'active:scale-[0.98]',
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
                      size="showcase"
                    />
                    <span className="line-clamp-2 text-center text-xs font-semibold leading-snug">
                      {badge.display_title}
                    </span>
                    <BadgeRarityLabel rarity={badge.rarity} className="text-[11px]" />
                  </button>
                ))}
              </div>
              {showcaseEdit ? (
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {earnedBadges.map((badge) => {
                    const picked = showcaseSet.has(badge.id)
                    const full = draftShowcase.length >= 3 && !picked
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        disabled={full}
                        onClick={() => toggleShowcaseDraft(badge.id)}
                        className={cn(
                          'rounded-xl border border-border/50 p-2.5 text-center text-[11px] font-medium',
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
                {category.badges.map((badge) => {
                  const showHidden = badge.hidden && !badge.earned
                  const showProgress = !badge.earned && !showHidden

                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => setSelected(badge)}
                      className={cn(
                        'flex flex-col rounded-2xl border border-border/55 bg-card/90 p-2.5 text-center',
                        'active:scale-[0.98] transition-transform',
                        badge.earned ? 'min-h-[7.5rem]' : 'min-h-[8.5rem]'
                      )}
                    >
                      <div className="relative mb-1.5">
                        <BadgeVisual
                          earned={badge.earned}
                          hidden={badge.hidden}
                          imageUrl={badge.image_url}
                          title={badge.title}
                          rarity={badge.rarity}
                          size="sm"
                        />
                        {badge.is_new ? (
                          <span
                            className="absolute -right-1 -top-1 rounded-md bg-pink-500/90 px-1 py-0.5 text-[9px] font-bold text-white"
                          >
                            جدید
                          </span>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground">
                        {badge.display_title}
                      </p>
                      <BadgeRarityLabel
                        rarity={badge.rarity}
                        className="mt-1 text-[10px]"
                      />
                      {showProgress ? (
                        <div className="mt-2 w-full">
                          <BadgeProgressBar
                            current={badge.progress.current}
                            target={badge.progress.target}
                            earned={false}
                          />
                          {badge.progress.target > 0 ? (
                            <p className="mt-1 text-[9px] text-muted-foreground">
                              {formatBadgeProgress(
                                badge.progress.current,
                                badge.progress.target
                              )}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <BadgeDetailDialog
        badge={selected}
        open={selected != null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}

export default ProfileBadges
