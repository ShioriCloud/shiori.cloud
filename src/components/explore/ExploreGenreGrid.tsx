import { Link } from 'react-router-dom'
import type { GenreAdminItem } from '@/types/catalog'
import { genreIconForSlug } from './genreIcons'
import { ExploreEmptyState } from './ExploreUi'

export const ExploreGenreSkeletonGrid = () => (
  <div className="grid grid-cols-2 gap-3 px-4 pb-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse aspect-[4/3] rounded-2xl bg-muted" />
    ))}
  </div>
)

type ExploreGenreGridProps = {
  genres: GenreAdminItem[]
  isLoading?: boolean
  isError?: boolean
}

export const ExploreGenreGrid = ({ genres, isLoading, isError }: ExploreGenreGridProps) => {
  if (isLoading) return <ExploreGenreSkeletonGrid />
  if (isError) return <ExploreEmptyState title="خطا در دریافت ژانرها" />
  if (genres.length === 0) return <ExploreEmptyState title="ژانری ثبت نشده" />

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-6">
      {genres.map((genre) => {
        const Icon = genreIconForSlug(genre.slug)
        const title = genre.name_fa || genre.name_en || genre.slug
        return (
          <Link
            key={String(genre.id ?? genre.slug)}
            to={`/search?genre=${encodeURIComponent(genre.slug)}`}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted active:scale-[0.98] transition-transform duration-200"
            aria-label={title}
          >
            {genre.image_url ? (
              <img
                src={genre.image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-muted to-background" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/15" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Icon className="w-5 h-5 text-white" />
              </span>
              <span className="text-sm font-semibold text-white drop-shadow line-clamp-2 leading-snug">
                {title}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
