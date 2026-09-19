import type { UiAnimeCard } from '@/utils/api'

/** Soft TTL for treating disk cache as fresh enough for React Query initialData. */
export const HOME_RAIL_CACHE_TTL_MS = 4 * 60 * 60 * 1000
/** React Query staleTime for most Home rails. */
export const HOME_RAIL_STALE_MS = 10 * 60_000
/** Season rail refreshes sooner so new episodes bubble up. */
export const HOME_LATEST_RAIL_STALE_MS = 2 * 60_000

export type HomeRailCacheEntry<T> = {
  ts: number
  data: T
}

export const homeFeaturedCacheKey = (tab: string) => `shiori_home_featured_v2:${tab}`
export const homeLatestCacheKey = (year: number, season: string) =>
  `shiori_home_latest_v3:${year}:${String(season).toUpperCase()}`
export const homePopularCacheKey = (limit = 20) => `shiori_home_popular_v2:${limit}`
export const homeRecentCacheKey = (limit = 20) => `shiori_home_recent_v2:${limit}`
export const homeNewEpisodesCacheKey = (limit = 20) => `shiori_home_new_episodes_v1:${limit}`
export const homeFormatCacheKey = (format: string, limit = 20) =>
  `shiori_home_format_v2:${format}:${limit}`
export const homeCustomBlocksCacheKey = () => 'shiori_home_custom_blocks_v4'
/** Custom blocks change from admin — keep disk seed short to avoid stale CTA art. */
export const HOME_CUSTOM_BLOCKS_CACHE_TTL_MS = 5 * 60 * 1000

const isUsableCardList = (rows: unknown): rows is UiAnimeCard[] =>
  Array.isArray(rows) && rows.length > 0

export const peekHomeRailCache = <T>(
  key: string,
  opts?: {
    maxAgeMs?: number
    isUsable?: (data: T) => boolean
  }
): HomeRailCacheEntry<T> | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<HomeRailCacheEntry<T>>
    if (!parsed || typeof parsed.ts !== 'number' || !Number.isFinite(parsed.ts)) {
      return null
    }
    if (parsed.data === undefined) return null
    if (opts?.isUsable && !opts.isUsable(parsed.data as T)) return null
    if (typeof opts?.maxAgeMs === 'number' && Date.now() - parsed.ts > opts.maxAgeMs) {
      return null
    }
    return { ts: parsed.ts, data: parsed.data as T }
  } catch {
    return null
  }
}

export const writeHomeRailCache = <T>(
  key: string,
  data: T,
  isUsable?: (data: T) => boolean
): void => {
  if (isUsable && !isUsable(data)) return
  try {
    const entry: HomeRailCacheEntry<T> = { ts: Date.now(), data }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // quota / private mode
  }
}

export const peekHomeCardRail = (
  key: string
): HomeRailCacheEntry<UiAnimeCard[]> | null =>
  peekHomeRailCache<UiAnimeCard[]>(key, {
    maxAgeMs: HOME_RAIL_CACHE_TTL_MS,
    isUsable: isUsableCardList,
  })

export const writeHomeCardRail = (key: string, data: UiAnimeCard[]): void => {
  writeHomeRailCache(key, data, isUsableCardList)
}

/**
 * Network fetch for RQ; writes disk only after a usable success.
 * Unlike yesterday's network-first wrapper, this never blocks paint —
 * initialData comes from peek separately.
 */
export const fetchHomeCardRail = async (
  key: string,
  fetch: () => Promise<UiAnimeCard[]>
): Promise<UiAnimeCard[]> => {
  const data = await fetch()
  writeHomeCardRail(key, data)
  return data
}
