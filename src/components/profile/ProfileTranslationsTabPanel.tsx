import { useEffect, useMemo, useRef, useState } from 'react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileFavoritesGridSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import { ProfileTranslatorPosterCard } from '@/components/profile/ProfileTranslatorPosterCard'
import { ProfileTranslatorSummaryRow } from '@/components/profile/ProfileTranslatorSummaryRow'
import type { SocialProfileMe } from '@/services/socialProfile'
import {
  sortTranslatorWorksByAnilistScore,
  sortTranslatorWorksNewestFirst,
} from '@/lib/translatorWorksSort'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const TOP_WORKS_COUNT = 6
const INITIAL_GRID_COUNT = 15
const GRID_PAGE_SIZE = 15

type ProfileTranslationsTabPanelProps = {
  translator: NonNullable<SocialProfileMe['translator']>
  profileUserId: string
  isLoading?: boolean
}

const PosterSkeleton = () => (
  <div
    className="aspect-[112/160] w-full min-w-0 animate-pulse rounded-[10px] border border-white/[0.08] bg-muted/50"
    aria-hidden
  />
)

export const ProfileTranslationsTabPanel = ({
  translator,
  isLoading = false,
}: ProfileTranslationsTabPanelProps) => {
  const sortedWorks = useMemo(
    () => sortTranslatorWorksNewestFirst(translator.anime ?? []),
    [translator.anime]
  )
  const totalCount = translator.anime_count ?? sortedWorks.length
  const topWorks = useMemo(
    () => sortTranslatorWorksByAnilistScore(sortedWorks).slice(0, TOP_WORKS_COUNT),
    [sortedWorks]
  )

  const [visibleCount, setVisibleCount] = useState(INITIAL_GRID_COUNT)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setVisibleCount(INITIAL_GRID_COUNT)
  }, [translator.id, sortedWorks.length])

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || visibleCount >= sortedWorks.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((prev) =>
            Math.min(prev + GRID_PAGE_SIZE, sortedWorks.length)
          )
        }
      },
      { rootMargin: '120px 0px', threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visibleCount, sortedWorks.length])

  const visibleWorks = sortedWorks.slice(0, visibleCount)
  const loadingMore = visibleCount < sortedWorks.length

  if (isLoading) {
    return <ProfileFavoritesGridSkeleton className="!mt-2 !px-0" />
  }

  if (sortedWorks.length === 0) {
    return (
      <div className="min-w-0 overflow-x-hidden px-4 pb-6 pt-5">
        <ProfileTranslatorSummaryRow
          animeCount={totalCount}
          experience={translator.experience}
        />
        <div className="mt-8">
          <ExploreEmptyState
            compact
            title="لیست خالی است"
            subtitle="هنوز انیمه‌ای وصل نشده."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-7 overflow-x-hidden px-4 pb-8 pt-5">
      <ProfileTranslatorSummaryRow
        animeCount={totalCount}
        experience={translator.experience}
      />

      {topWorks.length > 0 ? (
        <section className="flex min-w-0 flex-col gap-3.5" aria-labelledby="profile-top-translations">
          <h2
            id="profile-top-translations"
            className="text-right text-[15.5px] font-bold leading-snug text-foreground"
          >
            آثار برتر
          </h2>
          <div className="grid min-w-0 grid-cols-3 gap-x-2.5 gap-y-3">
            {topWorks.map((item) => (
              <ProfileTranslatorPosterCard key={item.anime_id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex min-w-0 flex-col gap-3" aria-labelledby="profile-all-translations">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            id="profile-all-translations"
            className="text-[15.5px] font-bold text-foreground"
          >
            همهٔ ترجمه‌ها
          </h2>
          <span
            className={cn(
              'shrink-0 rounded-full bg-[#a78bfa] px-[9px] py-[3px]',
              'text-xs font-medium text-[#3b0764]'
            )}
          >
            {toPersianDigits(totalCount)} انیمه
          </span>
        </div>

        <div className="grid min-w-0 grid-cols-3 gap-x-2.5 gap-y-3">
          {visibleWorks.map((item) => (
            <ProfileTranslatorPosterCard key={`all-${item.anime_id}`} item={item} />
          ))}
        </div>

        {loadingMore ? (
          <>
            <div className="grid min-w-0 grid-cols-3 gap-x-2.5 gap-y-3 opacity-35">
              <PosterSkeleton />
              <PosterSkeleton />
              <PosterSkeleton />
            </div>
            <div
              ref={loadMoreRef}
              className="flex flex-col items-center gap-1 pt-1 text-center"
            >
              <p className="text-[12.5px] font-medium text-muted-foreground">
                در حال بارگذاری ادامهٔ آثار…
              </p>
              <p className="text-[11.5px] text-muted-foreground/80">
                {toPersianDigits(Math.min(visibleCount, sortedWorks.length))} از{' '}
                {toPersianDigits(sortedWorks.length)} نمایش داده شده
              </p>
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}
