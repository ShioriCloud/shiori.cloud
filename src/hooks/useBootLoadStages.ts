import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  fetchHomeCardRail,
  homeCustomBlocksCacheKey,
  homeFeaturedCacheKey,
  homeLatestCacheKey,
  homeRecentCacheKey,
  HOME_CUSTOM_BLOCKS_CACHE_TTL_MS,
  HOME_LATEST_RAIL_STALE_MS,
  HOME_RAIL_STALE_MS,
  peekHomeCardRail,
  peekHomeRailCache,
  writeHomeRailCache,
} from '@/lib/homeRailCache'
import { getCurrentSeasonKey, getCurrentSeasonYear } from '@/lib/searchFilters'
import { queryKeys } from '@/hooks/queries/keys'
import type { HomeLayoutPayload } from '@/types/home'
import { getHomeCustomBlocks } from '@/services/catalogSource'
import {
  fetchHomeFeaturedCards,
  fetchHomeLatestSeasonCards,
  fetchRecentAnimeCards,
} from '@/utils/api'

export const BOOT_SPLASH_MAX_MS = 7500

const isUsableCustomBlocks = (payload: HomeLayoutPayload): boolean =>
  Boolean(payload) && Array.isArray(payload.blocks)

/**
 * Prefetch + track Home P0 queries while the boot splash is visible.
 * Shares React Query cache with Home so work is not duplicated.
 */
export function useBootLoadStages(enabled: boolean) {
  const year = getCurrentSeasonYear()
  const season = getCurrentSeasonKey()

  useEffect(() => {
    if (!enabled) return
    void import('@/pages/Home')
  }, [enabled])

  const featuredKey = homeFeaturedCacheKey('anime')
  const recentKey = homeRecentCacheKey(20)
  const latestKey = homeLatestCacheKey(year, season)
  const layoutKey = homeCustomBlocksCacheKey()

  const featuredCached = peekHomeCardRail(featuredKey)
  const recentCached = peekHomeCardRail(recentKey)
  const latestCached = peekHomeCardRail(latestKey)
  const layoutCached = peekHomeRailCache<HomeLayoutPayload>(layoutKey, {
    maxAgeMs: HOME_CUSTOM_BLOCKS_CACHE_TTL_MS,
    isUsable: isUsableCustomBlocks,
  })

  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.homeFeatured('anime'),
        queryFn: () => fetchHomeCardRail(featuredKey, () => fetchHomeFeaturedCards('anime')),
        enabled,
        staleTime: HOME_RAIL_STALE_MS,
        gcTime: HOME_RAIL_STALE_MS * 6,
        initialData: featuredCached?.data,
        initialDataUpdatedAt: featuredCached?.ts,
      },
      {
        queryKey: queryKeys.homeRecent,
        queryFn: () => fetchHomeCardRail(recentKey, () => fetchRecentAnimeCards(20)),
        enabled,
        staleTime: HOME_RAIL_STALE_MS,
        gcTime: HOME_RAIL_STALE_MS * 6,
        initialData: recentCached?.data,
        initialDataUpdatedAt: recentCached?.ts,
      },
      {
        queryKey: queryKeys.homeLatest(year, season),
        queryFn: () =>
          fetchHomeCardRail(latestKey, () => fetchHomeLatestSeasonCards(year, season, 20)),
        enabled,
        staleTime: HOME_LATEST_RAIL_STALE_MS,
        gcTime: HOME_LATEST_RAIL_STALE_MS * 6,
        initialData: latestCached?.data,
        initialDataUpdatedAt: latestCached?.ts,
      },
      {
        queryKey: queryKeys.homeCustomBlocks,
        queryFn: async () => {
          const data = await getHomeCustomBlocks()
          writeHomeRailCache(layoutKey, data, isUsableCustomBlocks)
          return data
        },
        enabled,
        staleTime: 30_000,
        gcTime: HOME_RAIL_STALE_MS * 6,
        initialData: layoutCached?.data,
        initialDataUpdatedAt: layoutCached?.ts,
      },
    ],
  })

  const doneCount = results.filter((query) => !query.isLoading).length
  const total = results.length
  const dataReady = enabled && doneCount >= total
  const progress = enabled ? doneCount / total : 0

  return {
    progress,
    dataReady,
  }
}
