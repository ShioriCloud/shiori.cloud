import { useEffect, useMemo, useRef } from 'react'
import type { UiAnimeCard } from '@/utils/api'
import { AnimePosterCard, AnimePosterSkeletonGrid } from '@/components/anime/AnimePosterCard'
import { useInfiniteScrollSentinel } from '@/hooks/useInfiniteScrollSentinel'
import { ExploreEmptyState } from './ExploreUi'

const GRID_COLS = 3
/** Fill incomplete last row, then two full skeleton rows while next page loads. */
const nextPageSkeletonCount = (itemCount: number) => {
  const remainder = itemCount % GRID_COLS
  const fillLastRow = remainder === 0 ? 0 : GRID_COLS - remainder
  return fillLastRow + GRID_COLS * 2
}

type ExploreInfiniteAnimeListProps = {
  items: UiAnimeCard[]
  isLoading?: boolean
  isError?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  emptyTitle?: string
  emptySubtitle?: string
}

export const ExploreAnimeSkeletonGrid = AnimePosterSkeletonGrid

export const ExploreInfiniteAnimeList = ({
  items,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  emptyTitle = 'انیمه‌ای پیدا نشد',
  emptySubtitle,
}: ExploreInfiniteAnimeListProps) => {
  const sentinelRef = useInfiniteScrollSentinel({
    hasNextPage,
    isFetching: isFetchingNextPage,
    onLoadMore,
    rootMargin: '1400px 0px',
  })

  // Warm page 2 once after first paint so the first scroll-to-end rarely waits cold.
  // Later pages rely on the early IntersectionObserver rootMargin.
  const warmedForLenRef = useRef(0)
  useEffect(() => {
    if (items.length === 0) {
      warmedForLenRef.current = 0
      return
    }
    if (!hasNextPage || !onLoadMore || isLoading || isFetchingNextPage) return
    // Only auto-fetch the immediate next page after the first screenful (~1 page).
    if (items.length > 40) return
    if (warmedForLenRef.current === items.length) return
    warmedForLenRef.current = items.length

    const run = () => onLoadMore()
    // Prefer a short delay over requestIdleCallback — `in` narrowing makes
    // `window` `never` in some TS DOM lib configs and breaks CI.
    const timer = window.setTimeout(run, 450)
    return () => window.clearTimeout(timer)
  }, [hasNextPage, isLoading, isFetchingNextPage, items.length, onLoadMore])

  if (isLoading && items.length === 0) {
    return <AnimePosterSkeletonGrid className="px-4" />
  }

  if (isError) {
    return (
      <ExploreEmptyState title="خطا در دریافت انیمه‌ها" subtitle="لطفاً دوباره تلاش کنید." />
    )
  }

  if (items.length === 0) {
    return <ExploreEmptyState title={emptyTitle} subtitle={emptySubtitle} />
  }

  const skeletonCount = isFetchingNextPage ? nextPageSkeletonCount(items.length) : 0

  return (
    <div className="px-4 pb-8">
      <div className="grid grid-cols-3 gap-3">
        {items.map((anime, index) => (
          <AnimePosterCard key={String(anime.id)} anime={anime} priority={index < 6} />
        ))}
        {skeletonCount > 0
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={`next-skel-${i}`} className="animate-pulse" aria-hidden>
                <div className="aspect-[2/3] rounded-xl bg-muted" />
              </div>
            ))
          : null}
      </div>
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
    </div>
  )
}

export const useExploreAnimeItems = (
  pages: { items: UiAnimeCard[] }[] | undefined
): UiAnimeCard[] =>
  useMemo(() => pages?.flatMap((p) => p.items) ?? [], [pages])
