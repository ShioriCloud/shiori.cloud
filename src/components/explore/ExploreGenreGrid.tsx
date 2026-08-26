import { Link } from 'react-router-dom'
import type { GenreAdminItem } from '@/types/catalog'
import { exploreAllHref } from '@/lib/exploreParams'
import { resolveMediaServeUrl } from '@/lib/shioriApi'
import { genreIconForSlug } from './genreIcons'
import { ExploreEmptyState } from './ExploreUi'

export const ExploreGenreSkeletonGrid = () => (
  <div className="grid grid-cols-2 gap-3 px-4 pb-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="media-card-skeuo animate-pulse rounded-2xl">
        <div className="media-card-skeuo-face aspect-[4/3] bg-muted" />
      </div>
    ))}
  </div>
)

type ExploreGenreGridProps = {
  genres: GenreAdminItem[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

export const ExploreGenreGrid = ({ genres, isLoading, isError, onRetry }: ExploreGenreGridProps) => {
  if (isLoading) return <ExploreGenreSkeletonGrid />
  if (isError)
    return (
      <ExploreEmptyState
        title="خطا در دریافت ژانرها"
        subtitle="لطفاً دوباره تلاش کنید."
        showImage
        actionLabel={onRetry ? 'تلاش مجدد' : undefined}
        onAction={onRetry}
      />
    )
  if (genres.length === 0) return <ExploreEmptyState title="ژانری ثبت نشده" />

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-6">
      {genres.map((genre) => {
        const Icon = genreIconForSlug(genre.slug)
        const title = genre.name_fa || genre.name_en || genre.slug
        return (
          <Link
            key={String(genre.id ?? genre.slug)}
            to={exploreAllHref({ genreSlugs: [genre.slug] })}
            className="group block active:scale-[0.98] transition-transform duration-200"
            aria-label={title}
          >
            <div className="media-card-skeuo overflow-hidden rounded-2xl">
              <div className="media-card-skeuo-face relative aspect-[4/3] bg-muted">
                {genre.image_url ? (
                  <img
                    src={resolveMediaServeUrl(genre.image_url)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-muted to-background" />
                )}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/25 to-transparent"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/35 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/15 backdrop-blur-md">
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                  <span className="min-w-0 flex-1 text-start text-[0.8125rem] font-semibold leading-snug text-white drop-shadow-sm line-clamp-2">
                    {title}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
