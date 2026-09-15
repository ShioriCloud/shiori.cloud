import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  fetchHomeCardRail,
  homeCustomBlocksCacheKey,
  homeFeaturedCacheKey,
  homeLatestCacheKey,
  homeRecentCacheKey,
  HOME_LATEST_RAIL_STALE_MS,
  HOME_RAIL_CACHE_TTL_MS,
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
export const BOOT_SPLASH_SEGMENT_COUNT = 6

export type BootLoadStageId =
  | 'shell'
  | 'featured'
  | 'recent'
  | 'latest'
  | 'layout'
  | 'ready'

type BootLoadStage = {
  id: BootLoadStageId
  label: string
  done: boolean
}

const isUsableCustomBlocks = (payload: HomeLayoutPayload): boolean =>
  Boolean(payload) && Array.isArray(payload.blocks)

const STAGE_LABELS: Record<BootLoadStageId, string> = {
  shell: 'در حال باز کردن شیوری…',
  featured: 'پیشنهادهای ویژه را می‌چینیم…',
  recent: 'تازه‌ترین‌ها را می‌گیریم…',
  latest: 'فصل جاری را آماده می‌کنیم…',
  layout: 'چیدمان صفحهٔ اصلی…',
  ready: 'آماده‌ایم — بزن بریم!',
}

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
    maxAgeMs: HOME_RAIL_CACHE_TTL_MS,
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

  const [featured, recent, latest, layout] = results

  const shellDone = enabled
  const featuredDone = !featured.isLoading
  const recentDone = !recent.isLoading
  const latestDone = !latest.isLoading
  const layoutDone = !layout.isLoading
  const readyDone = shellDone && featuredDone && recentDone && latestDone && layoutDone

  const stages: BootLoadStage[] = [
    { id: 'shell', label: STAGE_LABELS.shell, done: shellDone },
    { id: 'featured', label: STAGE_LABELS.featured, done: featuredDone },
    { id: 'recent', label: STAGE_LABELS.recent, done: recentDone },
    { id: 'latest', label: STAGE_LABELS.latest, done: latestDone },
    { id: 'layout', label: STAGE_LABELS.layout, done: layoutDone },
    { id: 'ready', label: STAGE_LABELS.ready, done: readyDone },
  ]

  const activeStage = stages.find((stage) => !stage.done) ?? stages[stages.length - 1]!
  const doneCount = stages.filter((stage) => stage.done).length
  const dataReady = readyDone

  return {
    statusLabel: enabled ? activeStage.label : STAGE_LABELS.shell,
    litSegmentCount: enabled ? Math.min(BOOT_SPLASH_SEGMENT_COUNT, doneCount) : 0,
    dataReady,
    segmentCount: BOOT_SPLASH_SEGMENT_COUNT,
  }
}
