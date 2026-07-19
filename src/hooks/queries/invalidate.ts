import { queryClient } from '../../lib/queryClient'
import { invalidateAnimeCache } from '../../utils/api'
import { queryKeys } from './keys'

/** Invalidate catalog queries after backend data changes */
export const invalidateAnimeQueries = () => {
  invalidateAnimeCache()
  queryClient.invalidateQueries({ queryKey: queryKeys.animeCards })
  queryClient.invalidateQueries({ queryKey: queryKeys.animeList })
  queryClient.invalidateQueries({ queryKey: queryKeys.schedule })
  queryClient.invalidateQueries({ queryKey: ['anime', 'detail'] })
  queryClient.invalidateQueries({ queryKey: ['anime', 'search'] })
}

/** Patch favorite-count caches for an anime (UUID + any slug/detail aliases). */
export const patchAnimeFavoriteCount = (
  animeId: string | number,
  count: number,
  extraIds: Array<string | number> = []
) => {
  const next = Math.max(0, count)
  const ids = new Set<string>([String(animeId), ...extraIds.map(String)])

  for (const [key, data] of queryClient.getQueriesData<{ id?: string | number }>({
    queryKey: ['anime', 'detail', 'v2'],
  })) {
    if (data != null && String(data.id) === String(animeId) && key[3] != null) {
      ids.add(String(key[3]))
    }
  }

  for (const id of ids) {
    queryClient.setQueryData<number>(queryKeys.animeFavoriteCount(id), next)
  }

  queryClient.setQueryData<Record<string, number>>(queryKeys.animeFavoriteCounts, (old) => {
    const map = { ...(old ?? {}) }
    for (const id of ids) map[id] = next
    return map
  })

  // Keep detail payload in sync so AnimeDetail can rely on anime.favoriteCount.
  queryClient.setQueriesData(
    {
      predicate: (query) => {
        if (
          query.queryKey[0] !== 'anime' ||
          query.queryKey[1] !== 'detail' ||
          query.queryKey[2] !== 'v2'
        ) {
          return false
        }
        if (String(query.queryKey[3]) === String(animeId)) return true
        const data = query.state.data as { id?: string | number } | undefined
        return data != null && String(data.id) === String(animeId)
      },
    },
    (old) => {
      if (!old || typeof old !== 'object') return old
      return { ...old, favoriteCount: next }
    }
  )
}

/** Patch shioriScore on any cached detail entry for this anime (UUID or slug key). */
export const patchAnimeDetailShioriScore = (
  animeId: string | number,
  shioriScore: number | null | undefined
) => {
  if (shioriScore === undefined) return
  const id = String(animeId)
  queryClient.setQueriesData(
    {
      predicate: (query) => {
        if (
          query.queryKey[0] !== 'anime' ||
          query.queryKey[1] !== 'detail' ||
          query.queryKey[2] !== 'v2'
        ) {
          return false
        }
        if (String(query.queryKey[3]) === id) return true
        const data = query.state.data as { id?: string | number } | undefined
        return data != null && String(data.id) === id
      },
    },
    (old) => {
      if (!old || typeof old !== 'object') return old
      return { ...old, shioriScore: shioriScore ?? undefined }
    }
  )
}

/** Invalidate detail caches for an anime whether keyed by UUID or public slug. */
export const invalidateAnimeDetailQuery = (animeId: string | number) => {
  const id = String(animeId)
  void queryClient.invalidateQueries({
    predicate: (query) => {
      if (
        query.queryKey[0] !== 'anime' ||
        query.queryKey[1] !== 'detail' ||
        query.queryKey[2] !== 'v2'
      ) {
        return false
      }
      if (String(query.queryKey[3]) === id) return true
      const data = query.state.data as { id?: string | number } | undefined
      return data != null && String(data.id) === id
    },
  })
}
