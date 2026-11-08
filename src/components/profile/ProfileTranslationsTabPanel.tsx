import { useMemo } from 'react'
import { Languages } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import { ProfileSectionMoreLink } from '@/components/profile/ProfileSectionMoreLink'
import { ProfileFavoritesGridSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import {
  profileHighlightGlowClass,
  profileHighlightSectionClass,
} from '@/components/profile/profileHighlightCard'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { sortTranslatorWorksNewestFirst } from '@/lib/translatorWorksSort'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const TOP_RAIL_COUNT = 8

type ProfileTranslationsTabPanelProps = {
  translator: NonNullable<SocialProfileMe['translator']>
  profileUserId: string
  isLoading?: boolean
}

export const ProfileTranslationsTabPanel = ({
  translator,
  profileUserId,
  isLoading = false,
}: ProfileTranslationsTabPanelProps) => {
  const sortedWorks = useMemo(
    () => sortTranslatorWorksNewestFirst(translator.anime ?? []),
    [translator.anime]
  )
  const topRail = sortedWorks.slice(0, TOP_RAIL_COUNT)
  const allPath = `/u/${encodeURIComponent(profileUserId)}/translations`

  if (isLoading) {
    return <ProfileFavoritesGridSkeleton className="!mt-2 !px-4" />
  }

  return (
    <div className="px-4 pt-2 pb-4">
      {topRail.length > 0 ? (
        <div className="mb-4">
          <section className={profileHighlightSectionClass('sky')}>
            <div className={profileHighlightGlowClass('right', 'sky')} aria-hidden />
            <div
              className={cn(profileHighlightGlowClass('left', 'primary'), 'bottom-0 top-auto')}
              aria-hidden
            />
            <div className="relative px-3.5 pt-3 pb-3 text-right" dir="rtl">
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    'border border-sky-400/25 bg-sky-400/15 text-sky-600 dark:text-sky-300'
                  )}
                >
                  <Languages className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-foreground">آثار برتر</h2>
                    <ProfileSectionMoreLink to={allPath} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    {toPersianDigits(translator.anime_count ?? sortedWorks.length)} اثر
                  </p>
                </div>
              </div>
              <div className="relative mt-2.5 pb-1">
                <HomeRailScroller
                  restoreKey={`profile-translations-tab:${profileUserId}`}
                  className="px-0"
                >
                  {topRail.map((item) => {
                    const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
                    const roleLabel = String(item.role ?? '').trim() || 'مترجم'
                    return (
                      <HomeRailSlide key={item.anime_id} className="w-[100px]">
                        <AnimePrefetchLink
                          animeId={animePublicSegment(routeRef)}
                          to={animeDetailPath(routeRef)}
                          className="group block active:scale-[0.98] transition-transform"
                          aria-label={`مشاهده ${item.title}`}
                        >
                          <div className="media-card-skeuo rounded-xl">
                            <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="absolute inset-0 h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : null}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white">
                                {roleLabel}
                              </span>
                              <div className="absolute bottom-0 left-0 right-0 p-2 pt-8">
                                <BidiText
                                  as="p"
                                  className="text-[10px] font-semibold text-white line-clamp-2 text-left"
                                >
                                  {item.title}
                                </BidiText>
                              </div>
                            </div>
                          </div>
                        </AnimePrefetchLink>
                      </HomeRailSlide>
                    )
                  })}
                </HomeRailScroller>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <p className="mb-3 text-xs font-medium text-muted-foreground">همه آثار</p>
      {sortedWorks.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {sortedWorks.map((item) => {
            const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
            return (
              <AnimePrefetchLink
                key={item.anime_id}
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="block active:scale-[0.98] transition-transform"
              >
                <div className="media-card-skeuo rounded-xl">
                  <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                    {item.image ? (
                      <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <BidiText as="p" className="line-clamp-2 text-left text-[10px] font-semibold text-white">
                        {item.title}
                      </BidiText>
                    </div>
                  </div>
                </div>
              </AnimePrefetchLink>
            )
          })}
        </div>
      ) : (
        <ExploreEmptyState compact title="لیست خالی است" subtitle="هنوز انیمه‌ای وصل نشده." />
      )}
    </div>
  )
}
