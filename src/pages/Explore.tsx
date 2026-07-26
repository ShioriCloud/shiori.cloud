import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  applySearchUrlFiltersToExplore,
  buildExploreAllListTitle,
  buildExploreParams,
  buildExploreScrollKey,
  countExploreFilters,
  exploreStateToSearchUrlFilters,
  parseExploreParams,
  type ExploreState,
  type ExploreTab,
} from '@/lib/exploreParams'
import {
  DEFAULT_SEARCH_FILTERS,
  getCurrentSeasonKey,
  getCurrentSeasonYear,
  type ExploreSortKey,
  type SearchSeasonKey,
  type SearchUrlFilters,
} from '@/lib/searchFilters'
import { useGenresQuery, useInfiniteAnimeSearchQuery } from '@/hooks/queries/useAnimeQueries'
import { useTabScrollRestoration } from '@/hooks/useTabScrollRestoration'
import { AppHeader } from '@/components/AppHeader'
import { ExploreGenreGrid } from '@/components/explore/ExploreGenreGrid'
import {
  ExploreInfiniteAnimeList,
  useExploreAnimeItems,
} from '@/components/explore/ExploreInfiniteAnimeList'
import { ExploreListToolbar } from '@/components/explore/ExploreListToolbar'
import { ExploreSortSheet } from '@/components/explore/ExploreSheets'
import { ExploreSeasonHeader, ExploreSeasonSheet } from '@/components/explore/ExploreSeasonPicker'
import { ExploreTabBar } from '@/components/explore/ExploreUi'
import { SearchFiltersSheet } from '@/components/search/SearchFiltersSheet'

const TABS: { id: ExploreTab; label: string }[] = [
  { id: 'all', label: 'همه انیمه‌ها' },
  { id: 'seasonal', label: 'فصل جاری' },
  { id: 'genres', label: 'ژانرها' },
]

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMemo(() => parseExploreParams(searchParams), [searchParams])
  const scrollKey = buildExploreScrollKey(state)
  useTabScrollRestoration(scrollKey)

  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [seasonOpen, setSeasonOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(state.query)
  const [draftFilters, setDraftFilters] = useState<SearchUrlFilters>(() =>
    exploreStateToSearchUrlFilters(state)
  )
  const [draftSort, setDraftSort] = useState<ExploreSortKey>(state.sortBy)
  const [draftSeason, setDraftSeason] = useState<SearchSeasonKey>(state.season)
  const [draftYear, setDraftYear] = useState(state.year)

  const replaceState = (next: ExploreState) => {
    setSearchParams(buildExploreParams(next), { replace: true })
  }

  useEffect(() => {
    setSearchInput(state.query)
  }, [state.query])

  useEffect(() => {
    if (state.tab !== 'all') return
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === state.query) return
      replaceState({ ...state, query: next })
    }, 500)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync debounce against current URL state
  }, [searchInput, state.tab, state.query, searchParams])

  useEffect(() => {
    if (state.tab !== 'seasonal') return
    if (searchParams.get('season') && searchParams.get('year')) return
    replaceState({
      ...state,
      tab: 'seasonal',
      season: getCurrentSeasonKey(),
      year: getCurrentSeasonYear(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab, searchParams])

  useEffect(() => {
    if (!filterOpen) return
    setDraftFilters(exploreStateToSearchUrlFilters(state))
  }, [filterOpen, state])

  useEffect(() => {
    if (!sortOpen) return
    setDraftSort(state.sortBy)
  }, [sortOpen, state.sortBy])

  useEffect(() => {
    if (!seasonOpen) return
    setDraftSeason(state.season)
    setDraftYear(state.year)
  }, [seasonOpen, state.season, state.year])

  const setTab = (tab: ExploreTab) => {
    replaceState({ ...state, tab })
  }

  const allFilters = useMemo(
    () => ({
      query: state.query || undefined,
      format: state.format,
      hardsubLanguage: state.hardsub,
      airingStatus: state.airingStatus,
      genreSlugs: state.genreSlugs.length > 0 ? state.genreSlugs : undefined,
      season: state.listSeason,
      year: state.listYear,
      sortBy: state.sortBy,
    }),
    [
      state.query,
      state.format,
      state.hardsub,
      state.airingStatus,
      state.genreSlugs,
      state.listSeason,
      state.listYear,
      state.sortBy,
    ]
  )

  const seasonalFilters = useMemo(
    () => ({
      season: state.season,
      year: state.year,
      sortBy: 'created_at' as const,
    }),
    [state.season, state.year]
  )

  const allQuery = useInfiniteAnimeSearchQuery(allFilters, 36, state.tab === 'all')
  const seasonalQuery = useInfiniteAnimeSearchQuery(seasonalFilters, 36, state.tab === 'seasonal')
  const genresQuery = useGenresQuery()

  const allItems = useExploreAnimeItems(allQuery.data?.pages)
  const seasonalItems = useExploreAnimeItems(seasonalQuery.data?.pages)

  const filterCount = countExploreFilters(state)
  const listTitle = buildExploreAllListTitle(state, genresQuery.data ?? [])

  return (
    <div className="min-h-full pb-24">
      <AppHeader />

      <div className="px-4">
        <ExploreTabBar tabs={TABS} active={state.tab} onChange={setTab} />
      </div>

      {state.tab === 'all' ? (
        <>
          <div className="px-4 mt-3">
            <ExploreListToolbar
              listTitle={listTitle}
              filterCount={filterCount}
              onFilterClick={() => setFilterOpen(true)}
              onSortClick={() => setSortOpen(true)}
              searchValue={searchInput}
              onSearchChange={setSearchInput}
            />
          </div>
          <ExploreInfiniteAnimeList
            items={allItems}
            isLoading={allQuery.isLoading}
            isError={allQuery.isError}
            hasNextPage={allQuery.hasNextPage}
            isFetchingNextPage={allQuery.isFetchingNextPage}
            onLoadMore={() => void allQuery.fetchNextPage()}
            emptySubtitle={
              state.query || filterCount > 0
                ? 'عبارت جستجو یا فیلترها را تغییر دهید.'
                : 'فیلترها را تغییر دهید.'
            }
          />
        </>
      ) : null}

      {state.tab === 'seasonal' ? (
        <>
          <div className="px-4 mt-3">
            <ExploreSeasonHeader
              season={state.season}
              year={state.year}
              resultCount={seasonalQuery.data?.pages[0]?.total}
              isLoadingCount={seasonalQuery.isLoading}
              onOpenPicker={() => setSeasonOpen(true)}
            />
          </div>
          <ExploreInfiniteAnimeList
            items={seasonalItems}
            isLoading={seasonalQuery.isLoading}
            isError={seasonalQuery.isError}
            hasNextPage={seasonalQuery.hasNextPage}
            isFetchingNextPage={seasonalQuery.isFetchingNextPage}
            onLoadMore={() => void seasonalQuery.fetchNextPage()}
            emptyTitle="برای این فصل انیمه‌ای نیست"
          />
        </>
      ) : null}

      {state.tab === 'genres' ? (
        <div className="mt-4">
          <ExploreGenreGrid
            genres={genresQuery.data ?? []}
            isLoading={genresQuery.isLoading}
            isError={genresQuery.isError}
          />
        </div>
      ) : null}

      <SearchFiltersSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        showSort={false}
        showHardsub
        title="فیلتر"
        genres={genresQuery.data ?? []}
        genresLoading={genresQuery.isLoading}
        onApply={() => {
          replaceState(applySearchUrlFiltersToExplore(state, draftFilters))
          setFilterOpen(false)
        }}
        onReset={() => {
          const cleared: SearchUrlFilters = {
            ...DEFAULT_SEARCH_FILTERS,
            query: state.query,
            sortBy: state.sortBy,
          }
          setDraftFilters(cleared)
          replaceState(applySearchUrlFiltersToExplore(state, cleared))
          setFilterOpen(false)
        }}
      />

      <ExploreSortSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        draftSort={draftSort}
        onDraftSort={setDraftSort}
        onApply={() => {
          replaceState({ ...state, tab: 'all', sortBy: draftSort })
          setSortOpen(false)
        }}
      />

      <ExploreSeasonSheet
        open={seasonOpen}
        onOpenChange={setSeasonOpen}
        season={state.season}
        year={state.year}
        draftSeason={draftSeason}
        draftYear={draftYear}
        onDraftSeason={setDraftSeason}
        onDraftYear={setDraftYear}
        onApply={() => {
          replaceState({
            ...state,
            tab: 'seasonal',
            season: draftSeason,
            year: draftYear,
          })
          setSeasonOpen(false)
        }}
      />
    </div>
  )
}

export default Explore
