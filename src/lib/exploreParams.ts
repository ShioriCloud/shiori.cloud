import type {
  ExploreSortKey,
  SearchAiringStatusKey,
  SearchFormatKey,
  SearchHardsubLanguageKey,
  SearchSeasonKey,
  SearchSortKey,
  SearchUrlFilters,
} from '@/lib/searchFilters'
import {
  EXPLORE_SORT_OPTIONS,
  SEARCH_AIRING_STATUSES,
  SEARCH_FORMATS,
  SEARCH_SEASONS,
  getCurrentSeasonKey,
  getCurrentSeasonYear,
  parseSearchParams,
  translateExploreSort,
  translateSeason,
} from '@/lib/searchFilters'

export type ExploreTab = 'all' | 'seasonal' | 'genres'

export type ExploreState = {
  tab: ExploreTab
  query: string
  format: SearchFormatKey | null
  hardsub: SearchHardsubLanguageKey | null
  sortBy: ExploreSortKey
  genreSlugs: string[]
  airingStatus: SearchAiringStatusKey | null
  /** Optional season/year filters on «همه انیمه‌ها» (not the seasonal tab picker). */
  listSeason: SearchSeasonKey | null
  listYear: number | null
  /** Seasonal-tab picker values. */
  season: SearchSeasonKey
  year: number
}

const parseTab = (value: string | null): ExploreTab => {
  if (value === 'seasonal' || value === 'genres') return value
  return 'all'
}

const parseExploreSort = (value: string | null): ExploreSortKey => {
  const key = String(value ?? '').trim()
  if (EXPLORE_SORT_OPTIONS.some((s) => s.key === key)) return key as ExploreSortKey
  // Legacy Search URLs may use `score`.
  if (key === 'score') return 'popular'
  return 'popular'
}

const parseFormat = (value: string | null): SearchFormatKey | null => {
  const key = String(value ?? '').trim().toUpperCase()
  return SEARCH_FORMATS.some((f) => f.key === key) ? (key as SearchFormatKey) : null
}

const parseHardsub = (value: string | null): SearchHardsubLanguageKey | null => {
  const key = String(value ?? '').trim().toLowerCase()
  return key === 'fa' || key === 'en' ? (key as SearchHardsubLanguageKey) : null
}

const parseSeason = (value: string | null): SearchSeasonKey | null => {
  const key = String(value ?? '').trim().toUpperCase()
  return SEARCH_SEASONS.some((s) => s.key === key) ? (key as SearchSeasonKey) : null
}

const parseAiringStatus = (value: string | null): SearchAiringStatusKey | null => {
  const key = String(value ?? '').trim().toUpperCase()
  return SEARCH_AIRING_STATUSES.some((s) => s.key === key)
    ? (key as SearchAiringStatusKey)
    : null
}

const parseGenreSlugs = (params: URLSearchParams): string[] => [
  ...new Set(
    params
      .getAll('genre')
      .map((g) => g.trim().toLowerCase())
      .filter(Boolean)
  ),
]

const parseYear = (value: string | null): number | null => {
  const yearRaw = Number(value)
  return Number.isFinite(yearRaw) && yearRaw > 0 ? yearRaw : null
}

export const DEFAULT_EXPLORE_STATE: ExploreState = {
  tab: 'all',
  query: '',
  format: null,
  hardsub: null,
  sortBy: 'popular',
  genreSlugs: [],
  airingStatus: null,
  listSeason: null,
  listYear: null,
  season: getCurrentSeasonKey(),
  year: getCurrentSeasonYear(),
}

export const parseExploreParams = (params: URLSearchParams): ExploreState => {
  const tab = parseTab(params.get('tab'))
  const seasonParam = parseSeason(params.get('season'))
  const yearParam = parseYear(params.get('year'))

  const shared = {
    tab,
    query: String(params.get('q') ?? '').trim(),
    format: parseFormat(params.get('format')),
    hardsub: parseHardsub(params.get('hardsub')),
    sortBy: parseExploreSort(params.get('sort')),
    genreSlugs: parseGenreSlugs(params),
    airingStatus: parseAiringStatus(params.get('status')),
  }

  if (tab === 'seasonal') {
    return {
      ...shared,
      listSeason: null,
      listYear: null,
      season: seasonParam ?? getCurrentSeasonKey(),
      year: yearParam ?? getCurrentSeasonYear(),
    }
  }

  return {
    ...shared,
    listSeason: seasonParam,
    listYear: yearParam,
    season: getCurrentSeasonKey(),
    year: getCurrentSeasonYear(),
  }
}

export const buildExploreScrollKey = (state: ExploreState): string => {
  if (state.tab === 'all') {
    return [
      'explore:all',
      state.query,
      state.format ?? '',
      state.hardsub ?? '',
      state.sortBy,
      state.airingStatus ?? '',
      state.listSeason ?? '',
      state.listYear ?? '',
      state.genreSlugs.join(','),
    ].join(':')
  }
  if (state.tab === 'seasonal') {
    return `explore:seasonal:${state.season}:${state.year}`
  }
  return 'explore:genres'
}

export type ExploreAllTabSnapshot = Pick<
  ExploreState,
  | 'query'
  | 'format'
  | 'hardsub'
  | 'sortBy'
  | 'genreSlugs'
  | 'airingStatus'
  | 'listSeason'
  | 'listYear'
>

export const captureExploreAllTabSnapshot = (state: ExploreState): ExploreAllTabSnapshot => ({
  query: state.query,
  format: state.format,
  hardsub: state.hardsub,
  sortBy: state.tab === 'all' ? state.sortBy : 'popular',
  genreSlugs: state.genreSlugs,
  airingStatus: state.airingStatus,
  listSeason: state.listSeason,
  listYear: state.listYear,
})

/**
 * Tab-scoped navigation: seasonal's forced `sort=created_at` / season-year
 * must not leak into the all-tab query key on return.
 */
export const switchExploreTab = (
  state: ExploreState,
  nextTab: ExploreTab,
  allSnapshot: ExploreAllTabSnapshot,
  seasonalPicker?: { season: SearchSeasonKey; year: number }
): ExploreState => {
  if (nextTab === 'seasonal') {
    const season =
      state.tab === 'seasonal'
        ? state.season
        : (seasonalPicker?.season ?? getCurrentSeasonKey())
    const year =
      state.tab === 'seasonal' ? state.year : (seasonalPicker?.year ?? getCurrentSeasonYear())
    return {
      ...state,
      tab: 'seasonal',
      listSeason: null,
      listYear: null,
      season,
      year,
      // URL writes created_at for seasonal; all-tab sort lives in allSnapshot.
      sortBy: 'created_at',
    }
  }

  if (nextTab === 'genres') {
    return {
      ...DEFAULT_EXPLORE_STATE,
      ...allSnapshot,
      tab: 'genres',
      season: getCurrentSeasonKey(),
      year: getCurrentSeasonYear(),
    }
  }

  return {
    ...DEFAULT_EXPLORE_STATE,
    ...allSnapshot,
    tab: 'all',
    season: getCurrentSeasonKey(),
    year: getCurrentSeasonYear(),
  }
}

export const buildExploreParams = (
  state: Partial<ExploreState> & { tab: ExploreTab }
): URLSearchParams => {
  const merged: ExploreState = { ...DEFAULT_EXPLORE_STATE, ...state }
  const params = new URLSearchParams()
  params.set('tab', merged.tab)

  // Seasonal URL is exclusive: only tab + season + year (+ fixed sort).
  // Avoid leaking all-tab q/format/sort into seasonal and back.
  if (merged.tab === 'seasonal') {
    params.set('season', merged.season)
    params.set('year', String(merged.year))
    params.set('sort', 'created_at')
    return params
  }

  const query = merged.query.trim()
  if (query) params.set('q', query)
  if (merged.format) params.set('format', merged.format)
  if (merged.hardsub) params.set('hardsub', merged.hardsub)
  if (merged.airingStatus) params.set('status', merged.airingStatus)
  for (const slug of merged.genreSlugs) params.append('genre', slug)

  if (merged.listSeason) params.set('season', merged.listSeason)
  if (merged.listYear != null) params.set('year', String(merged.listYear))
  if (merged.tab === 'all') {
    params.set('sort', merged.sortBy || 'popular')
  } else if (merged.sortBy && merged.sortBy !== 'popular') {
    params.set('sort', merged.sortBy)
  }

  return params
}

export const countExploreFilters = (
  state: Pick<
    ExploreState,
    'format' | 'hardsub' | 'genreSlugs' | 'airingStatus' | 'listSeason' | 'listYear'
  >
): number =>
  (state.format ? 1 : 0) +
  (state.hardsub ? 1 : 0) +
  (state.airingStatus ? 1 : 0) +
  (state.listSeason ? 1 : 0) +
  (state.listYear != null ? 1 : 0) +
  state.genreSlugs.length

export const exploreStateToSearchUrlFilters = (state: ExploreState): SearchUrlFilters => ({
  query: state.query,
  genreSlugs: state.genreSlugs,
  year: state.listYear,
  season: state.listSeason,
  format: state.format,
  airingStatus: state.airingStatus,
  hardsubLanguage: state.hardsub,
  sortBy: state.sortBy as SearchSortKey,
})

export const applySearchUrlFiltersToExplore = (
  state: ExploreState,
  filters: SearchUrlFilters
): ExploreState => ({
  ...state,
  tab: 'all',
  query: filters.query,
  genreSlugs: filters.genreSlugs,
  listYear: filters.year,
  listSeason: filters.season,
  format: filters.format,
  airingStatus: filters.airingStatus,
  hardsub: filters.hardsubLanguage,
  sortBy: parseExploreSort(filters.sortBy),
})

/** Map legacy `/search?...` query into Explore all-tab params. */
export const buildExploreParamsFromSearchUrl = (params: URLSearchParams): URLSearchParams => {
  const search = parseSearchParams(params)
  return buildExploreParams({
    tab: 'all',
    query: search.query,
    genreSlugs: search.genreSlugs,
    listYear: search.year,
    listSeason: search.season,
    format: search.format,
    airingStatus: search.airingStatus,
    hardsub: search.hardsubLanguage,
    sortBy: parseExploreSort(search.sortBy),
  })
}

export const exploreAllHref = (partial: Partial<ExploreState> = {}): string => {
  const params = buildExploreParams({ tab: 'all', ...partial })
  return `/explore?${params.toString()}`
}

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

type GenreLike = { slug: string; name_fa?: string | null; name_en?: string | null }

const genreLabel = (g: GenreLike) => g.name_fa || g.name_en || g.slug

/** Title shown where Explore used to show only the sort label (e.g. محبوب‌ترین‌ها). */
export const buildExploreAllListTitle = (
  state: ExploreState,
  genres: GenreLike[] = []
): string => {
  if (state.listSeason && state.listYear != null) {
    return `انیمه‌های فصل ${translateSeason(state.listSeason)} ${toPersianNumber(state.listYear)}`
  }
  if (state.genreSlugs.length > 0) {
    const labels = state.genreSlugs.map((slug) => {
      const match = genres.find((g) => g.slug === slug)
      return match ? genreLabel(match) : slug
    })
    if (labels.length === 1) return `انیمه‌های ژانر ${labels[0]}`
    return `انیمه‌های ${labels.join(' و ')}`
  }
  if (state.format === 'MOVIE') return 'انیمه سینمایی'
  if (state.format === 'DONGHUA') return 'دونگهوا'
  if (state.airingStatus === 'RELEASING') return 'در حال پخش'
  return translateExploreSort(state.sortBy)
}
