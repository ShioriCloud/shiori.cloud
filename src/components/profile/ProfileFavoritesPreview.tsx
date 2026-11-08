import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { ProfileSectionMoreLink } from '@/components/profile/ProfileSectionMoreLink'
import { BidiText } from '@/components/BidiText'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { cn } from '@/lib/utils'
import { ProfileFavoritesGridSkeleton } from '@/components/profile/ProfileSectionSkeletons'

const PREVIEW_COUNT = 9

type Item = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileFavoritesPreviewProps = {
  items: Item[]
  total: number
  /** When set, items are shown in this order with rank badges (own profile). */
  orderedIds?: Array<string | number>
  profileBase: string
  className?: string
  isLoading?: boolean
  /** `profile` = فیگما v3 دو ستونه پستر عمودی */
  gridVariant?: 'default' | 'profile'
}

export const ProfileFavoritesPreview = ({
  items,
  total,
  orderedIds,
  profileBase,
  className,
  isLoading = false,
  gridVariant = 'default',
}: ProfileFavoritesPreviewProps) => {
  if (isLoading) {
    return <ProfileFavoritesGridSkeleton className={className} />
  }

  if (items.length === 0 && (!orderedIds || orderedIds.length === 0)) return null

  const byId = new Map(items.map((item) => [String(item.anime_id), item]))
  const orderedItems =
    orderedIds && orderedIds.length > 0
      ? orderedIds
          .map((id) => byId.get(String(id)))
          .filter((item): item is Item => Boolean(item))
      : items

  const preview = orderedItems.slice(0, PREVIEW_COUNT)
  const showMore = total > PREVIEW_COUNT
  const moreHref =
    profileBase === '/profile'
      ? '/profile/favorites'
      : `${profileBase}?tab=stats&sub=favorites`

  if (preview.length === 0) return null

  return (
    <section className={cn('mt-6 px-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">علاقه‌مندی‌ها</h2>
        {showMore ? (
          <ProfileSectionMoreLink
            to={moreHref}
            label={profileBase === '/profile' ? 'مرتب‌سازی' : 'همه'}
          />
        ) : null}
      </div>
      <div
        className={cn(
          SOCIAL_SURFACE_CLASS,
          'grid gap-2 p-2',
          gridVariant === 'profile' ? 'grid-cols-2' : 'grid-cols-3'
        )}
      >
        {preview.map((item) => {
          const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
          return (
            <AnimePrefetchLink
              key={item.anime_id}
              animeId={animePublicSegment(routeRef)}
              to={animeDetailPath(routeRef)}
              className="group block overflow-hidden rounded-xl active:scale-[0.98] transition-transform"
            >
              <div className="media-card-skeuo rounded-xl">
                <div
                  className={cn(
                    'media-card-skeuo-face relative bg-muted',
                    gridVariant === 'profile' ? 'aspect-[2/3]' : 'aspect-square'
                  )}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1.5 pt-5">
                    <BidiText
                      as="p"
                      className="line-clamp-2 text-[9px] font-semibold leading-tight text-white"
                    >
                      {item.title}
                    </BidiText>
                  </div>
                </div>
              </div>
            </AnimePrefetchLink>
          )
        })}
      </div>
    </section>
  )
}
