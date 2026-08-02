import { queryClient } from '../../lib/queryClient'
import {
  fetchAnimeById,
  fetchHomeFeaturedCards,
  fetchHomeFormatSectionCards,
  fetchHomeLatestSeasonCards,
  fetchPopularAnimeCards,
  fetchRecentAnimeCards,
  fetchSchedule,
  fetchSimilarAnime,
} from '../../utils/api'
import { fetchGenresWithPersist, HOME_RAIL_STALE_MS } from '../../lib/catalogPersistCache'
import { queryKeys } from './keys'

/** پیش‌بارگذاری جزئیات انیمه (مثلاً قبل از کلیک روی کارت) */
export const prefetchAnimeDetail = (id: string | number) => {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.animeDetail(id),
    queryFn: () => fetchAnimeById(id),
    staleTime: 10 * 60_000,
  })
}

/** پیش‌بارگذاری برنامه پخش هفتگی (بعد از آماده شدن اپ / Home) */
export const prefetchSchedule = () => {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.schedule,
    queryFn: fetchSchedule,
    staleTime: 30 * 60_000,
  })
}

const getFallbackSeason = (): 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    month: 'numeric',
  }).formatToParts(new Date())
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const m = Number.isFinite(month) ? month : new Date().getMonth() + 1
  if (m >= 1 && m <= 3) return 'WINTER'
  if (m >= 4 && m <= 6) return 'SPRING'
  if (m >= 7 && m <= 9) return 'SUMMER'
  return 'FALL'
}

const getTehranYear = (): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
  }).formatToParts(new Date())
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  return Number.isFinite(year) ? year : new Date().getFullYear()
}

/** پیش‌بارگذاری ریل‌های Home + ژانرها */
export const prefetchHomeCatalog = () => {
  const year = getTehranYear()
  const season = getFallbackSeason()

  void queryClient.prefetchQuery({
    queryKey: queryKeys.homeFeatured('anime'),
    queryFn: () => fetchHomeFeaturedCards('anime'),
    staleTime: HOME_RAIL_STALE_MS,
  })
  void queryClient.prefetchQuery({
    queryKey: queryKeys.homeRecent,
    queryFn: () => fetchRecentAnimeCards(20),
    staleTime: HOME_RAIL_STALE_MS,
  })
  void queryClient.prefetchQuery({
    queryKey: queryKeys.homePopular,
    queryFn: () => fetchPopularAnimeCards(20),
    staleTime: HOME_RAIL_STALE_MS,
  })
  void queryClient.prefetchQuery({
    queryKey: queryKeys.homeLatest(year, season),
    queryFn: () => fetchHomeLatestSeasonCards(year, season, 20),
    staleTime: HOME_RAIL_STALE_MS,
  })
  void queryClient.prefetchQuery({
    queryKey: queryKeys.homeDonghua,
    queryFn: () => fetchHomeFormatSectionCards('DONGHUA', 20),
    staleTime: HOME_RAIL_STALE_MS,
  })
  void queryClient.prefetchQuery({
    queryKey: queryKeys.homeMovies,
    queryFn: () => fetchHomeFormatSectionCards('MOVIE', 20),
    staleTime: HOME_RAIL_STALE_MS,
  })
  void queryClient.prefetchQuery({
    queryKey: queryKeys.genres,
    queryFn: fetchGenresWithPersist,
    staleTime: 60 * 60_000,
  })
}

/** پیش‌بارگذاری سبک بعد از آماده شدن شل — بدون طوفان ریل‌های Home یا schedule. */
export const prefetchLaunchCatalog = () => {
  // Genres only; Home rails hydrate from disk, schedule loads when that page opens.
  void queryClient.prefetchQuery({
    queryKey: queryKeys.genres,
    queryFn: fetchGenresWithPersist,
    staleTime: 60 * 60_000,
  })
}

/** پیش‌بارگذاری آثار مشابه (هنگام فعال شدن تب) */
export const prefetchSimilarAnime = (
  animeId: string | number,
  genreSlugs: string[],
  limit = 12
) => {
  if (!genreSlugs.length) return
  void queryClient.prefetchQuery({
    queryKey: queryKeys.similarAnime(animeId, genreSlugs),
    queryFn: () => fetchSimilarAnime(animeId, genreSlugs, limit),
  })
}
