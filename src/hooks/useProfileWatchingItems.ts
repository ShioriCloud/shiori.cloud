import { useMemo } from 'react'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { deriveWatchStatus } from '@/lib/myListUtils'

const MAX_ITEMS = 5

export type ProfileWatchingItem = {
  id: string | number
  title: string
  image: string
  slug: string | null
  episodesCount: number
  episodesWatched: number
}

/** In-progress anime from the local list (same source as ProfileWatchingRail). */
export const useProfileWatchingItems = () => {
  const { listAnimeIds, getProgress } = useUserAnimeList()
  const { data: cards = [], isLoading } = useFavoriteAnimeCardsQuery(listAnimeIds)

  const items = useMemo(() => {
    const byId = new Map(cards.map((c) => [String(c.id), c]))
    const picked: ProfileWatchingItem[] = []

    for (const id of listAnimeIds) {
      if (picked.length >= MAX_ITEMS) break
      const card = byId.get(String(id))
      if (!card) continue
      const episodesCount =
        typeof card.episodes_count === 'number' && card.episodes_count > 0
          ? card.episodes_count
          : 1
      const progress = getProgress(id)
      if (deriveWatchStatus(progress, episodesCount) !== 'watching') continue
      picked.push({
        id: card.id,
        title: card.title,
        image: card.image,
        slug: card.slug ?? null,
        episodesCount,
        episodesWatched: progress.episodesWatched,
      })
    }
    return picked
  }, [listAnimeIds, cards, getProgress])

  return { items, isLoading }
}
