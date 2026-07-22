import type {
  ExploreFormatKey,
  ExploreSortKey,
  SearchHardsubLanguageKey,
  SearchSeasonKey,
} from '@/lib/searchFilters'
import {
  EXPLORE_FORMATS,
  EXPLORE_SORT_OPTIONS,
  getCurrentSeasonKey,
  getCurrentSeasonYear,
  SEARCH_SEASONS,
} from '@/lib/searchFilters'

export type ExploreTab = 'all' | 'seasonal' | 'genres'

export type ExploreState = {
  tab: ExploreTab
  format: ExploreFormatKey | null
  hardsub: SearchHardsubLanguageKey | null
  sortBy: ExploreSortKey
  season: SearchSeasonKey
  year: number
}

const parseTab = (value: string | null): ExploreTab => {
  if (value === 'seasonal' || value === 'genres') return value
  return 'all'
}

const parseExploreSort = (value: string | null): ExploreSortKey => {
  const key = String(value ?? '').trim()
  return EXPLORE_SORT_OPTIONS.some((s) => s.key === key) ? (key as ExploreSortKey) : 'popular'
}

const parseExploreFormat = (value: string | null): ExploreFormatKey | null => {
  const key = String(value ?? '').trim().toUpperCase()
  return EXPLORE_FORMATS.some((f) => f.key === key) ? (key as ExploreFormatKey) : null
}

const parseHardsub = (value: string | null): SearchHardsubLanguageKey | null => {
  const key = String(value ?? '').trim().toLowerCase()
  return key === 'fa' || key === 'en' ? (key as SearchHardsubLanguageKey) : null
}

const parseSeason = (value: string | null): SearchSeasonKey | null => {
  const key = String(value ?? '').trim().toUpperCase()
  return SEARCH_SEASONS.some((s) => s.key === key) ? (key as SearchSeasonKey) : null
}

export const parseExploreParams = (params: URLSearchParams): ExploreState => {
  const yearRaw = Number(params.get('year'))
  return {
    tab: parseTab(params.get('tab')),
    format: parseExploreFormat(params.get('format')),
    hardsub: parseHardsub(params.get('hardsub')),
    sortBy: parseExploreSort(params.get('sort')),
    season: parseSeason(params.get('season')) ?? getCurrentSeasonKey(),
    year: Number.isFinite(yearRaw) && yearRaw > 0 ? yearRaw : getCurrentSeasonYear(),
  }
}

export const buildExploreScrollKey = (state: ExploreState): string => {
  if (state.tab === 'all') {
    return `explore:all:${state.format ?? ''}:${state.hardsub ?? ''}:${state.sortBy}`
  }
  if (state.tab === 'seasonal') {
    return `explore:seasonal:${state.season}:${state.year}`
  }
  return 'explore:genres'
}

export const buildExploreParams = (
  state: Partial<ExploreState> & { tab: ExploreTab }
): URLSearchParams => {
  const params = new URLSearchParams()
  params.set('tab', state.tab)

  if (state.tab === 'all') {
    if (state.format) params.set('format', state.format)
    if (state.hardsub) params.set('hardsub', state.hardsub)
    params.set('sort', state.sortBy ?? 'popular')
    return params
  }

  if (state.tab === 'seasonal') {
    params.set('season', state.season ?? getCurrentSeasonKey())
    params.set('year', String(state.year ?? getCurrentSeasonYear()))
    return params
  }

  return params
}

export const countExploreFilters = (state: Pick<ExploreState, 'format' | 'hardsub'>): number =>
  (state.format ? 1 : 0) + (state.hardsub ? 1 : 0)
