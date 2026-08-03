import { useMemo, useState } from 'react'
import { StarIcon } from 'hugeicons-react'
import FavoriteAnimeEditor from '@/components/FavoriteAnimeEditor'
import { BidiText } from '@/components/BidiText'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { formatUserListSaveError } from '@/services/userListErrors'
import { animeDetailPath } from '@/lib/animePaths'
import {
  deriveWatchStatus,
  displayScore,
  toPersianNumber,
  WATCH_STATUS_LABELS,
  type WatchStatus,
} from '@/lib/myListUtils'
import type { FavoriteProgress } from '@/store/animeStore'
import type { GenreItem } from '@/types/catalog'
import { MyListAnimeRow, MyListBadge } from '@/components/my-list/MyListAnimeRow'
import {
  MyListEmptyState,
  MyListErrorState,
  MyListPoster,
  MyListSkeletonCards,
  MyListTabHeader,
} from './MyListUi'

export type WatchlistItem = {
  id: number | string
  slug?: string | null
  title: string
  image: string
  episodesCount: number
  genres: GenreItem[]
  airingStatus?: string | null
  malScore?: number | null
  shioriScore?: number | null
}

const statusTone = (status: WatchStatus) => {
  if (status === 'completed') return 'success' as const
  if (status === 'watching') return 'primary' as const
  return 'warning' as const
}

const WatchlistCard = ({
  anime,
  progress,
  onEdit,
}: {
  anime: WatchlistItem
  progress: FavoriteProgress
  onEdit: () => void
}) => {
  const watchStatus = deriveWatchStatus(progress, anime.episodesCount)
  const score = displayScore(progress.userRating, anime.malScore, anime.shioriScore)
  const maxEpisodes = Math.max(anime.episodesCount, 1)
  const watchPercent = Math.min(
    100,
    Math.round((progress.episodesWatched / maxEpisodes) * 100)
  )

  const episodeLabel =
    progress.episodesWatched > 0
      ? `${toPersianNumber(progress.episodesWatched)}/${toPersianNumber(maxEpisodes)}`
      : `${toPersianNumber(maxEpisodes)} ق`

  return (
    <MyListAnimeRow
      image={anime.image}
      onClick={onEdit}
      progress={watchPercent > 0 ? watchPercent : undefined}
      link={<MyListPoster src={anime.image} />}
      title={
        <BidiText
          as="h3"
          className="text-sm font-semibold text-foreground text-end leading-snug line-clamp-2 break-words"
        >
          {anime.title}
        </BidiText>
      }
      badges={
        <>
          <MyListBadge tone={statusTone(watchStatus)}>
            {WATCH_STATUS_LABELS[watchStatus]}
          </MyListBadge>
          <MyListBadge tone="default">{episodeLabel}</MyListBadge>
          {score ? (
            <MyListBadge tone="default">
              <StarIcon className="h-2.5 w-2.5 fill-amber-400 text-amber-400 inline me-0.5" />
              {score}
            </MyListBadge>
          ) : null}
        </>
      }
    />
  )
}

export const WatchlistTab = () => {
  const { showAlert } = useAppAuth()
  const { favoriteAnime, getProgress, saveProgress, toggleFavorite, isSaving } =
    useUserAnimeList()

  const [editingAnime, setEditingAnime] = useState<WatchlistItem | null>(null)

  const {
    data: favoriteCards = [],
    isLoading: cardsLoading,
    isError: cardsError,
    refetch: refetchCards,
  } = useFavoriteAnimeCardsQuery(favoriteAnime)

  const items = useMemo((): WatchlistItem[] => {
    const byId = new Map<string, WatchlistItem>()
    for (const card of favoriteCards) {
      byId.set(String(card.id), {
        id: card.id,
        slug: card.slug ?? null,
        title: card.title,
        image: card.image,
        episodesCount:
          typeof card.episodes_count === 'number' && card.episodes_count > 0
            ? card.episodes_count
            : 1,
        genres: card.genres ?? [],
        airingStatus: card.airing_status ?? card.status ?? null,
        malScore: card.malScore ?? null,
        shioriScore: card.shioriScore ?? card.averageScore ?? null,
      })
    }
    return favoriteAnime
      .map((id) => byId.get(String(id)))
      .filter((item): item is WatchlistItem => item != null)
  }, [favoriteCards, favoriteAnime])

  const loading = favoriteAnime.length > 0 && items.length === 0 && cardsLoading
  const hasError = favoriteAnime.length > 0 && items.length === 0 && !loading && cardsError
  const isEmpty = !loading && !hasError && favoriteAnime.length === 0

  const handleSave = async (progress: FavoriteProgress) => {
    if (!editingAnime) return
    try {
      await saveProgress(editingAnime.id, progress)
      setEditingAnime(null)
      showAlert('ذخیره شد')
    } catch (e) {
      showAlert(formatUserListSaveError(e))
    }
  }

  const handleRemove = async (anime: WatchlistItem) => {
    try {
      await toggleFavorite(anime.id)
      if (editingAnime?.id === anime.id) setEditingAnime(null)
      showAlert('از لیست تماشا حذف شد')
    } catch (e) {
      showAlert(formatUserListSaveError(e))
    }
  }

  if (isEmpty) {
    return (
      <MyListEmptyState
        title="لیست تماشات خالیه"
        description="انیمه‌هایی که می‌خوای بعداً ببینی رو از صفحهٔ جزئیات با دکمهٔ قلب به لیست تماشا اضافه کن."
      />
    )
  }

  return (
    <div>
      <MyListTabHeader
        title="لیست تماشا"
        meta={`${toPersianNumber(favoriteAnime.length)} انیمه`}
      />

      {loading && <MyListSkeletonCards />}

      {hasError && (
        <MyListErrorState
          message="خطا در بارگذاری لیست تماشا"
          onRetry={() => void refetchCards()}
        />
      )}

      {!loading && !hasError && items.length > 0 && (
        <div className="space-y-2">
          {items.map((anime) => (
            <WatchlistCard
              key={anime.id}
              anime={anime}
              progress={getProgress(anime.id)}
              onEdit={() => setEditingAnime(anime)}
            />
          ))}
        </div>
      )}

      {editingAnime && (
        <FavoriteAnimeEditor
          open={Boolean(editingAnime)}
          onOpenChange={(open) => {
            if (!open) setEditingAnime(null)
          }}
          title={editingAnime.title}
          image={editingAnime.image}
          detailHref={animeDetailPath(editingAnime)}
          episodesCount={editingAnime.episodesCount}
          progress={getProgress(editingAnime.id)}
          saving={isSaving}
          onSave={handleSave}
          onRemove={() => void handleRemove(editingAnime)}
        />
      )}
    </div>
  )
}
