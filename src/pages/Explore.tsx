import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  buildExploreParams,
  buildExploreScrollKey,
  countExploreFilters,
  parseExploreParams,
  type ExploreTab,
} from '@/lib/exploreParams'
import {
  getCurrentSeasonKey,
  getCurrentSeasonYear,
  translateExploreSort,
  type ExploreFormatKey,
  type ExploreSortKey,
  type SearchHardsubLanguageKey,
  type SearchSeasonKey,
} from '@/lib/searchFilters'
import { useGenresQuery, useInfiniteAnimeSearchQuery } from '@/hooks/queries/useAnimeQueries'
import { useTabScrollRestoration } from '@/hooks/useTabScrollRestoration'
import { ExploreGenreGrid } from '@/components/explore/ExploreGenreGrid'
import {
  ExploreInfiniteAnimeList,
  useExploreAnimeItems,
} from '@/components/explore/ExploreInfiniteAnimeList'
import { ExploreListToolbar } from '@/components/explore/ExploreListToolbar'
import { ExploreFilterSheet, ExploreSortSheet } from '@/components/explore/ExploreSheets'
import { ExploreSeasonHeader, ExploreSeasonSheet } from '@/components/explore/ExploreSeasonPicker'
import { ExploreTabBar } from '@/components/explore/ExploreUi'

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

  const [draftFormat, setDraftFormat] = useState<ExploreFormatKey | null>(state.format)
  const [draftHardsub, setDraftHardsub] = useState<SearchHardsubLanguageKey | null>(state.hardsub)
  const [draftSort, setDraftSort] = useState<ExploreSortKey>(state.sortBy)
  const [draftSeason, setDraftSeason] = useState<SearchSeasonKey>(state.season)
  const [draftYear, setDraftYear] = useState(state.year)

  useEffect(() => {
    if (state.tab !== 'seasonal') return
    if (searchParams.get('season') && searchParams.get('year')) return
    setSearchParams(
      buildExploreParams({
        tab: 'seasonal',
        season: getCurrentSeasonKey(),
        year: getCurrentSeasonYear(),
      }),
      { replace: true }
    )
  }, [state.tab, searchParams, setSearchParams])

  useEffect(() => {
    if (!filterOpen) return
    setDraftFormat(state.format)
    setDraftHardsub(state.hardsub)
  }, [filterOpen, state.format, state.hardsub])

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
    setSearchParams(
      buildExploreParams({
        tab,
        format: state.format,
        hardsub: state.hardsub,
        sortBy: state.sortBy,
        season: state.season,
        year: state.year,
      }),
      { replace: true }
    )
  }

  const allFilters = useMemo(
    () => ({
      format: state.format,
      hardsubLanguage: state.hardsub,
      sortBy: state.sortBy,
    }),
    [state.format, state.hardsub, state.sortBy]
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

  return (
    <div className="min-h-full pb-24">
      <div className="px-4 pt-4">
        <ExploreTabBar tabs={TABS} active={state.tab} onChange={setTab} />
      </div>

      {state.tab === 'all' ? (
        <>
          <div className="px-4 mt-3">
            <ExploreListToolbar
              sortLabel={translateExploreSort(state.sortBy)}
              filterCount={filterCount}
              onFilterClick={() => setFilterOpen(true)}
              onSortClick={() => setSortOpen(true)}
            />
          </div>
          <ExploreInfiniteAnimeList
            items={allItems}
            isLoading={allQuery.isLoading}
            isError={allQuery.isError}
            hasNextPage={allQuery.hasNextPage}
            isFetchingNextPage={allQuery.isFetchingNextPage}
            onLoadMore={() => void allQuery.fetchNextPage()}
            emptySubtitle="فیلترها را تغییر دهید."
          />
        </>
      ) : null}

      {state.tab === 'seasonal' ? (
        <>
          <ExploreSeasonHeader
            season={state.season}
            year={state.year}
            resultCount={seasonalQuery.data?.pages[0]?.total}
            isLoadingCount={seasonalQuery.isLoading}
            onOpenPicker={() => setSeasonOpen(true)}
          />
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

      <ExploreFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        draftFormat={draftFormat}
        draftHardsub={draftHardsub}
        onDraftFormat={setDraftFormat}
        onDraftHardsub={setDraftHardsub}
        onReset={() => {
          setDraftFormat(null)
          setDraftHardsub(null)
        }}
        onApply={() => {
          setSearchParams(
            buildExploreParams({
              tab: 'all',
              format: draftFormat,
              hardsub: draftHardsub,
              sortBy: state.sortBy,
            }),
            { replace: true }
          )
          setFilterOpen(false)
        }}
      />

      <ExploreSortSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        draftSort={draftSort}
        onDraftSort={setDraftSort}
        onApply={() => {
          setSearchParams(
            buildExploreParams({
              tab: 'all',
              format: state.format,
              hardsub: state.hardsub,
              sortBy: draftSort,
            }),
            { replace: true }
          )
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
          setSearchParams(
            buildExploreParams({
              tab: 'seasonal',
              season: draftSeason,
              year: draftYear,
            }),
            { replace: true }
          )
          setSeasonOpen(false)
        }}
      />
    </div>
  )
}

export default Explore
