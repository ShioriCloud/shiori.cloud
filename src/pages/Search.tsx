import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search01Icon } from 'hugeicons-react'
import type { UiAnimeCard } from '../utils/api'
import * as catalog from '../services/catalogSource'
import type { GenreItem } from '../services/catalogSource'
import { animeDetailPath, animePublicSegment } from '../lib/animePaths'
import {
  buildSearchParams,
  countActiveSearchFilters,
  DEFAULT_SEARCH_FILTERS,
  getCurrentSeasonKey,
  getCurrentSeasonYear,
  parseSearchParams,
  toApiSearchFilters,
  translateSeason,
  type SearchUrlFilters,
} from '../lib/searchFilters'
import { Button } from '@/components/ui/button'
import AnimePrefetchLink from '../components/AnimePrefetchLink'
import { BidiText } from '../components/BidiText'
import { ActiveFilterChips } from '../components/search/ActiveFilterChips'
import { SearchControlBar } from '../components/search/SearchControlBar'
import { SearchFiltersSheet } from '../components/search/SearchFiltersSheet'
import { useGenresQuery, useInfiniteAnimeSearchQuery } from '../hooks/queries/useAnimeQueries'
import frieren from '../assets/images/frieren-03.webp'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

const genreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

type EmptyStateProps = {
  image?: string
  title: string
  subtitle?: string
}

const EmptyState = ({ image, title, subtitle }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center text-center gap-3 py-12 px-6 h-[55vh]">
    {image && <img src={image} alt="empty-list" className="w-48" />}
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground max-w-xs">{subtitle}</p>}
  </div>
)

const SkeletonGrid = () => (
  <div className="grid grid-cols-3 gap-3 px-4 pt-2">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[2/3] rounded-xl bg-muted" />
      </div>
    ))}
  </div>
)

const AnimeGridCard = ({ anime }: { anime: UiAnimeCard }) => {
  const genres = (anime.genres || []).slice(0, 3)

  return (
    <AnimePrefetchLink
      animeId={animePublicSegment(anime)}
      to={animeDetailPath(anime)}
      className="group block active:scale-[0.98] transition-transform"
      aria-label={`مشاهده ${anime.title}`}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
        <img
          src={anime.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        {anime.isNew && (
          <span className="absolute top-2 right-2 text-[10px] font-semibold bg-primary-400 text-white px-1.5 py-0.5 rounded-md">
            جدید
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-2.5 pt-10">
          <BidiText as="h3" className="text-xs text-left font-semibold text-white line-clamp-2 leading-2">
            {anime.title}
          </BidiText>
          {genres.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1 justify-end">
              {genres.map((g) => (
                <span
                  key={g.slug}
                  className="text-[9px] leading-none px-1 py-0.5 rounded-md bg-white/15 text-white/90 border border-white/10 max-w-full truncate"
                >
                  {genreLabel(g)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-white/60 mt-1">{anime.episode || 'شیوری'}</p>
          )}
        </div>
      </div>
    </AnimePrefetchLink>
  )
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilters = useMemo(() => parseSearchParams(searchParams), [searchParams])

  const [searchInput, setSearchInput] = useState(urlFilters.query)
  const [debouncedQuery, setDebouncedQuery] = useState(urlFilters.query)
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<SearchUrlFilters>(urlFilters)
  const [genreDisplayName, setGenreDisplayName] = useState<string | null>(urlFilters.genreLabel)
  const [genreNameLoading, setGenreNameLoading] = useState(false)

  useEffect(() => {
    setSearchInput(urlFilters.query)
    setDebouncedQuery(urlFilters.query)
  }, [urlFilters.query])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      setDebouncedQuery(next)
      if (next === urlFilters.query) return
      const params = buildSearchParams({ ...urlFilters, query: next })
      setSearchParams(params, { replace: true })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [searchInput, urlFilters, setSearchParams])

  useEffect(() => {
    if (!urlFilters.genreSlug) {
      setGenreDisplayName(null)
      setGenreNameLoading(false)
      return
    }

    if (urlFilters.genreLabel) {
      setGenreDisplayName(urlFilters.genreLabel)
      setGenreNameLoading(false)
      return
    }

    setGenreNameLoading(true)
    let cancelled = false
    void catalog.getGenreBySlug(urlFilters.genreSlug).then((genre) => {
      if (cancelled) return
      setGenreDisplayName(
        genre ? genre.name_fa || genre.name_en || genre.slug : urlFilters.genreSlug
      )
      setGenreNameLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [urlFilters.genreSlug, urlFilters.genreLabel])

  const activeFilters = useMemo(
    () => ({ ...urlFilters, query: debouncedQuery.trim() }),
    [urlFilters, debouncedQuery]
  )

  const pageTitle = (() => {
    if (activeFilters.season && activeFilters.year != null) {
      return `انیمه‌های فصل ${translateSeason(activeFilters.season)} ${toPersianNumber(activeFilters.year)}`
    }
    if (activeFilters.genreSlug && genreDisplayName) {
      return `انیمه‌های ژانر ${genreDisplayName}`
    }
    return null
  })()

  const showGenreTitleSkeleton = Boolean(activeFilters.genreSlug && !genreDisplayName && genreNameLoading)

  const searchFilters = useMemo(() => toApiSearchFilters(activeFilters), [activeFilters])

  const { data: genres = [], isLoading: genresLoading } = useGenresQuery()

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteAnimeSearchQuery(searchFilters)

  const results = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])
  const total = data?.pages[0]?.total ?? 0
  const hasMore = Boolean(hasNextPage)

  const applyFilters = (next: SearchUrlFilters) => {
    const params = buildSearchParams({ ...next, query: debouncedQuery.trim() })
    setSearchParams(params, { replace: true })
  }

  const openFiltersSheet = () => {
    setDraftFilters({ ...urlFilters, query: debouncedQuery.trim() })
    setFiltersSheetOpen(true)
  }

  const isCurrentSeasonActive =
    activeFilters.year === getCurrentSeasonYear() &&
    activeFilters.season === getCurrentSeasonKey()

  const isPopularSort = activeFilters.sortBy === 'popular'

  const hasAnyFilter =
    countActiveSearchFilters(activeFilters) > 0 ||
    activeFilters.sortBy !== 'created_at' ||
    debouncedQuery.trim().length > 0

  return (
    <div className="pb-24">
      <div className="sticky top-[4.5rem] z-20 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="space-y-3 p-4">
          <div className="relative flex items-center gap-2 rounded-xl border border-border bg-card p-3 ps-10">
            <Search01Icon className="text-muted-foreground absolute start-3 h-5 w-5" />
            <input
              type="search"
              enterKeyHint="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="نام انیمه را جستجو کن..."
              className="bg-transparent w-full text-sm focus:outline-none"
            />
          </div>

          <SearchControlBar
            filters={activeFilters}
            onOpenFilters={openFiltersSheet}
            isCurrentSeasonActive={isCurrentSeasonActive}
            isPopularSort={isPopularSort}
            onQuickCurrentSeason={() =>
              applyFilters({
                ...urlFilters,
                query: debouncedQuery.trim(),
                year: getCurrentSeasonYear(),
                season: getCurrentSeasonKey(),
              })
            }
            onQuickPopular={() =>
              applyFilters({
                ...urlFilters,
                query: debouncedQuery.trim(),
                sortBy: isPopularSort ? 'created_at' : 'popular',
              })
            }
          />
        </div>

        <ActiveFilterChips
          filters={activeFilters}
          onChange={(next) => applyFilters({ ...next, query: debouncedQuery.trim() })}
        />

        {!isLoading && !isError && total > 0 ? (
          <p className="text-muted-foreground px-4 pb-3 text-xs">
            {toPersianNumber(total)} نتیجه
            {results.length < total ? ` · ${toPersianNumber(results.length)} نمایش داده شده` : ''}
          </p>
        ) : null}
      </div>

      {(pageTitle || showGenreTitleSkeleton) && (
        <div className="px-4 pt-3 pb-1">
          {showGenreTitleSkeleton ? (
            <div className="h-6 w-56 max-w-full bg-muted animate-pulse rounded" aria-hidden />
          ) : (
            <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
          )}
        </div>
      )}

      <SearchFiltersSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        genres={genres}
        genresLoading={genresLoading}
        onApply={() => {
          applyFilters({ ...draftFilters, query: debouncedQuery.trim() })
          setFiltersSheetOpen(false)
        }}
        onReset={() => {
          setDraftFilters({
            ...DEFAULT_SEARCH_FILTERS,
            query: debouncedQuery.trim(),
            sortBy: draftFilters.sortBy,
          })
        }}
      />

      {isLoading && <SkeletonGrid />}

      {isError && (
        <div className="px-4 py-8 text-center space-y-3">
          <p className="text-red-500">خطا در بارگذاری لیست انیمه‌ها</p>
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </div>
      )}

      {!isLoading && !isError && results.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3 px-4 pt-2">
            {results.map((anime) => (
              <AnimeGridCard key={anime.id} anime={anime} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 px-4 pb-6 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? 'در حال بارگذاری…' : 'بارگذاری بیشتر'}
              </Button>
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && results.length === 0 && (
        <EmptyState
          image={frieren}
          title="چیزی پیدا نشد"
          subtitle={
            hasAnyFilter
              ? 'فیلترها را کم کن یا عبارت جستجو را عوض کن.'
              : 'نام انیمه را بنویس یا از «فیلتر و مرتب‌سازی» شروع کن.'
          }
        />
      )}
    </div>
  )
}

export default Search
