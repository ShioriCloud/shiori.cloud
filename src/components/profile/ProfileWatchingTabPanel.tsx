import { useMemo } from 'react'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileAnimeLibraryGrid } from '@/components/profile/ProfileAnimeLibraryGrid'
import { filterCurrentlyWatching } from '@/components/profile/profileWatchUtils'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useUserAnimeList } from '@/hooks/useUserAnimeList'
import { deriveWatchStatus } from '@/lib/myListUtils'
import type { SocialProfileMe } from '@/services/socialProfile'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileWatchingTabPanelProps = {
  variant: 'own' | 'public'
  watchedItems?: WatchedItem[]
  watchVisible?: boolean
}

export const ProfileWatchingTabPanel = ({
  variant,
  watchedItems = [],
  watchVisible = true,
}: ProfileWatchingTabPanelProps) => {
  const { listAnimeIds, getProgress } = useUserAnimeList({ syncRemoteList: false })
  const { data: cards = [] } = useFavoriteAnimeCardsQuery(
    variant === 'own' ? listAnimeIds : []
  )

  const ownWatchingItems = useMemo((): WatchedItem[] => {
    if (variant !== 'own') return []
    const byId = new Map(cards.map((c) => [String(c.id), c]))
    const out: WatchedItem[] = []
    for (const id of listAnimeIds) {
      const card = byId.get(String(id))
      if (!card) continue
      const episodesCount =
        typeof card.episodes_count === 'number' && card.episodes_count > 0
          ? card.episodes_count
          : 1
      const progress = getProgress(id)
      if (deriveWatchStatus(progress, episodesCount) !== 'watching') continue
      out.push({
        anime_id: String(card.id),
        slug: card.slug ?? null,
        title: card.title,
        image: card.image,
        episodes_watched: progress.episodesWatched,
        episodes_total: episodesCount,
        user_rating: null,
        updated_at: '',
      })
    }
    return out
  }, [variant, listAnimeIds, cards, getProgress])

  if (variant === 'public' && !watchVisible) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title="لیست تماشا خصوصی است"
        subtitle="این کاربر فعالیت تماشا را عمومی نکرده."
      />
    )
  }

  const items =
    variant === 'own' ? ownWatchingItems : filterCurrentlyWatching(watchedItems)

  return (
    <ProfileAnimeLibraryGrid
      items={items}
      mode="watching"
      emptyTitle={variant === 'public' ? 'در حال تماشای چیزی نیست' : 'الان چیزی در حال تماشا نداری'}
      emptySubtitle={
        variant === 'public'
          ? 'وقتی انیمه‌ای را شروع کند اینجا می‌آید.'
          : 'از لیستت انیمه‌ای را ادامه بده.'
      }
    />
  )
}
