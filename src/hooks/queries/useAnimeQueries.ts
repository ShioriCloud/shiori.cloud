import { keepPreviousData, useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query'
import { animeCardMatchesRouteParam } from '../../lib/animePaths'
import {
  buildAnimeDetailPlaceholder,
  fetchAllAnimeCards,
  fetchAnimeById,
  fetchAnimeList,
  fetchAnimeSearch,
  fetchHomeFeaturedCards,
  fetchHomeFormatSectionCards,
  fetchHomeLatestSeasonCards,
  fetchPopularAnimeCards,
  fetchRecentAnimeCards,
  fetchSchedule,
  fetchSimilarAnime,
  peekScheduleCache,
  SCHEDULE_CACHE_TTL_MS,
  type AnimeSearchFilters,
  type HomeFeaturedTab,
  type UiAnimeCard,
} from '../../utils/api'
import {
  getAnimeCardsByIds,
  getHomeCustomBlocks,
  getTranslatorLinksByAnimeId,
  listGenres,
} from '../../services/catalogSource'
import { fetchAnilistNextAiring } from '../../services/externalScores'
import { getAnimeFavoriteCount, getAnimeFavoriteCounts } from '../../services/userDataSource'
import {
  fetchHomeCardRail,
  homeCustomBlocksCacheKey,
  homeFeaturedCacheKey,
  homeFormatCacheKey,
  homeLatestCacheKey,
  homePopularCacheKey,
  homeRecentCacheKey,
  HOME_RAIL_CACHE_TTL_MS,
  HOME_RAIL_STALE_MS,
  peekHomeCardRail,
  peekHomeRailCache,
  writeHomeRailCache,
} from '../../lib/homeRailCache'
import {
  EXPLORE_GENRES_STALE_MS,
  EXPLORE_SEARCH_STALE_MS,
  exploreSearchCacheKey,
  isPersistableExploreSearch,
  resolveExploreSearchInitial,
  writeExploreGenres,
  writeExploreSearchPage,
  peekExploreGenres,
} from '../../lib/exploreSearchCache'
import type { HomeCustomBlock } from '../../types/home'
import { queryClient } from '../../lib/queryClient'
import { queryKeys } from './keys'

export type AnimeSearchBaseFilters = Omit<AnimeSearchFilters, 'limit' | 'offset'>

export const buildAnimeSearchQueryKey = (filters: AnimeSearchBaseFilters) =>
  queryKeys.animeSearch({
    query: filters.query ?? '',
    year: filters.year ?? null,
    season: filters.season ?? null,
    genreSlugs: filters.genreSlugs ?? [],
    format: filters.format ?? null,
    airingStatus: filters.airingStatus ?? null,
    hardsubLanguage: filters.hardsubLanguage ?? null,
    sortBy: filters.sortBy ?? 'created_at',
  })

export const useAnimeCardsQuery = () =>
  useQuery({
    queryKey: queryKeys.animeCards,
    queryFn: fetchAllAnimeCards,
  })

export const useHomeFeaturedQuery = (tab: HomeFeaturedTab, enabled = true) => {
  const key = homeFeaturedCacheKey(tab)
  const cached = peekHomeCardRail(key)
  return useQuery({
    queryKey: queryKeys.homeFeatured(tab),
    queryFn: () => fetchHomeCardRail(key, () => fetchHomeFeaturedCards(tab)),
    enabled,
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeLatestQuery = (year: number, season: string, enabled = true) => {
  const key = homeLatestCacheKey(year, season)
  const cached = peekHomeCardRail(key)
  return useQuery({
    queryKey: queryKeys.homeLatest(year, season),
    queryFn: () =>
      fetchHomeCardRail(key, () => fetchHomeLatestSeasonCards(year, season, 20)),
    enabled,
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomePopularQuery = (enabled = true) => {
  const key = homePopularCacheKey(20)
  const cached = peekHomeCardRail(key)
  return useQuery({
    queryKey: queryKeys.homePopular,
    queryFn: () => fetchHomeCardRail(key, () => fetchPopularAnimeCards(20)),
    enabled,
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeRecentQuery = (enabled = true) => {
  const key = homeRecentCacheKey(20)
  const cached = peekHomeCardRail(key)
  return useQuery({
    queryKey: queryKeys.homeRecent,
    queryFn: () => fetchHomeCardRail(key, () => fetchRecentAnimeCards(20)),
    enabled,
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeDonghuaQuery = (enabled = true) => {
  const key = homeFormatCacheKey('DONGHUA', 20)
  const cached = peekHomeCardRail(key)
  return useQuery({
    queryKey: queryKeys.homeDonghua,
    queryFn: () =>
      fetchHomeCardRail(key, () => fetchHomeFormatSectionCards('DONGHUA', 20)),
    enabled,
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeMoviesQuery = (enabled = true) => {
  const key = homeFormatCacheKey('MOVIE', 20)
  const cached = peekHomeCardRail(key)
  return useQuery({
    queryKey: queryKeys.homeMovies,
    queryFn: () =>
      fetchHomeCardRail(key, () => fetchHomeFormatSectionCards('MOVIE', 20)),
    enabled,
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

const isUsableCustomBlocks = (rows: HomeCustomBlock[]): boolean => Array.isArray(rows)

export const useHomeCustomBlocksQuery = (enabled = true) => {
  const key = homeCustomBlocksCacheKey()
  const cached = peekHomeRailCache<HomeCustomBlock[]>(key, {
    maxAgeMs: HOME_RAIL_CACHE_TTL_MS,
    isUsable: isUsableCustomBlocks,
  })
  return useQuery({
    queryKey: queryKeys.homeCustomBlocks,
    queryFn: async () => {
      const data = await getHomeCustomBlocks()
      writeHomeRailCache(key, data, isUsableCustomBlocks)
      return data
    },
    enabled,
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useAnimeFavoriteCountsQuery = () =>
  useQuery({
    queryKey: queryKeys.animeFavoriteCounts,
    queryFn: getAnimeFavoriteCounts,
    staleTime: 60_000,
  })

export const useAnimeFavoriteCountQuery = (animeId: string | number | undefined) =>
  useQuery({
    queryKey: queryKeys.animeFavoriteCount(animeId ?? ''),
    queryFn: () => getAnimeFavoriteCount(animeId!),
    enabled: Boolean(animeId),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  })

const findAnimeCardPlaceholder = (id: string | number): UiAnimeCard | undefined => {
  const route = String(id)
  const cards = queryClient.getQueryData<UiAnimeCard[]>(queryKeys.animeCards)
  const fromCards = cards?.find(
    (c) => String(c.id) === route || animeCardMatchesRouteParam(c, route),
  )
  if (fromCards) return fromCards

  const searchQueries = queryClient.getQueriesData<{ items: UiAnimeCard[] }>({
    queryKey: ['anime', 'search'],
  })
  for (const [, data] of searchQueries) {
    const hit = data?.items?.find(
      (c) => String(c.id) === route || animeCardMatchesRouteParam(c, route),
    )
    if (hit) return hit
  }

  return undefined
}

export const useAnimeDetailQuery = (id: string | number | undefined) =>
  useQuery({
    queryKey: queryKeys.animeDetail(id ?? ''),
    queryFn: () => fetchAnimeById(id!),
    enabled: Boolean(id),
    placeholderData: (previousData) => {
      if (previousData && id) {
        if (String(previousData.id) === String(id)) return previousData
        if (animeCardMatchesRouteParam(previousData, String(id))) return previousData
      }
      if (!id) return undefined
      const card = findAnimeCardPlaceholder(id)
      return card ? buildAnimeDetailPlaceholder(card) : undefined
    },
  })

export const useAnimeListQuery = () =>
  useQuery({
    queryKey: queryKeys.animeList,
    queryFn: () => fetchAnimeList(),
  })

export const useScheduleQuery = () => {
  const cached = peekScheduleCache({ maxAgeMs: SCHEDULE_CACHE_TTL_MS })
  return useQuery({
    queryKey: queryKeys.schedule,
    queryFn: fetchSchedule,
    staleTime: 30 * 60_000,
    gcTime: 2 * 60 * 60_000,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useGenresQuery = () => {
  const cached = peekExploreGenres()
  return useQuery({
    queryKey: queryKeys.genres,
    queryFn: async () => {
      const data = await listGenres()
      writeExploreGenres(data)
      return data
    },
    staleTime: EXPLORE_GENRES_STALE_MS,
    gcTime: EXPLORE_GENRES_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useAnimeSearchQuery = (filters: AnimeSearchFilters, enabled = true) =>
  useQuery({
    queryKey: buildAnimeSearchQueryKey(filters),
    queryFn: () => fetchAnimeSearch(filters),
    enabled,
  })

const DEFAULT_SEARCH_PAGE_SIZE = 48

export const useInfiniteAnimeSearchQuery = (
  filters: AnimeSearchBaseFilters,
  pageSize = DEFAULT_SEARCH_PAGE_SIZE,
  enabled = true
) => {
  const cacheKey = exploreSearchCacheKey(filters, pageSize)
  const persistable = isPersistableExploreSearch(filters)
  const initial = resolveExploreSearchInitial(filters, pageSize)

  return useInfiniteQuery({
    queryKey: [...buildAnimeSearchQueryKey(filters), 'infinite', pageSize] as const,
    queryFn: async ({ pageParam }) => {
      const page = await fetchAnimeSearch({
        ...filters,
        limit: pageSize,
        offset: pageParam,
      })
      if (persistable && pageParam === 0) {
        writeExploreSearchPage(cacheKey, page)
      }
      return page
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined
      return allPages.reduce((sum, page) => sum + page.items.length, 0)
    },
    enabled,
    staleTime: EXPLORE_SEARCH_STALE_MS,
    gcTime: EXPLORE_SEARCH_STALE_MS * 6,
    initialData: initial?.data,
    initialDataUpdatedAt: initial?.updatedAt,
    placeholderData: keepPreviousData,
  })
}
export const useFavoriteAnimeDetailsQueries = (ids: (string | number)[]) =>
  useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.animeDetail(id),
      queryFn: () => fetchAnimeById(id),
      enabled: ids.length > 0,
    })),
  })

/** Single batch request for My List cards (title/image/genres) — not full detail. */
export const useFavoriteAnimeCardsQuery = (ids: (string | number)[]) => {
  const sortedIds = [...ids].map(String).filter(Boolean).sort()

  return useQuery({
    queryKey: queryKeys.favoriteAnimeCards(sortedIds),
    queryFn: () => getAnimeCardsByIds(sortedIds),
    enabled: sortedIds.length > 0,
    staleTime: 60_000,
  })
}

export const useSimilarAnimeQuery = (
  animeId: string | number | undefined,
  genreSlugs: string[],
  enabled: boolean
) =>
  useQuery({
    queryKey: queryKeys.similarAnime(animeId ?? '', genreSlugs),
    queryFn: () => fetchSimilarAnime(animeId!, genreSlugs, 12),
    enabled: enabled && Boolean(animeId) && genreSlugs.length > 0,
  })

export const useTranslatorLinksQuery = (
  animeId: string | number | undefined,
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.translatorLinks(animeId ?? ''),
    queryFn: () => getTranslatorLinksByAnimeId(animeId!),
    enabled: enabled && Boolean(animeId),
  })

/** Client AniList fallback when API next_airing is null (server blocked from AniList). */
export const useAnilistNextAiringQuery = (
  anilistId: number | null | undefined,
  enabled = true
) =>
  useQuery({
    queryKey: queryKeys.anilistNextAiring(anilistId ?? ''),
    queryFn: () => fetchAnilistNextAiring(anilistId!),
    enabled: enabled && Boolean(anilistId && anilistId > 0),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })

/** فیلتر section روی لیست cache‌شده (بدون درخواست جدید) */
export { filterAnimeCardsBySection } from '../../utils/api'

export type { UiAnimeCard }
