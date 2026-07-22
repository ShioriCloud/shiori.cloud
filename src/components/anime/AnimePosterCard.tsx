import type { GenreItem } from '@/types/catalog'
import type { UiAnimeCard } from '@/utils/api'
import { FavouriteIcon } from 'hugeicons-react'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

const cardGenreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

export type AnimePosterCardProps = {
  anime: UiAnimeCard
  favoriteCount?: number
  priority?: boolean
}

/** Shared poster card — Home, Search, Explore */
export const AnimePosterCard = ({ anime, favoriteCount, priority }: AnimePosterCardProps) => {
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
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        {typeof favoriteCount === 'number' && favoriteCount > 0 ? (
          <span
            className="absolute top-2 start-2 inline-flex items-center gap-0.5 rounded-md border border-white/20 bg-black/50 backdrop-blur-sm px-1 py-0.5 text-[9px] font-medium tabular-nums leading-none text-white/95"
            aria-label={`${toPersianNumber(favoriteCount)} علاقه‌مند`}
          >
            <FavouriteIcon className="h-2.5 w-2.5 shrink-0 text-red-400 fill-red-400" aria-hidden />
            {toPersianNumber(favoriteCount)}
          </span>
        ) : null}
        {anime.isNew ? (
          <span className="absolute top-2 end-2 text-[10px] font-semibold bg-primary-400 text-white px-1.5 py-0.5 rounded-md">
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
