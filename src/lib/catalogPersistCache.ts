import {
  fetchWithLocalCache,
  peekLocalCache,
  writeLocalCache,
  type LocalCacheEntry,
} from '@/lib/localQueryCache'
import type { GenreAdminItem } from '@/types/catalog'
import type { UiAnimeCard } from '@/utils/api'
import { listGenres as listGenresNetwork } from '@/services/catalogSource'

/** Soft TTL for Home rail initialData (disk). */
export const HOME_RAIL_CACHE_TTL_MS = 2 * 60 * 60 * 1000
/** React Query staleTime for Home rails. */
export const HOME_RAIL_STALE_MS = 10 * 60_000

export const DETAIL_CACHE_TTL_MS = 3 * 60 * 60 * 1000
export const DETAIL_STALE_MS = 10 * 60_000

export const GENRES_CACHE_TTL_MS = 6 * 60 * 60_000
export const GENRES_STALE_MS = 60 * 60_000

const isUsableCardList = (rows: UiAnimeCard[]): boolean =>
  Array.isArray(rows) && rows.length > 0

type DetailLike = {
  id?: string | number
  title?: string
  slug?: string | null
  __shell?: boolean
}

export const isUsableAnimeDetail = (data: DetailLike): boolean => {
  if (!data || typeof data !== 'object') return false
  if (data.__shell) return false
  return Boolean(String(data.id ?? '').trim() && String(data.title ?? '').trim())
}

const isUsableGenres = (rows: GenreAdminItem[]): boolean =>
  Array.isArray(rows) && rows.length > 0

export const homeFeaturedCacheKey = (tab: string) => `shiori_home_featured_v1:${tab}`
export const homeLatestCacheKey = (year: number, season: string) =>
  `shiori_home_latest_v1:${year}:${String(season).toUpperCase()}`
export const homePopularCacheKey = (limit = 20) => `shiori_home_popular_v1:${limit}`
export const homeRecentCacheKey = (limit = 20) => `shiori_home_recent_v1:${limit}`
export const homeFormatCacheKey = (format: string, limit = 20) =>
  `shiori_home_format_v1:${format}:${limit}`

export const animeDetailCacheKey = (idOrSlug: string | number) =>
  `shiori_anime_detail_v1:${encodeURIComponent(String(idOrSlug).trim())}`

const GENRES_CACHE_KEY = 'shiori_genres_v1'

export const peekHomeCardCache = (
  key: string
): LocalCacheEntry<UiAnimeCard[]> | null =>
  peekLocalCache<UiAnimeCard[]>(key, {
    maxAgeMs: HOME_RAIL_CACHE_TTL_MS,
    isUsable: isUsableCardList,
  })

export const peekAnimeDetailCache = <T extends DetailLike>(
  idOrSlug: string | number
): LocalCacheEntry<T> | null =>
  peekLocalCache<T>(animeDetailCacheKey(idOrSlug), {
    maxAgeMs: DETAIL_CACHE_TTL_MS,
    isUsable: isUsableAnimeDetail,
  })

export const peekGenresCache = (): LocalCacheEntry<GenreAdminItem[]> | null =>
  peekLocalCache<GenreAdminItem[]>(GENRES_CACHE_KEY, {
    maxAgeMs: GENRES_CACHE_TTL_MS,
    isUsable: isUsableGenres,
  })

export const fetchCardsWithPersist = (
  key: string,
  fetch: () => Promise<UiAnimeCard[]>
): Promise<UiAnimeCard[]> =>
  fetchWithLocalCache({
    key,
    fetch,
    isUsable: isUsableCardList,
  })

export const persistAnimeDetailAliases = <T extends DetailLike>(detail: T): void => {
  if (!isUsableAnimeDetail(detail)) return
  writeLocalCache(animeDetailCacheKey(detail.id!), detail, isUsableAnimeDetail)
  const slug = String(detail.slug ?? '').trim()
  if (slug) writeLocalCache(animeDetailCacheKey(slug), detail, isUsableAnimeDetail)
}

export const fetchAnimeDetailWithPersist = async <T extends DetailLike>(
  idOrSlug: string | number,
  fetch: () => Promise<T>
): Promise<T> => {
  const raw = String(idOrSlug ?? '').trim()
  const data = await fetchWithLocalCache({
    key: animeDetailCacheKey(raw),
    fetch,
    isUsable: isUsableAnimeDetail,
  })
  persistAnimeDetailAliases(data)
  return data
}

export const fetchGenresWithPersist = (): Promise<GenreAdminItem[]> =>
  fetchWithLocalCache({
    key: GENRES_CACHE_KEY,
    fetch: listGenresNetwork,
    isUsable: isUsableGenres,
  })
