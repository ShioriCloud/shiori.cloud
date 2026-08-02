import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query'
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
  type AnimeDetail,
  type AnimeSearchFilters,
  type HomeFeaturedTab,
  type UiAnimeCard,
} from '../../utils/api'
import {
  DETAIL_STALE_MS,
  fetchGenresWithPersist,
  GENRES_CACHE_TTL_MS,
  GENRES_STALE_MS,
  homeFeaturedCacheKey,
  homeFormatCacheKey,
  homeLatestCacheKey,
  homePopularCacheKey,
  homeRecentCacheKey,
  HOME_RAIL_STALE_MS,
  peekAnimeDetailCache,
  peekGenresCache,
  peekHomeCardCache,
} from '../../lib/catalogPersistCache'
import {
  getAnimeCardsByIds,
  getHomeCustomBlocks,
  getTranslatorLinksByAnimeId,
} from '../../services/catalogSource'
import { fetchAnilistNextAiring } from '../../services/externalScores'
import { getAnimeFavoriteCount, getAnimeFavoriteCounts } from '../../services/userDataSource'
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

export const useHomeFeaturedQuery = (tab: HomeFeaturedTab) => {
  const cached = peekHomeCardCache(homeFeaturedCacheKey(tab))
  return useQuery({
    queryKey: queryKeys.homeFeatured(tab),
    queryFn: () => fetchHomeFeaturedCards(tab),
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeLatestQuery = (year: number, season: string) => {
  const cached = peekHomeCardCache(homeLatestCacheKey(year, season))
  return useQuery({
    queryKey: queryKeys.homeLatest(year, season),
    queryFn: () => fetchHomeLatestSeasonCards(year, season, 20),
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomePopularQuery = () => {
  const cached = peekHomeCardCache(homePopularCacheKey(20))
  return useQuery({
    queryKey: queryKeys.homePopular,
    queryFn: () => fetchPopularAnimeCards(20),
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeRecentQuery = () => {
  const cached = peekHomeCardCache(homeRecentCacheKey(20))
  return useQuery({
    queryKey: queryKeys.homeRecent,
    queryFn: () => fetchRecentAnimeCards(20),
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeDonghuaQuery = () => {
  const cached = peekHomeCardCache(homeFormatCacheKey('DONGHUA', 20))
  return useQuery({
    queryKey: queryKeys.homeDonghua,
    queryFn: () => fetchHomeFormatSectionCards('DONGHUA', 20),
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeMoviesQuery = () => {
  const cached = peekHomeCardCache(homeFormatCacheKey('MOVIE', 20))
  return useQuery({
    queryKey: queryKeys.homeMovies,
    queryFn: () => fetchHomeFormatSectionCards('MOVIE', 20),
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
  })
}

export const useHomeCustomBlocksQuery = () =>
  useQuery({
    queryKey: queryKeys.homeCustomBlocks,
    queryFn: getHomeCustomBlocks,
    staleTime: HOME_RAIL_STALE_MS,
    gcTime: HOME_RAIL_STALE_MS * 6,
  })

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

export const useAnimeDetailQuery = (id: string | number | undefined) => {
  const cached = id ? peekAnimeDetailCache<AnimeDetail>(id) : null
  return useQuery({
    queryKey: queryKeys.animeDetail(id ?? ''),
    queryFn: () => fetchAnimeById(id!),
    enabled: Boolean(id),
    staleTime: DETAIL_STALE_MS,
    gcTime: DETAIL_STALE_MS * 12,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.ts,
    placeholderData: (previousData) => {
      if (previousData && id) {
        if (String(previousData.id) === String(id)) return previousData
        if (animeCardMatchesRouteParam(previousData, String(id))) return previousData
      }
      if (cached?.data) return cached.data
      if (!id) return undefined
      const card = findAnimeCardPlaceholder(id)
      return card ? buildAnimeDetailPlaceholder(card) : undefined
    },
  })
}

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
  const cached = peekGenresCache()
  return useQuery({
    queryKey: queryKeys.genres,
    queryFn: fetchGenresWithPersist,
    staleTime: GENRES_STALE_MS,
    gcTime: GENRES_CACHE_TTL_MS,
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
  const season = filters.season ? String(filters.season).toUpperCase() : ''
  const year = typeof filters.year === 'number' ? filters.year : null
  const canSeedFromHome =
    Boolean(season) &&
    year != null &&
    (!filters.query || !String(filters.query).trim()) &&
    !(filters.genreSlugs && filters.genreSlugs.length > 0) &&
    !filters.format &&
    !filters.airingStatus &&
    (filters.sortBy == null || filters.sortBy === 'created_at')

  const homeSeed =
    canSeedFromHome && year != null
      ? peekHomeCardCache(homeLatestCacheKey(year, season))
      : null

  return useInfiniteQuery({
    queryKey: [...buildAnimeSearchQueryKey(filters), 'infinite', pageSize] as const,
    queryFn: ({ pageParam }) =>
      fetchAnimeSearch({
        ...filters,
        limit: pageSize,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined
      return allPages.reduce((sum, page) => sum + page.items.length, 0)
    },
    enabled,
    staleTime: HOME_RAIL_STALE_MS,
    initialData: homeSeed?.data?.length
      ? {
          pages: [
            {
              items: homeSeed.data.slice(0, pageSize),
              // Home rail is a short sample — always allow pagination/refetch.
              total: Math.max(homeSeed.data.length, pageSize + 1),
              hasMore: true,
            },
          ],
          pageParams: [0],
        }
      : undefined,
    initialDataUpdatedAt: homeSeed?.ts,
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
