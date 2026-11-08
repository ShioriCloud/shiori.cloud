import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ProfileSectionMoreLink } from '@/components/profile/ProfileSectionMoreLink'
import { ProfileTranslatorPosterCard } from '@/components/profile/ProfileTranslatorPosterCard'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { ProfileFavoritesGridSkeleton } from '@/components/profile/ProfileSectionSkeletons'

const PREVIEW_COUNT_DEFAULT = 9
const PREVIEW_COUNT_PROFILE = 6

type Item = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileFavoritesPreviewProps = {
  items: Item[]
  total: number
  orderedIds?: Array<string | number>
  profileBase: string
  className?: string
  isLoading?: boolean
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

  const previewLimit = gridVariant === 'profile' ? PREVIEW_COUNT_PROFILE : PREVIEW_COUNT_DEFAULT
  const preview = orderedItems.slice(0, previewLimit)
  const displayTotal = total > 0 ? total : orderedItems.length
  const showMore = displayTotal > previewLimit
  const moreHref =
    profileBase === '/profile'
      ? '/profile/favorites'
      : `${profileBase}?tab=stats&sub=favorites`

  if (preview.length === 0) return null

  if (gridVariant === 'profile') {
    return (
      <section className={cn('flex flex-col gap-3', className)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <h2 className="text-[15.5px] font-bold text-foreground">علاقه‌مندی‌ها</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {toPersianDigits(displayTotal)}
            </span>
          </div>
          {showMore ? <ProfileSectionMoreLink to={moreHref} label="همه" /> : null}
        </div>
        <div className="grid grid-cols-3 justify-items-start gap-2.5">
          {preview.map((item) => (
            <ProfileTranslatorPosterCard
              key={item.anime_id}
              item={{
                anime_id: item.anime_id,
                slug: item.slug,
                title: item.title,
                image: item.image,
              }}
            />
          ))}
        </div>
      </section>
    )
  }

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
      <div className={cn(SOCIAL_SURFACE_CLASS, 'grid grid-cols-3 gap-2 p-2')}>
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
                <div className="media-card-skeuo-face relative aspect-square bg-muted">
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
