import type { SocialProfileMe } from '@/services/socialProfile'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

export const filterCurrentlyWatching = (items: WatchedItem[]): WatchedItem[] =>
  items.filter((item) => {
    const watched = item.episodes_watched ?? 0
    const total = item.episodes_total ?? 0
    if (watched <= 0) return false
    if (total <= 0) return true
    return watched < total
  })
