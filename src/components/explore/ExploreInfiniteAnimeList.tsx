import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FavoriteAnimeEditor from '@/components/FavoriteAnimeEditor'
import { AnimePosterCard, AnimePosterSkeletonGrid } from '@/components/anime/AnimePosterCard'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useInfiniteScrollSentinel } from '@/hooks/useInfiniteScrollSentinel'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { animeDetailPath } from '@/lib/animePaths'
import { formatUserListSaveError } from '@/services/userListErrors'
import type { FavoriteProgress } from '@/store/animeStore'
import type { UiAnimeCard } from '@/utils/api'
import { ExploreEmptyState } from './ExploreUi'

const GRID_COLS = 3
/** Fill incomplete last row, then two full skeleton rows while next page loads. */
const nextPageSkeletonCount = (itemCount: number) => {
  const remainder = itemCount % GRID_COLS
  const fillLastRow = remainder === 0 ? 0 : GRID_COLS - remainder
  return fillLastRow + GRID_COLS * 2
}

const resolveEpisodesCount = (anime: UiAnimeCard) => {
  if (typeof anime.episodesCount === 'number' && anime.episodesCount > 0) return anime.episodesCount
  if (typeof anime.latestEpisodeNumber === 'number' && anime.latestEpisodeNumber > 0) {
    return anime.latestEpisodeNumber
  }
  return 1
}

type ExploreInfiniteAnimeListProps = {
  items: UiAnimeCard[]
  isLoading?: boolean
  /** Soft refetch of the same query — progress shows under the search field, cards stay solid. */
  isRefreshing?: boolean
  isError?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  onRetry?: () => void
  emptyTitle?: string
  emptySubtitle?: string
}

export const ExploreAnimeSkeletonGrid = AnimePosterSkeletonGrid

export const ExploreInfiniteAnimeList = ({
  items,
  isLoading,
  isRefreshing,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRetry,
  emptyTitle = 'انیمه‌ای پیدا نشد',
  emptySubtitle,
}: ExploreInfiniteAnimeListProps) => {
  const { showAlert } = useAppAuth()
  const [editingAnime, setEditingAnime] = useState<UiAnimeCard | null>(null)
  const { getProgress, saveProgress, clearListTracking, isSaving } = useUserAnimeList()

  const sentinelRef = useInfiniteScrollSentinel({
    hasNextPage,
    isFetching: isFetchingNextPage,
    onLoadMore,
    rootMargin: '640px 0px',
  })

  // Warm page 2 once after first paint so the first scroll-to-end rarely waits cold.
  // Later pages rely on the early IntersectionObserver rootMargin.
  const warmedForLenRef = useRef(0)
  useEffect(() => {
    if (items.length === 0) {
      warmedForLenRef.current = 0
      return
    }
    if (!hasNextPage || !onLoadMore || isLoading || isFetchingNextPage || isRefreshing) return
    // Only auto-fetch after a full first page — short seeds used to warm at
    // offset 20 while page-0 later grew to 36 and duplicated rows.
    if (items.length < 36 || items.length > 40) return
    if (warmedForLenRef.current === items.length) return
    warmedForLenRef.current = items.length

    const run = () => onLoadMore()
    // Prefer a short delay over requestIdleCallback — `in` narrowing makes
    // `window` `never` in some TS DOM lib configs and breaks CI.
    const timer = window.setTimeout(run, 450)
    return () => window.clearTimeout(timer)
  }, [hasNextPage, isLoading, isFetchingNextPage, isRefreshing, items.length, onLoadMore])

  const handleSave = useCallback(
    async (progress: FavoriteProgress) => {
      if (!editingAnime) return
      try {
        await saveProgress(editingAnime.id, progress)
        setEditingAnime(null)
        showAlert('ذخیره شد')
      } catch (e) {
        showAlert(formatUserListSaveError(e))
      }
    },
    [editingAnime, saveProgress, showAlert]
  )

  const handleRemove = useCallback(async () => {
    if (!editingAnime) return
    try {
      await clearListTracking(editingAnime.id)
      setEditingAnime(null)
      showAlert('از لیست تماشا حذف شد')
    } catch (e) {
      showAlert(formatUserListSaveError(e))
    }
  }, [clearListTracking, editingAnime, showAlert])

  if (isLoading) {
    return <AnimePosterSkeletonGrid className="px-4" />
  }

  if (isError && items.length === 0) {
    return (
      <ExploreEmptyState
        title="خطا در دریافت انیمه‌ها"
        subtitle="لطفاً دوباره تلاش کنید."
        showImage
        actionLabel={onRetry ? 'تلاش مجدد' : undefined}
        onAction={onRetry}
      />
    )
  }

  if (items.length === 0 && isRefreshing) {
    return <AnimePosterSkeletonGrid className="px-4" />
  }

  if (items.length === 0) {
    return <ExploreEmptyState title={emptyTitle} subtitle={emptySubtitle} />
  }

  const skeletonCount = isFetchingNextPage ? nextPageSkeletonCount(items.length) : 0

  return (
    <div className="relative px-4 pb-8">
      <div className="explore-poster-grid grid grid-cols-3 gap-3" aria-busy={isRefreshing || undefined}>
        {items.map((anime, index) => (
          <div key={String(anime.id)} className="explore-poster-cell">
            <AnimePosterCard
              anime={anime}
              priority={index < 6}
              dense
              onOpenProgress={() => setEditingAnime(anime)}
            />
          </div>
        ))}
        {skeletonCount > 0
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={`next-skel-${i}`} className="animate-pulse explore-poster-cell" aria-hidden>
                <div className="aspect-[2/3] rounded-xl bg-muted" />
              </div>
            ))
          : null}
      </div>
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />

      {editingAnime ? (
        <FavoriteAnimeEditor
          open={Boolean(editingAnime)}
          onOpenChange={(open) => {
            if (!open) setEditingAnime(null)
          }}
          title={editingAnime.title}
          titleRomaji={editingAnime.titleRomaji}
          image={editingAnime.image}
          detailHref={animeDetailPath(editingAnime)}
          episodesCount={resolveEpisodesCount(editingAnime)}
          progress={getProgress(editingAnime.id)}
          saving={isSaving}
          onSave={(progress) => void handleSave(progress)}
          onRemove={() => void handleRemove()}
        />
      ) : null}
    </div>
  )
}

export const useExploreAnimeItems = (
  pages: { items: UiAnimeCard[] }[] | undefined
): UiAnimeCard[] =>
  useMemo(() => {
    const flat = pages?.flatMap((p) => p.items) ?? []
    const seen = new Set<string>()
    return flat.filter((item) => {
      const id = String(item.id ?? '')
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    })
  }, [pages])
