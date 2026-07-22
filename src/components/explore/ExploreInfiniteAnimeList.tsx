import { useMemo } from 'react'
import type { UiAnimeCard } from '@/utils/api'
import { AnimePosterCard, AnimePosterSkeletonGrid } from '@/components/anime/AnimePosterCard'
import { useInfiniteScrollSentinel } from '@/hooks/useInfiniteScrollSentinel'
import { ExploreEmptyState } from './ExploreUi'

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
  })

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

  return (
    <div className="px-4 pb-8">
      <div className="grid grid-cols-3 gap-3">
        {items.map((anime, index) => (
          <AnimePosterCard key={String(anime.id)} anime={anime} priority={index < 6} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
      {isFetchingNextPage ? (
        <div className="pt-4">
          <AnimePosterSkeletonGrid count={3} className="px-0" />
        </div>
      ) : null}
    </div>
  )
}

export const useExploreAnimeItems = (
  pages: { items: UiAnimeCard[] }[] | undefined
): UiAnimeCard[] =>
  useMemo(() => pages?.flatMap((p) => p.items) ?? [], [pages])
