import * as catalog from '@/services/catalogSource'

let allAnimeRawCache: { data: Awaited<ReturnType<typeof catalog.getAllAnime>>; ts: number } | null =
  null

const ALL_ANIME_CACHE_TTL_MS = 5 * 60 * 1000

export const fetchAllAnimeRowsCached = async () => {
  if (allAnimeRawCache && Date.now() - allAnimeRawCache.ts < ALL_ANIME_CACHE_TTL_MS) {
    return allAnimeRawCache.data
  }
  const data = await catalog.getAllAnime()
  allAnimeRawCache = { data, ts: Date.now() }
  return data
}

export const invalidateAllAnimeRowsCache = () => {
  allAnimeRawCache = null
}
