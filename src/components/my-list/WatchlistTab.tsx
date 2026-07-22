import { useMemo, useState } from 'react'
import { Delete02Icon, Edit02Icon, StarIcon } from 'hugeicons-react'
import FavoriteAnimeEditor from '@/components/FavoriteAnimeEditor'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { formatUserListSaveError } from '@/services/userListErrors'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import {
  deriveWatchStatus,
  displayScore,
  toPersianNumber,
  WATCH_STATUS_LABELS,
  type WatchStatus,
} from '@/lib/myListUtils'
import type { FavoriteProgress } from '@/store/animeStore'
import type { GenreItem } from '@/types/catalog'
import { cn } from '@/lib/utils'
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
  return 'muted' as const
}

const WatchlistCard = ({
  anime,
  progress,
  onEdit,
  onQuickStatus,
  onRemove,
  busy,
}: {
  anime: WatchlistItem
  progress: FavoriteProgress
  onEdit: () => void
  onQuickStatus: (status: WatchStatus) => void
  onRemove: () => void
  busy: boolean
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
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
    <>
      <MyListAnimeRow
        image={anime.image}
        onMenu={() => setMenuOpen(true)}
        progress={watchPercent > 0 ? watchPercent : undefined}
        link={
          <AnimePrefetchLink
            animeId={animePublicSegment(anime)}
            to={animeDetailPath(anime)}
            className="shrink-0 active:scale-[0.97] transition-transform"
            aria-label={`مشاهده ${anime.title}`}
          >
            <MyListPoster src={anime.image} />
          </AnimePrefetchLink>
        }
        title={
          <AnimePrefetchLink
            animeId={animePublicSegment(anime)}
            to={animeDetailPath(anime)}
            className="block active:scale-[0.99] transition-transform"
          >
            <BidiText
              as="h3"
              className="text-sm font-semibold text-foreground line-clamp-1 text-right leading-5"
            >
              {anime.title}
            </BidiText>
          </AnimePrefetchLink>
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

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-start line-clamp-1">{anime.title}</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">وضعیت تماشا</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(WATCH_STATUS_LABELS) as WatchStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      onQuickStatus(status)
                      setMenuOpen(false)
                    }}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-xs transition-colors',
                      watchStatus === status
                        ? 'border-primary-400/50 bg-primary-400/15 text-primary-400 font-semibold'
                        : 'border-border bg-muted/30 text-foreground hover:bg-muted/50'
                    )}
                  >
                    {WATCH_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 gap-1.5"
                disabled={busy}
                onClick={() => {
                  setMenuOpen(false)
                  onEdit()
                }}
              >
                <Edit02Icon className="h-4 w-4" />
                ویرایش
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-1.5 text-red-400 border-red-500/20"
                disabled={busy}
                onClick={() => {
                  setMenuOpen(false)
                  onRemove()
                }}
              >
                <Delete02Icon className="h-4 w-4" />
                حذف
              </Button>
            </div>
          </div>
          <SheetFooter />
        </SheetContent>
      </Sheet>
    </>
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

  const applyQuickStatus = async (anime: WatchlistItem, status: WatchStatus) => {
    const max = Math.max(anime.episodesCount, 1)
    const current = getProgress(anime.id)
    let episodesWatched = current.episodesWatched
    if (status === 'planning') episodesWatched = 0
    else if (status === 'completed') episodesWatched = max
    else if (episodesWatched <= 0) episodesWatched = 1

    try {
      await saveProgress(anime.id, {
        episodesWatched,
        userRating: current.userRating,
      })
      showAlert('وضعیت به‌روز شد')
    } catch (e) {
      showAlert(formatUserListSaveError(e))
    }
  }

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
              busy={isSaving}
              onEdit={() => setEditingAnime(anime)}
              onQuickStatus={(status) => void applyQuickStatus(anime, status)}
              onRemove={() => void handleRemove(anime)}
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
