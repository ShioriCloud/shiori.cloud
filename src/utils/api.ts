// App-level API wrapper
import * as catalog from '../services/catalogSource'
import * as shiori from '../services/shioriCatalog'
import { deriveAnimeSlug } from '../lib/animePaths'
import { resolveCatalogAnimeRecordId } from '../lib/resolveCatalogAnimeId'
import { fetchAllAnimeRowsCached, invalidateAllAnimeRowsCache } from '../lib/animeCatalogCache'

// Lightweight card shape used across Home/Search UIs
export type UiAnimeCard = {
  id: number | string
  slug?: string | null
  title: string
  image: string
  featuredImage?: string
  episode: string
  format?: string
  season?: string
  year?: number
  isNew?: boolean
  isFeatured?: boolean
  favoriteCount?: number
  description?: string
  genres?: catalog.GenreItem[]
}

export type UiStudioLink = {
  slug: string
  name: string
}

import type { AnimeListItem } from '../store/animeStore'

const toGenreItem = (g: any): catalog.GenreItem | null => {
  if (!g) return null
  if (typeof g === 'string') {
    const slug = g.trim().toLowerCase()
    if (!slug) return null
    return { slug, name_en: g }
  }
  if (typeof g === 'object') {
    const slug = typeof g.slug === 'string' ? g.slug.trim().toLowerCase() : ''
    if (!slug) return null
    return {
      slug,
      name_en: typeof g.name_en === 'string' ? g.name_en : undefined,
      name_fa: typeof g.name_fa === 'string' ? g.name_fa : undefined,
    }
  }
  return null
}

const toCacheAnime = (c: any): UiAnimeCard => ({
  id: c.id,
  slug: deriveAnimeSlug(c),
  title: c.title,
  image: c.image,
  featuredImage: c.featuredImage ?? undefined,
  episode: c.episode ?? 'قسمت ۱',
  format: c.format ?? undefined,
  season: c.season ?? undefined,
  year: typeof c.year === 'number' ? c.year : undefined,
  isNew: Boolean(c.isNew || c.is_new),
  isFeatured:
    typeof c.isFeatured === 'boolean'
      ? c.isFeatured
      : typeof c.is_featured === 'boolean'
        ? c.is_featured
        : undefined,
  favoriteCount:
    typeof c.favoriteCount === 'number'
      ? c.favoriteCount
      : typeof c.favorite_count === 'number'
        ? c.favorite_count
        : undefined,
  description: c.description ?? '',
  genres: Array.isArray(c.genres)
    ? c.genres
        .map(toGenreItem)
        .filter((v: any) => v && typeof v.slug === 'string' && v.slug.trim().length > 0)
    : [],
})

const toListItem = (c: any): AnimeListItem => ({
  id: c.id,
  title: c.title,
  image: c.image,
  description: c.description ?? '',
  status: c.status ?? 'RELEASING',
  genres: Array.isArray(c.genres) ? c.genres : [],
  episodes: typeof c.episodes_count === 'number' ? c.episodes_count : 1,
  isNew: Boolean(c.isNew || c.is_new),
  episode: c.episode ?? 'قسمت ۱',
})

// Returns items shaped for AnimeList store (AnimeListItem[])
export const normalizeAnimeFormat = (f: unknown) =>
  String(f ?? '')
    .trim()
    .toUpperCase()

const getAllAnimeCached = fetchAllAnimeRowsCached

/** پاک کردن cache (مثلاً بعد از edit در پنل ادمین) */
export const invalidateAnimeCache = () => {
  invalidateAllAnimeRowsCache()
}

export const fetchAllAnimeCards = async (): Promise<UiAnimeCard[]> => {
  const data = await getAllAnimeCached()
  return data.map(toCacheAnime)
}

export const fetchFeaturedAnimeCards = async (limit = 10): Promise<UiAnimeCard[]> => {
  const rows = await catalog.getFeaturedAnime(limit)
  return rows.map(toCacheAnime)
}

export const fetchPopularAnimeCards = async (limit = 20): Promise<UiAnimeCard[]> => {
  const rows = await catalog.getPopularAnime(limit)
  return rows.map(toCacheAnime)
}

export const fetchRecentAnimeCards = async (limit = 20): Promise<UiAnimeCard[]> => {
  const rows = await catalog.getRecentAnime(limit)
  return rows.map(toCacheAnime)
}

export type HomeFeaturedTab = 'anime' | 'movie' | 'donghua'

export const fetchHomeFeaturedCards = async (tab: HomeFeaturedTab): Promise<UiAnimeCard[]> => {
  if (tab === 'movie') {
    const result = await catalog.searchAnimeCards({
      format: 'MOVIE',
      limit: 12,
      sortBy: 'score',
    })
    const featured = result.items.filter((item) => item.isFeatured)
    return (featured.length > 0 ? featured : result.items).slice(0, 8).map(toCacheAnime)
  }

  if (tab === 'donghua') {
    const result = await catalog.searchAnimeCards({
      format: 'DONGHUA',
      limit: 12,
      sortBy: 'score',
    })
    const featured = result.items.filter((item) => item.isFeatured)
    return (featured.length > 0 ? featured : result.items).slice(0, 8).map(toCacheAnime)
  }

  const rows = await catalog.getFeaturedAnime(12)
  const filtered = rows.filter((item) => {
    const format = normalizeAnimeFormat(item.format)
    return format !== 'MOVIE' && format !== 'ONA (CHINESE)'
  })
  return filtered.slice(0, 8).map(toCacheAnime)
}

export const fetchHomeLatestSeasonCards = async (
  year: number,
  season: string,
  limit = 20
): Promise<UiAnimeCard[]> => {
  const result = await catalog.searchAnimeCards({
    year,
    season: season.toUpperCase(),
    limit,
    sortBy: 'created_at',
  })
  return result.items.map(toCacheAnime)
}

export const fetchHomeFormatSectionCards = async (
  format: 'DONGHUA' | 'MOVIE',
  limit = 20
): Promise<UiAnimeCard[]> => {
  const result = await catalog.searchAnimeCards({
    format,
    limit,
    sortBy: 'created_at',
  })
  return result.items.map(toCacheAnime)
}

export const filterAnimeCardsBySection = (
  mapped: UiAnimeCard[],
  section?: string
): UiAnimeCard[] => {
  if (section === 'movies') {
    return mapped.filter((a) => normalizeAnimeFormat(a.format) === 'MOVIE')
  }
  if (section === 'donghua') {
    return mapped.filter((a) => normalizeAnimeFormat(a.format) === 'ONA (CHINESE)')
  }
  if (section === 'popular') {
    const allowed = new Set(['TV', 'ONA', 'SPECIAL', 'MOVIE'])
    return mapped.filter((a) => allowed.has(normalizeAnimeFormat(a.format)))
  }
  if (section === 'latest') {
    const allowed = new Set(['TV', 'ONA', 'OVA', 'SPECIAL'])
    return mapped.filter((a) => allowed.has(normalizeAnimeFormat(a.format)))
  }
  return mapped
}

export const fetchAnimeList = async (_section?: string): Promise<AnimeListItem[]> => {
  const data = await getAllAnimeCached()
  return data.map(toListItem)
}

// Returns items shaped for cache cards on Home/Search (UiAnimeCard[])
export const fetchAnimeCards = async (_section?: string): Promise<UiAnimeCard[]> => {
  const mapped = await fetchAllAnimeCards()
  return filterAnimeCardsBySection(mapped, _section)
}

export type AnimeSearchFilters = {
  query?: string
  year?: number | null
  season?: string | null
  genreSlug?: string | null
  genreSlugs?: string[]
  format?: string | null
  airingStatus?: string | null
  sortBy?: 'created_at' | 'popular' | 'title' | 'score'
  limit?: number
  offset?: number
}

export const fetchAnimeSearch = async (
  filters: AnimeSearchFilters = {}
): Promise<{ items: UiAnimeCard[]; total: number; hasMore: boolean }> => {
  const result = await catalog.searchAnimeCards(filters)
  return {
    items: result.items.map(toCacheAnime),
    total: result.total,
    hasMore: result.hasMore,
  }
}

export const fetchSimilarAnime = async (
  animeId: number | string,
  genreSlugs: string[],
  limit = 12
): Promise<UiAnimeCard[]> => {
  const list = await catalog.getSimilarAnimeCards(animeId, genreSlugs, limit)
  return list.map(toCacheAnime)
}

// دریافت جزئیات یک انیمه + لیست قسمت‌ها
export const fetchAnimeById = async (
  idOrSlug: number | string,
  options?: { includeSeries?: boolean }
) => {
  const includeSeries = options?.includeSeries !== false
  const raw = String(idOrSlug ?? '').trim()

  let detail: Awaited<ReturnType<typeof shiori.getAnimeDetailById>>
  try {
    detail = await shiori.getAnimeDetailById(raw)
  } catch {
    const resolvedId = await resolveCatalogAnimeRecordId(raw)
    detail = await shiori.getAnimeDetailById(resolvedId)
  }

  const parts = shiori.mapShioriDetailParts(detail)

  const subtitleMap = new Map<number, string>()
  for (const s of detail.subtitles ?? []) {
    const ep = typeof s.episode_number === 'number' ? s.episode_number : 0
    const link = s.subtitle_link
    if (typeof link === 'string' && link.trim()) subtitleMap.set(ep, link.trim())
  }

  const mergedEpisodes = parts.episodes.map((e) => {
    const subtitle_link = subtitleMap.get(e.number)
    return {
      ...e,
      subtitle_link: subtitle_link ?? undefined,
    }
  })

  const studioLinks: UiStudioLink[] = parts.studioLinks.map((s) => ({
    slug: s.slug,
    name: s.name,
  }))

  return {
    id: detail.id,
    slug: deriveAnimeSlug({ slug: detail.slug, title: detail.title }),
    title: detail.title,
    title_romaji: detail.title_romaji ?? null,
    image: detail.image,
    featured_image: detail.featuredImage ?? detail.image,
    format: detail.format ?? undefined,
    description: detail.description,
    status: detail.status,
    airing_status: detail.airing_status ?? undefined,
    genres: detail.genres,
    episodes: mergedEpisodes,
    subtitles: (detail.subtitles ?? []).map((s) => ({
      subtitle_link: s.subtitle_link ?? undefined,
    })),
    subtitle_packs: parts.subtitlePacks,
    episode_pack: parts.episodePack,
    episodes_count: typeof detail.episodes_count === 'number' ? detail.episodes_count : 0,
    hardsub_language: detail.hardsub_language === 'en' ? 'en' : 'fa',
    video_file_type: detail.video_file_type === 'hardsub' ? 'hardsub' : 'softsub',
    video_resolution:
      detail.video_resolution === '480p' || detail.video_resolution === '720p'
        ? detail.video_resolution
        : '1080p',
    video_encode:
      detail.video_encode === 'x264' ||
      detail.video_encode === 'x265' ||
      detail.video_encode === 'bluray'
        ? detail.video_encode
        : 'x265_10bit',
    averageScore: detail.averageScore,
    malScore: detail.malScore,
    shioriScore: (() => {
      const raw = detail.shioriScore as number | string | null | undefined
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw
      if (raw == null || raw === '') return undefined
      const n = Number(raw)
      return Number.isFinite(n) ? n : undefined
    })(),
    favoriteCount: detail.favoriteCount,
    anilist_id: detail.anilist_id,
    mal_id: detail.mal_id,
    studios: parts.studioNames,
    studio_links: studioLinks,
    producers: [],
    season: detail.season ?? '',
    year: typeof detail.year === 'number' ? detail.year : undefined,
    startDate: detail.startDate ?? '',
    endDate: detail.endDate ?? '',
    series: includeSeries ? parts.series : null,
  }
}

export type AnimeDetail = Awaited<ReturnType<typeof fetchAnimeById>>

export type AnimeDetailShell = AnimeDetail & { __shell: true }

export const isAnimeDetailShell = (data: unknown): data is AnimeDetailShell =>
  Boolean(
    data &&
      typeof data === 'object' &&
      '__shell' in data &&
      (data as { __shell?: boolean }).__shell === true
  )

/** اسکلت فوری از کش کارت‌ها — قبل از fetch کامل جزئیات */
export const buildAnimeDetailPlaceholder = (card: UiAnimeCard): AnimeDetailShell => ({
  id: String(card.id),
  slug: card.slug ?? null,
  title: card.title,
  title_romaji: null,
  image: card.image,
  featured_image: card.featuredImage ?? card.image,
  format: card.format,
  description: card.description ?? '',
  status: 'RELEASING',
  airing_status: undefined,
  genres: card.genres ?? [],
  episodes: [],
  subtitles: [],
  subtitle_packs: [],
  episode_pack: null,
  episodes_count: 0,
  hardsub_language: 'fa',
  video_file_type: 'softsub',
  video_resolution: '1080p',
  video_encode: 'x265_10bit',
  averageScore: undefined,
  malScore: undefined,
  shioriScore: undefined,
  anilist_id: undefined,
  mal_id: undefined,
  studios: [],
  studio_links: [],
  producers: [],
  season: card.season ?? '',
  year: typeof card.year === 'number' ? card.year : undefined,
  startDate: '',
  endDate: '',
  series: null,
  __shell: true,
})

export const fetchAnimeByStudioSlug = async (slug: string): Promise<UiAnimeCard[]> => {
  const list = await catalog.getAnimeCardsByStudioSlug(slug)
  return list.map(toCacheAnime)
}

const SCHEDULE_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
] as const

const buildEmptySchedulePayload = (): catalog.SchedulePayload => {
  const schedule: Record<string, catalog.ScheduleAnimeItem[]> = {}
  for (const day of SCHEDULE_DAYS) schedule[day] = []
  return { schedule, currentSeason: '', currentYear: 0 }
}

const getCurrentAiringSeason = (): 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' => {
  const m = new Date().getMonth() + 1
  if (m >= 1 && m <= 3) return 'WINTER'
  if (m >= 4 && m <= 6) return 'SPRING'
  if (m >= 7 && m <= 9) return 'SUMMER'
  return 'FALL'
}

const toPersianWeekday = (d: Date): string => {
  const dayMap: Record<number, string> = {
    0: 'یکشنبه',
    1: 'دوشنبه',
    2: 'سه‌شنبه',
    3: 'چهارشنبه',
    4: 'پنج‌شنبه',
    5: 'جمعه',
    6: 'شنبه',
  }
  return dayMap[d.getDay()] ?? ''
}

const enrichScheduleWithLocalIds = async (
  payload: catalog.SchedulePayload
): Promise<catalog.SchedulePayload> => {
  const anilistIds = Object.values(payload.schedule)
    .flat()
    .map((item) => item.id)
    .filter((id) => Number.isFinite(id) && id > 0)

  if (anilistIds.length === 0) return payload

  const localMap = await catalog.getLocalAnimeIdsByAniListIds(anilistIds)
  const schedule: Record<string, catalog.ScheduleAnimeItem[]> = {}
  for (const [day, list] of Object.entries(payload.schedule)) {
    schedule[day] = list.map((anime) => ({
      ...anime,
      localId: localMap.get(anime.id) ?? null,
    }))
  }

  return { ...payload, schedule }
}

const countScheduleItems = (payload: catalog.SchedulePayload): number =>
  Object.values(payload.schedule).reduce((sum, list) => sum + list.length, 0)

const fetchScheduleFromAniListClient = async (): Promise<catalog.SchedulePayload> => {
  const currentSeason = getCurrentAiringSeason()
  const currentYear = new Date().getFullYear()
  const empty = buildEmptySchedulePayload()
  empty.currentSeason = currentSeason
  empty.currentYear = currentYear

  const query = `
    query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
      Page(page: $page, perPage: $perPage) {
        media(
          season: $season
          seasonYear: $seasonYear
          status: RELEASING
          type: ANIME
          sort: POPULARITY_DESC
        ) {
          id
          format
          title { romaji english native }
          coverImage { large }
          genres
          nextAiringEpisode { airingAt episode }
        }
      }
    }
  `

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { page: 1, perPage: 50, season: currentSeason, seasonYear: currentYear },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AniList request failed: ${res.status} ${text}`)
  }

  const json = await res.json()
  if (json?.errors?.length) {
    throw new Error(json.errors?.[0]?.message || 'AniList query error')
  }

  const mediaList: any[] = json?.data?.Page?.media ?? []
  const schedule = { ...empty.schedule }

  for (const m of mediaList) {
    const allowedFormats = new Set(['TV', 'ONA', 'OVA', 'SPECIAL'])
    const format = typeof m?.format === 'string' ? m.format.trim().toUpperCase() : ''
    if (!allowedFormats.has(format)) continue

    const ep = m?.nextAiringEpisode
    if (!ep || typeof ep.airingAt !== 'number') continue

    const airingAtMs = ep.airingAt * 1000
    if (!Number.isFinite(airingAtMs)) continue

    const d = new Date(airingAtMs)
    const day = toPersianWeekday(d)
    if (!schedule[day]) continue

    const title =
      (typeof m?.title?.english === 'string' && m.title.english.trim()) ||
      (typeof m?.title?.romaji === 'string' && m.title.romaji.trim()) ||
      (typeof m?.title?.native === 'string' && m.title.native.trim()) ||
      'بدون عنوان'

    const time = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tehran',
    }).format(d)

    schedule[day].push({
      id: m.id,
      title,
      time,
      episode: String(ep.episode ?? ''),
      image: m?.coverImage?.large ?? '',
      genres: Array.isArray(m?.genres)
        ? m.genres
            .filter((g: unknown) => typeof g === 'string' && g.trim().length > 0)
            .map((g: string) => ({ slug: g.trim().toLowerCase(), name_en: g }))
        : [],
      localId: null,
    })
  }

  for (const day of Object.keys(schedule)) {
    schedule[day].sort((a, b) => String(a.time).localeCompare(String(b.time), 'fa'))
  }

  return enrichScheduleWithLocalIds({ schedule, currentSeason, currentYear })
}

const loadSchedulePayload = async (): Promise<catalog.SchedulePayload> => {
  try {
    const fromApi = await catalog.getAiringSchedule()
    if (!fromApi.degraded && countScheduleItems(fromApi) > 0) {
      return fromApi
    }
  } catch {
    // API unavailable or returned degraded payload — fall back to client AniList
  }

  return fetchScheduleFromAniListClient()
}

export const fetchSchedule = async () => {
  const cacheKey = 'shiori_schedule_v2'
  const cacheTtlMs = 10 * 60 * 1000

  try {
    const raw = sessionStorage.getItem(cacheKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.ts === 'number' &&
        Date.now() - parsed.ts < cacheTtlMs &&
        parsed.data &&
        typeof parsed.data === 'object'
      ) {
        return parsed.data as catalog.SchedulePayload
      }
    }
  } catch {
    // ignore
  }

  const data = await loadSchedulePayload()

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // ignore
  }

  return data
}
