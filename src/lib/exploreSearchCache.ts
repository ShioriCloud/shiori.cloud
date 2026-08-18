import type { GenreAdminItem } from '@/types/catalog'
import type { UiAnimeCard } from '@/utils/api'
import {
  homeFormatCacheKey,
  homeLatestCacheKey,
  homePopularCacheKey,
  homeRecentCacheKey,
  peekHomeCardRail,
  peekHomeRailCache,
  writeHomeRailCache,
  type HomeRailCacheEntry,
} from '@/lib/homeRailCache'

/** Filters used for Explore infinite search keys (no limit/offset). */
export type ExploreSearchFilters = {
  query?: string
  year?: number | null
  season?: string | null
  genreSlugs?: string[]
  format?: string | null
  airingStatus?: string | null
  hardsubLanguage?: string | null
  sortBy?: string | null
}

/** Soft TTL for Explore disk initialData (aligned with Home). */
export const EXPLORE_SEARCH_CACHE_TTL_MS = 4 * 60 * 60 * 1000
/** React Query staleTime for Explore infinite lists. */
export const EXPLORE_SEARCH_STALE_MS = 10 * 60_000
/** Genres change rarely. */
export const EXPLORE_GENRES_STALE_MS = 60 * 60_000
export const EXPLORE_GENRES_CACHE_TTL_MS = 6 * 60 * 60 * 1000

export type ExploreSearchPage = {
  items: UiAnimeCard[]
  total: number
  hasMore: boolean
}

export type ExploreInfiniteInitialData = {
  pages: ExploreSearchPage[]
  pageParams: number[]
}

export const exploreGenresCacheKey = () => 'shiori_genres_v3'

const normalizeSort = (sortBy?: string | null) => sortBy || 'created_at'

/** Stable hash for high-traffic Explore page-1 keys only. */
export const exploreSearchCacheKey = (
  filters: ExploreSearchFilters,
  pageSize: number
): string => {
  const parts = [
    'shiori_explore_search_v1',
    String(filters.query ?? '').trim().toLowerCase(),
    filters.format ?? '',
    filters.hardsubLanguage ?? '',
    filters.airingStatus ?? '',
    (filters.genreSlugs ?? []).slice().sort().join(','),
    filters.season ? String(filters.season).toUpperCase() : '',
    filters.year ?? '',
    normalizeSort(filters.sortBy),
    pageSize,
  ]
  return parts.join(':')
}

/**
 * Only cache defaults / Home see-all shapes — not free-text search or dense filter combos.
 */
export const isPersistableExploreSearch = (filters: ExploreSearchFilters): boolean => {
  if (String(filters.query ?? '').trim()) return false
  if (filters.hardsubLanguage) return false
  if (filters.airingStatus) return false
  if ((filters.genreSlugs?.length ?? 0) > 0) return false

  const sort = normalizeSort(filters.sortBy)
  const hasSeason = Boolean(filters.season) && filters.year != null
  const format = filters.format

  // Seasonal / list season
  if (hasSeason && !format && (sort === 'created_at' || sort === 'popular')) return true

  // Default all + popular / recent
  if (!hasSeason && !format && (sort === 'popular' || sort === 'created_at')) return true

  // Format see-all (movie / donghua)
  if (!hasSeason && (format === 'MOVIE' || format === 'DONGHUA')) return true

  return false
}

const isUsableSearchPage = (page: ExploreSearchPage): boolean =>
  Boolean(page && Array.isArray(page.items) && page.items.length > 0)

export const peekExploreSearchPage = (
  key: string
): HomeRailCacheEntry<ExploreSearchPage> | null =>
  peekHomeRailCache<ExploreSearchPage>(key, {
    maxAgeMs: EXPLORE_SEARCH_CACHE_TTL_MS,
    isUsable: isUsableSearchPage,
  })

export const writeExploreSearchPage = (key: string, page: ExploreSearchPage): void => {
  writeHomeRailCache(key, page, isUsableSearchPage)
}

export const peekExploreGenres = (): HomeRailCacheEntry<GenreAdminItem[]> | null =>
  peekHomeRailCache<GenreAdminItem[]>(exploreGenresCacheKey(), {
    maxAgeMs: EXPLORE_GENRES_CACHE_TTL_MS,
    isUsable: (rows) => Array.isArray(rows) && rows.length > 0,
  })

export const writeExploreGenres = (data: GenreAdminItem[]): void => {
  writeHomeRailCache(exploreGenresCacheKey(), data, (rows) => Array.isArray(rows) && rows.length > 0)
}

export const toInfiniteInitialData = (
  page: ExploreSearchPage,
  ts?: number
): { data: ExploreInfiniteInitialData; updatedAt: number } => ({
  data: { pages: [page], pageParams: [0] },
  updatedAt: ts ?? Date.now(),
})

/**
 * Seed page-1 from a Home rail. Always hasMore:true so a short rail (20)
 * does not stop Explore pagination at pageSize 36.
 */
export const seedExplorePageFromHomeRail = (
  cards: UiAnimeCard[],
  pageSize: number
): ExploreSearchPage => {
  const items = cards.slice(0, pageSize)
  return {
    items,
    total: Math.max(items.length + 1, pageSize + 1),
    hasMore: true,
  }
}

/** Match Home disk rails to Explore filter shapes (see-all / defaults). */
export const peekHomeRailSeedForExplore = (
  filters: ExploreSearchFilters,
  pageSize: number
): HomeRailCacheEntry<ExploreSearchPage> | null => {
  if (String(filters.query ?? '').trim()) return null
  if (filters.hardsubLanguage || filters.airingStatus) return null
  if ((filters.genreSlugs?.length ?? 0) > 0) return null

  const sort = normalizeSort(filters.sortBy)
  const hasSeason = Boolean(filters.season) && filters.year != null
  const format = filters.format

  let railKey: string | null = null

  if (hasSeason && !format && (sort === 'created_at' || sort === 'popular')) {
    railKey = homeLatestCacheKey(Number(filters.year), String(filters.season))
  } else if (!hasSeason && !format && sort === 'popular') {
    railKey = homePopularCacheKey(20)
  } else if (!hasSeason && !format && sort === 'created_at') {
    railKey = homeRecentCacheKey(20)
  } else if (!hasSeason && (format === 'MOVIE' || format === 'DONGHUA')) {
    railKey = homeFormatCacheKey(format, 20)
  }

  if (!railKey) return null
  const rail = peekHomeCardRail(railKey)
  if (!rail) return null
  return {
    ts: rail.ts,
    data: seedExplorePageFromHomeRail(rail.data, pageSize),
  }
}

export const resolveExploreSearchInitial = (
  filters: ExploreSearchFilters,
  pageSize: number
): { data: ExploreInfiniteInitialData; updatedAt: number } | undefined => {
  const key = exploreSearchCacheKey(filters, pageSize)

  if (isPersistableExploreSearch(filters)) {
    const disk = peekExploreSearchPage(key)
    if (disk) return toInfiniteInitialData(disk.data, disk.ts)
  }

  const seeded = peekHomeRailSeedForExplore(filters, pageSize)
  if (seeded) return toInfiniteInitialData(seeded.data, seeded.ts)

  return undefined
}
