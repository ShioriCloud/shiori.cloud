import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AnimePrefetchLink from '../components/AnimePrefetchLink'
import {
  ArrowLeft01Icon,
  SparklesIcon,
} from 'hugeicons-react'
import type { GenreItem } from '../types/catalog'
import { BidiText } from '@/components/BidiText'
import { AnimeViewCountBadge } from '@/components/anime/AnimeViewCountBadge'
import { AppHeader } from '@/components/AppHeader'
import { HomeCustomBlocksSection } from '@/components/home/HomeCustomBlocksSection'
import { HomeFeaturedCarousel } from '@/components/home/HomeFeaturedCarousel'
import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { animeDetailPath, animePublicSegment } from '../lib/animePaths'
import { exploreAllHref } from '@/lib/exploreParams'
import { hapticSelection } from '@/lib/telegramHaptics'
import {
  useHomeDonghuaQuery,
  useHomeFeaturedQuery,
  useHomeLatestQuery,
  useHomeMoviesQuery,
  useHomePopularQuery,
  useHomeRecentQuery,
  type UiAnimeCard,
} from '../hooks/queries/useAnimeQueries'

type ContentType = 'anime' | 'movie' | 'donghua'

type Anime = UiAnimeCard

type SectionId = 'recent' | 'latest' | 'popular' | 'donghua' | 'movies'

const TYPE_TABS: { id: ContentType; label: string }[] = [
  { id: 'anime', label: 'انیمه' },
  { id: 'movie', label: 'سینمایی' },
  { id: 'donghua', label: 'دونگهوا' },
]

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

const translateSeason = (season: string): string => {
  switch (season) {
    case 'WINTER':
      return 'زمستان'
    case 'SPRING':
      return 'بهار'
    case 'SUMMER':
      return 'تابستان'
    case 'FALL':
      return 'پاییز'
    default:
      return season
  }
}

/** Season + year in Asia/Tehran (matches Schedule / API). */
const getTehranSeasonYear = (): {
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'
  year: number
} => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date())
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const y = Number.isFinite(year) ? year : new Date().getFullYear()
  const m = Number.isFinite(month) ? month : new Date().getMonth() + 1
  if (m >= 1 && m <= 3) return { season: 'WINTER', year: y }
  if (m >= 4 && m <= 6) return { season: 'SPRING', year: y }
  if (m >= 7 && m <= 9) return { season: 'SUMMER', year: y }
  return { season: 'FALL', year: y }
}

const genreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

const PosterCardContent = ({ anime }: { anime: Anime }) => {
  const genres = (anime.genres || []).slice(0, 3)

  return (
    <AnimePrefetchLink
      animeId={animePublicSegment(anime)}
      to={animeDetailPath(anime)}
      className="group block active:scale-[0.98] transition-transform"
      aria-label={`مشاهده ${anime.title}`}
    >
      <div className="media-card-skeuo rounded-xl">
        <div className="media-card-skeuo-face aspect-[2/3] bg-muted">
          <img
            src={anime.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          <AnimeViewCountBadge count={anime.viewCount} />
          {anime.isNew && (
            <span className="absolute top-2 end-2 text-[10px] font-semibold bg-primary-400 text-white px-1.5 py-0.5 rounded-md">
              جدید
            </span>
          )}
          <div className="absolute left-0 bottom-0 p-2.5 pt-10">
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
      </div>
    </AnimePrefetchLink>
  )
}

const SectionSkeleton = () => (
  <div className="flex gap-3 overflow-hidden px-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="w-[9.25rem] shrink-0 animate-pulse">
        <div className="aspect-[2/3] rounded-xl bg-muted" />
      </div>
    ))}
  </div>
)

const Home = () => {
  const [selectedType, setSelectedType] = useState<ContentType>('anime')

  const { season: currentSeasonKey, year: currentYearNumber } = useMemo(
    () => getTehranSeasonYear(),
    []
  )
  const currentSeasonFa = translateSeason(currentSeasonKey)
  const seasonLabel = `فصل ${currentSeasonFa} ${toPersianNumber(currentYearNumber)}`

  // P0: above-the-fold — always enabled
  const featuredQuery = useHomeFeaturedQuery(selectedType, true)
  const recentQuery = useHomeRecentQuery(true)
  const latestQuery = useHomeLatestQuery(currentYearNumber, currentSeasonKey, true)

  const p0Ready =
    !featuredQuery.isLoading && !recentQuery.isLoading && !latestQuery.isLoading

  // P1/P2: wait until P0 painted (cache hit → immediate; cold → after fetch)
  const popularQuery = useHomePopularQuery(p0Ready)
  const donghuaQuery = useHomeDonghuaQuery(p0Ready)
  const moviesQuery = useHomeMoviesQuery(p0Ready)

  const sectionQueries: Record<SectionId, typeof latestQuery> = {
    recent: recentQuery,
    latest: latestQuery,
    popular: popularQuery,
    donghua: donghuaQuery,
    movies: moviesQuery,
  }

  const featuredAnime = featuredQuery.data ?? []

  const sectionMeta = useMemo(
    (): Record<SectionId, { title: string; seeAll: string }> => ({
      recent: {
        title: 'تازه‌اضافه‌شده',
        seeAll: exploreAllHref({ sortBy: 'created_at' }),
      },
      latest: {
        title: `فصل ${currentSeasonFa} ${toPersianNumber(currentYearNumber)}`,
        seeAll: exploreAllHref({
          listYear: currentYearNumber,
          listSeason: currentSeasonKey,
        }),
      },
      popular: { title: 'محبوب‌ترین‌ها', seeAll: exploreAllHref({ sortBy: 'popular' }) },
      donghua: { title: 'دونگهوا', seeAll: exploreAllHref({ format: 'DONGHUA' }) },
      movies: { title: 'انیمه سینمایی', seeAll: exploreAllHref({ format: 'MOVIE' }) },
    }),
    [currentSeasonFa, currentSeasonKey, currentYearNumber]
  )

  const renderSection = (id: SectionId) => {
    const query = sectionQueries[id]
    const list = query.data ?? []
    const meta = sectionMeta[id]
    const deferred = !query.isFetched && query.fetchStatus === 'idle' && list.length === 0
    const loading = (query.isLoading || deferred) && list.length === 0
    const loadError = query.isError
      ? query.error instanceof Error
        ? query.error.message
        : 'خطا در بارگذاری'
      : null

    return (
      <section key={id} className="space-y-3">
        <div className="px-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">{meta.title}</h2>
          <Link
            to={meta.seeAll}
            className="flex items-center gap-1 text-xs text-primary-400 font-medium shrink-0"
          >
            مشاهده همه
            <ArrowLeft01Icon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : loadError && list.length === 0 ? (
          <ExploreEmptyState
            title="خطا در بارگذاری"
            subtitle={loadError}
            showImage={false}
            compact
            actionLabel="تلاش مجدد"
            onAction={() => void query.refetch()}
          />
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 px-4">فعلاً موردی نیست.</p>
        ) : (
          <HomeRailScroller>
            {list.map((anime) => (
              <HomeRailSlide key={anime.id}>
                <PosterCardContent anime={anime} />
              </HomeRailSlide>
            ))}
          </HomeRailScroller>
        )}
      </section>
    )
  }

  const featuredLoading = featuredQuery.isLoading && featuredAnime.length === 0
  const featuredError = featuredQuery.isError
    ? featuredQuery.error instanceof Error
      ? featuredQuery.error.message
      : 'خطا در بارگذاری'
    : null

  return (
    <div className="pb-24 overflow-x-hidden">
      <AppHeader />

      <div className="px-4">
        <div className="home-type-tabs relative flex rounded-xl p-1">
          {TYPE_TABS.map((tab) => {
            const active = selectedType === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  hapticSelection()
                  setSelectedType(tab.id)
                }}
                className={`relative flex-1 py-2.5 rounded-[10px] text-sm transition-all duration-200 ${
                  active
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-pressed={active}
              >
                {active && (
                  <span aria-hidden className="home-type-tabs-thumb absolute inset-0 rounded-[10px]" />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4 text-primary-400" />
            پیشنهاد ویژه
          </h2>
          <span className="text-xs text-primary-400 font-medium">{seasonLabel}</span>
        </div>

        {featuredLoading ? (
          <div className="h-52 rounded-2xl bg-muted animate-pulse" />
        ) : featuredError ? (
          <ExploreEmptyState
            title="خطا در پیشنهاد ویژه"
            subtitle={featuredError}
            compact
            actionLabel="تلاش مجدد"
            onAction={() => void featuredQuery.refetch()}
          />
        ) : featuredAnime.length > 0 ? (
          <HomeFeaturedCarousel>
            {featuredAnime.map((anime) => (
              <AnimePrefetchLink
                key={anime.id}
                animeId={animePublicSegment(anime)}
                to={animeDetailPath(anime)}
                className="block group h-52"
              >
                <div className="media-card-skeuo relative h-full w-full rounded-2xl">
                  <div className="media-card-skeuo-face">
                    <img
                      src={anime.featuredImage || anime.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <AnimeViewCountBadge count={anime.viewCount} />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <BidiText
                        as="h3"
                        className="text-base font-bold text-white text-left line-clamp-2 leading-6"
                      >
                        {anime.title}
                      </BidiText>
                      {(anime.genres || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 justify-end">
                          {(anime.genres || []).slice(0, 3).map((g) => (
                            <span
                              key={g.slug}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white/90 backdrop-blur-sm border border-white/10"
                            >
                              {genreLabel(g)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AnimePrefetchLink>
            ))}
          </HomeFeaturedCarousel>
        ) : (
          <div className="h-40 rounded-2xl border border-dashed border-border bg-muted/20 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">پیشنهاد ویژه‌ای ثبت نشده.</p>
          </div>
        )}
      </div>

      <div className="space-y-8 pt-6">
        <HomeCustomBlocksSection enabled={p0Ready} />
        {renderSection('recent')}
        {renderSection('latest')}
        {renderSection('popular')}
        {renderSection('donghua')}
        {renderSection('movies')}
      </div>
    </div>
  )
}

export default Home
