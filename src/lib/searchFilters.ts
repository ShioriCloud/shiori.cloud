export const SEARCH_SEASONS = [
  { key: 'WINTER', label: 'زمستان' },
  { key: 'SPRING', label: 'بهار' },
  { key: 'SUMMER', label: 'تابستان' },
  { key: 'FALL', label: 'پاییز' },
] as const

/** Format filters for Explore «همه انیمه‌ها» */
export const EXPLORE_FORMATS = [
  { key: 'TV', label: 'سریال' },
  { key: 'MOVIE', label: 'فیلم' },
  { key: 'OVA', label: 'OVA' },
  { key: 'ONA', label: 'ONA' },
  { key: 'SPECIAL', label: 'Special' },
] as const

export const SEARCH_FORMATS = [
  { key: 'TV', label: 'سریالی' },
  { key: 'MOVIE', label: 'سینمایی' },
  { key: 'DONGHUA', label: 'دونگهوا' },
  { key: 'OVA', label: 'OVA' },
  { key: 'SPECIAL', label: 'ویژه' },
] as const

export const SEARCH_AIRING_STATUSES = [
  { key: 'RELEASING', label: 'در حال پخش' },
  { key: 'FINISHED', label: 'پایان یافته' },
  { key: 'NOT_YET_RELEASED', label: 'منتشر نشده' },
  { key: 'HIATUS', label: 'متوقف شده' },
] as const

export const SEARCH_SORT_OPTIONS = [
  { key: 'created_at', label: 'جدیدترین' },
  { key: 'popular', label: 'محبوب‌ترین' },
  { key: 'title', label: 'نام (الفبا)' },
  { key: 'score', label: 'امتیاز' },
] as const

export const SEARCH_HARDSUB_LANGUAGES = [
  { key: 'fa', label: 'فارسی' },
  { key: 'en', label: 'انگلیسی' },
] as const

/** Sort options for Explore lists */
export const EXPLORE_SORT_OPTIONS = [
  { key: 'popular', label: 'محبوب‌ترین‌ها' },
  { key: 'created_at', label: 'جدیدترین‌ها' },
  { key: 'title', label: 'حروف الفبا' },
] as const

export type SearchSeasonKey = (typeof SEARCH_SEASONS)[number]['key']
export type SearchFormatKey = (typeof SEARCH_FORMATS)[number]['key']
export type ExploreFormatKey = (typeof EXPLORE_FORMATS)[number]['key']
export type SearchAiringStatusKey = (typeof SEARCH_AIRING_STATUSES)[number]['key']
export type SearchSortKey = (typeof SEARCH_SORT_OPTIONS)[number]['key']
export type SearchHardsubLanguageKey = (typeof SEARCH_HARDSUB_LANGUAGES)[number]['key']
export type ExploreSortKey = (typeof EXPLORE_SORT_OPTIONS)[number]['key']

export type SearchUrlFilters = {
  query: string
  genreSlugs: string[]
  year: number | null
  season: SearchSeasonKey | null
  format: SearchFormatKey | null
  airingStatus: SearchAiringStatusKey | null
  hardsubLanguage: SearchHardsubLanguageKey | null
  sortBy: SearchSortKey
}

export const DEFAULT_SEARCH_FILTERS: SearchUrlFilters = {
  query: '',
  genreSlugs: [],
  year: null,
  season: null,
  format: null,
  airingStatus: null,
  hardsubLanguage: null,
  sortBy: 'created_at',
}

export const getCurrentSeasonKey = (): SearchSeasonKey => {
  const month = new Date().getMonth()
  if (month >= 0 && month < 3) return 'WINTER'
  if (month >= 3 && month < 6) return 'SPRING'
  if (month >= 6 && month < 9) return 'SUMMER'
  return 'FALL'
}

export const getCurrentSeasonYear = () => new Date().getFullYear()

export const buildSearchYearOptions = (span = 12): number[] => {
  const current = getCurrentSeasonYear()
  return Array.from({ length: span }, (_, i) => current + 1 - i)
}

export type SeasonYearOption = {
  season: SearchSeasonKey
  year: number
  label: string
}

/** Current season first, then previous seasons (default 12 = 3 years). */
export const buildSeasonYearOptions = (count = 12): SeasonYearOption[] => {
  const seasonOrder: SearchSeasonKey[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  let season = getCurrentSeasonKey()
  let year = getCurrentSeasonYear()
  const options: SeasonYearOption[] = []

  for (let i = 0; i < count; i++) {
    const label = SEARCH_SEASONS.find((s) => s.key === season)?.label ?? season
    options.push({
      season,
      year,
      label: `${label} ${year}`,
    })
    const idx = seasonOrder.indexOf(season)
    if (idx <= 0) {
      season = 'FALL'
      year -= 1
    } else {
      season = seasonOrder[idx - 1]
    }
  }

  return options
}

export const translateSeason = (season: string): string => {
  return SEARCH_SEASONS.find((s) => s.key === season)?.label ?? season
}

export const translateFormat = (format: string): string => {
  return SEARCH_FORMATS.find((f) => f.key === format)?.label ?? format
}

export const translateAiringStatus = (status: string): string => {
  return SEARCH_AIRING_STATUSES.find((s) => s.key === status)?.label ?? status
}

export const translateSort = (sort: string): string => {
  return SEARCH_SORT_OPTIONS.find((s) => s.key === sort)?.label ?? sort
}

export const translateExploreSort = (sort: ExploreSortKey): string => {
  return EXPLORE_SORT_OPTIONS.find((s) => s.key === sort)?.label ?? sort
}

export const formatSeasonYearLabel = (season: SearchSeasonKey, year: number): string => {
  const seasonLabel = SEARCH_SEASONS.find((s) => s.key === season)?.label ?? season
  return `${seasonLabel} ${year}`
}

export const translateHardsubLanguage = (lang: string): string => {
  return SEARCH_HARDSUB_LANGUAGES.find((s) => s.key === lang)?.label ?? lang
}

const parseSeason = (value: string | null): SearchSeasonKey | null => {
  const key = String(value ?? '').trim().toUpperCase()
  return SEARCH_SEASONS.some((s) => s.key === key) ? (key as SearchSeasonKey) : null
}

const parseFormat = (value: string | null): SearchFormatKey | null => {
  const key = String(value ?? '').trim().toUpperCase()
  return SEARCH_FORMATS.some((f) => f.key === key) ? (key as SearchFormatKey) : null
}

const parseAiringStatus = (value: string | null): SearchAiringStatusKey | null => {
  const key = String(value ?? '').trim().toUpperCase()
  return SEARCH_AIRING_STATUSES.some((s) => s.key === key)
    ? (key as SearchAiringStatusKey)
    : null
}

const parseSort = (value: string | null): SearchSortKey => {
  const key = String(value ?? '').trim()
  return SEARCH_SORT_OPTIONS.some((s) => s.key === key) ? (key as SearchSortKey) : 'created_at'
}

const parseHardsubLanguage = (value: string | null): SearchHardsubLanguageKey | null => {
  const key = String(value ?? '').trim().toLowerCase()
  return SEARCH_HARDSUB_LANGUAGES.some((s) => s.key === key)
    ? (key as SearchHardsubLanguageKey)
    : null
}

export const parseSearchParams = (params: URLSearchParams): SearchUrlFilters => {
  const yearRaw = params.get('year')
  const parsedYear = yearRaw ? Number(yearRaw) : null
  const genreSlugs = [
    ...new Set(
      params
        .getAll('genre')
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean)
    ),
  ]

  return {
    query: params.get('q')?.trim() ?? '',
    genreSlugs,
    year: parsedYear != null && Number.isFinite(parsedYear) ? parsedYear : null,
    season: parseSeason(params.get('season')),
    format: parseFormat(params.get('format')),
    airingStatus: parseAiringStatus(params.get('status')),
    hardsubLanguage: parseHardsubLanguage(params.get('hardsub')),
    sortBy: parseSort(params.get('sort')),
  }
}

export const buildSearchParams = (filters: SearchUrlFilters): URLSearchParams => {
  const params = new URLSearchParams()
  if (filters.query.trim()) params.set('q', filters.query.trim())
  filters.genreSlugs.forEach((slug) => params.append('genre', slug))
  if (filters.year != null) params.set('year', String(filters.year))
  if (filters.season) params.set('season', filters.season)
  if (filters.format) params.set('format', filters.format)
  if (filters.airingStatus) params.set('status', filters.airingStatus)
  if (filters.hardsubLanguage) params.set('hardsub', filters.hardsubLanguage)
  if (filters.sortBy !== 'created_at') params.set('sort', filters.sortBy)
  return params
}

export const countActiveSearchFilters = (filters: SearchUrlFilters): number => {
  let count = 0
  count += filters.genreSlugs.length
  if (filters.year != null) count++
  if (filters.season) count++
  if (filters.format) count++
  if (filters.airingStatus) count++
  if (filters.hardsubLanguage) count++
  if (filters.sortBy !== 'created_at') count++
  return count
}

export const toApiSearchFilters = (filters: SearchUrlFilters) => ({
  query: filters.query.trim() || undefined,
  year: filters.year,
  season: filters.season,
  genreSlugs: filters.genreSlugs.length > 0 ? filters.genreSlugs : undefined,
  format: filters.format,
  airingStatus: filters.airingStatus,
  hardsubLanguage: filters.hardsubLanguage,
  sortBy: filters.sortBy,
})
