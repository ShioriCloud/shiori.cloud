import { useMemo } from 'react'
import { Delete02Icon } from 'hugeicons-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useMyListStore } from '@/store/myListStore'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa, toPersianNumber } from '@/lib/myListUtils'
import type { GenreItem } from '@/types/catalog'
import { MyListAnimeRow, MyListBadge } from '@/components/my-list/MyListAnimeRow'
import {
  MyListEmptyState,
  MyListErrorState,
  MyListGhostButton,
  MyListPoster,
  MyListSkeletonCards,
  MyListTabHeader,
} from './MyListUi'

const genreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

export const HistoryTab = () => {
  const browseHistory = useMyListStore((s) => s.browseHistory)
  const removeHistoryEntry = useMyListStore((s) => s.removeHistoryEntry)
  const clearHistory = useMyListStore((s) => s.clearHistory)

  const animeIds = useMemo(() => browseHistory.map((e) => e.animeId), [browseHistory])

  const {
    data: cards = [],
    isLoading,
    isError,
    refetch,
  } = useFavoriteAnimeCardsQuery(animeIds)

  const cardById = useMemo(() => {
    const map = new Map<string, (typeof cards)[number]>()
    for (const card of cards) map.set(String(card.id), card)
    return map
  }, [cards])

  const entries = useMemo(
    () =>
      browseHistory
        .map((entry) => {
          const card = cardById.get(entry.animeId)
          if (!card) return null
          return {
            animeId: entry.animeId,
            viewedAt: entry.viewedAt,
            title: card.title,
            image: card.image,
            slug: card.slug ?? null,
            genre: card.genres?.[0] ?? null,
            episodesCount:
              typeof card.episodes_count === 'number' && card.episodes_count > 0
                ? card.episodes_count
                : null,
          }
        })
        .filter((item): item is NonNullable<typeof item> => item != null),
    [browseHistory, cardById]
  )

  const loading = animeIds.length > 0 && entries.length === 0 && isLoading
  const hasError = animeIds.length > 0 && entries.length === 0 && !loading && isError
  const isEmpty = browseHistory.length === 0

  if (isEmpty) {
    return (
      <MyListEmptyState
        title="تاریخچه‌ات خالیه"
        description="انیمه‌هایی که صفحهٔ جزئیاتشون رو باز کنی، این‌جا با زمان آخرین بازدید نمایش داده می‌شن."
        actionLabel="مرور انیمه‌ها"
      />
    )
  }

  return (
    <div>
      <MyListTabHeader
        title="تاریخچه"
        meta={`${toPersianNumber(browseHistory.length)} بازدید`}
        action={
          <button
            type="button"
            onClick={clearHistory}
            className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
          >
            پاک کردن
          </button>
        }
      />

      {loading && <MyListSkeletonCards />}

      {hasError && (
        <MyListErrorState message="خطا در بارگذاری تاریخچه" onRetry={() => void refetch()} />
      )}

      {!loading && !hasError && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <MyListAnimeRow
              key={entry.animeId}
              image={entry.image}
              link={
                <AnimePrefetchLink
                  animeId={animePublicSegment({ id: entry.animeId, slug: entry.slug })}
                  to={animeDetailPath({ id: entry.animeId, slug: entry.slug })}
                  className="shrink-0 active:scale-[0.97] transition-transform"
                >
                  <MyListPoster src={entry.image} />
                </AnimePrefetchLink>
              }
              title={
                <AnimePrefetchLink
                  animeId={animePublicSegment({ id: entry.animeId, slug: entry.slug })}
                  to={animeDetailPath({ id: entry.animeId, slug: entry.slug })}
                  className="block active:scale-[0.99] transition-transform"
                >
                  <BidiText
                    as="h3"
                    className="text-sm font-semibold text-foreground line-clamp-1 text-right leading-5"
                  >
                    {entry.title}
                  </BidiText>
                </AnimePrefetchLink>
              }
              badges={
                <>
                  <MyListBadge tone="time">{formatRelativeTimeFa(entry.viewedAt)}</MyListBadge>
                  {entry.genre ? (
                    <MyListBadge tone="muted">{genreLabel(entry.genre)}</MyListBadge>
                  ) : entry.episodesCount ? (
                    <MyListBadge tone="default">
                      {toPersianNumber(entry.episodesCount)} ق
                    </MyListBadge>
                  ) : null}
                </>
              }
              trailing={
                <MyListGhostButton
                  aria-label="حذف از تاریخچه"
                  destructive
                  onClick={() => removeHistoryEntry(entry.animeId)}
                >
                  <Delete02Icon className="h-4 w-4" />
                </MyListGhostButton>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
