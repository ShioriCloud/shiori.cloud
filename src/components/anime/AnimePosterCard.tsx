import type { MouseEvent } from 'react'
import { ArrowDown01Icon } from 'hugeicons-react'
import type { GenreItem } from '@/types/catalog'
import type { UiAnimeCard } from '@/utils/api'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { AnimeViewCountBadge } from '@/components/anime/AnimeViewCountBadge'
import { BidiText } from '@/components/BidiText'
import { cn } from '@/lib/utils'

const cardGenreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

export type AnimePosterCardProps = {
  anime: UiAnimeCard
  viewCount?: number
  priority?: boolean
  /** Opens progress sheet without navigating to detail. */
  onOpenProgress?: () => void
  /** Lighter paint path for dense grids (Explore). */
  dense?: boolean
}

/** Shared poster card — Home, Search, Explore */
export const AnimePosterCard = ({
  anime,
  viewCount,
  priority,
  onOpenProgress,
  dense = false,
}: AnimePosterCardProps) => {
  const genres = (anime.genres || []).slice(0, 3)
  const views = typeof viewCount === 'number' ? viewCount : anime.viewCount

  const handleProgressClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onOpenProgress?.()
  }

  return (
    <AnimePrefetchLink
      animeId={animePublicSegment(anime)}
      to={animeDetailPath(anime)}
      className="group block active:scale-[0.98] transition-transform"
      aria-label={`مشاهده ${anime.title}`}
    >
      <div className={cn('media-card-skeuo rounded-xl', dense && 'media-card-skeuo-dense')}>
        <div className="media-card-skeuo-face aspect-[2/3] bg-muted">
          <img
            src={anime.image}
            alt=""
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              !dense && 'transition-transform duration-300 group-hover:scale-105'
            )}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
          <div
            className={cn(
              'absolute inset-0',
              dense ? 'bg-gradient-to-t from-black/80 to-transparent' : 'bg-gradient-to-t from-black/90 via-black/25 to-transparent'
            )}
          />
          <AnimeViewCountBadge count={views} soft={dense} />
          {onOpenProgress ? (
            <button
              type="button"
              aria-label={`ویرایش وضعیت ${anime.title}`}
              onClick={handleProgressClick}
              className={cn(
                'absolute top-2 left-2 z-[2] flex size-7 items-center justify-center rounded-lg',
                'border border-white/20 bg-black/55 text-white shadow-sm',
                'transition-colors active:scale-95 active:bg-black/70',
                dense ? '' : 'backdrop-blur-[2px]'
              )}
            >
              <ArrowDown01Icon className="size-3.5" strokeWidth={2.25} />
            </button>
          ) : null}
          {anime.isNew ? (
            <span
              className={cn(
                'absolute z-[1] text-[10px] font-semibold bg-primary-400 text-white px-1.5 py-0.5 rounded-md',
                // Progress control owns physical top-left; keep «جدید» clear of it and the view chip.
                onOpenProgress ? 'top-11 left-2' : 'top-2 end-2'
              )}
            >
              جدید
            </span>
          ) : null}
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
                    {cardGenreLabel(g)}
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

export const AnimePosterSkeletonGrid = ({
  count = 9,
  className = 'px-4 pt-2',
}: {
  count?: number
  className?: string
}) => (
  <div className={`grid grid-cols-3 gap-3 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[2/3] rounded-xl bg-muted" />
      </div>
    ))}
  </div>
)
