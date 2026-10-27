import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { FavoriteRankBadge } from '@/components/profile/FavoriteRankBadge'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type Item = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileAnimeLibraryGridProps = {
  items: Item[]
  orderedIds?: Array<string | number>
  mode: 'watching' | 'favorites'
  emptyTitle: string
  emptySubtitle?: string
  className?: string
}

export const ProfileAnimeLibraryGrid = ({
  items,
  orderedIds,
  mode,
  emptyTitle,
  emptySubtitle,
  className,
}: ProfileAnimeLibraryGridProps) => {
  const byId = new Map(items.map((item) => [String(item.anime_id), item]))
  const orderedItems =
    orderedIds && orderedIds.length > 0
      ? orderedIds
          .map((id) => byId.get(String(id)))
          .filter((item): item is Item => Boolean(item))
      : items

  if (orderedItems.length === 0) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title={emptyTitle}
        subtitle={emptySubtitle}
      />
    )
  }

  return (
    <div className={cn(SOCIAL_SURFACE_CLASS, 'grid grid-cols-3 gap-2 p-2', className)}>
      {orderedItems.map((item, index) => {
        const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
        const rank = index + 1
        const progressLabel =
          mode === 'watching' && item.episodes_total != null && item.episodes_total > 0
            ? `${toPersianDigits(item.episodes_watched)}/${toPersianDigits(item.episodes_total)}`
            : mode === 'watching'
              ? toPersianDigits(item.episodes_watched ?? 0)
              : null

        return (
          <AnimePrefetchLink
            key={item.anime_id}
            animeId={animePublicSegment(routeRef)}
            to={animeDetailPath(routeRef)}
            className="group relative block overflow-hidden rounded-xl active:scale-[0.98] transition-transform"
          >
            <div className="relative aspect-[2/3] bg-muted">
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              {mode === 'favorites' ? (
                <div className="absolute left-1.5 top-1.5 z-10">
                  <FavoriteRankBadge rank={rank} />
                </div>
              ) : null}
              {progressLabel ? (
                <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white tabular-nums">
                  {progressLabel}
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1.5 pt-6">
                <BidiText
                  as="p"
                  className="line-clamp-2 text-[9px] font-semibold leading-tight text-white"
                >
                  {item.title}
                </BidiText>
              </div>
            </div>
          </AnimePrefetchLink>
        )
      })}
    </div>
  )
}
