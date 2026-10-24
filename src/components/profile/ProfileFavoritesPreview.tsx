import { Link } from 'react-router-dom'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const PREVIEW_COUNT = 9

type Item = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileFavoritesPreviewProps = {
  items: Item[]
  total: number
  /** e.g. /profile or /u/123 */
  profileBase: string
  className?: string
}

export const ProfileFavoritesPreview = ({
  items,
  total,
  profileBase,
  className,
}: ProfileFavoritesPreviewProps) => {
  if (items.length === 0) return null

  const preview = items.slice(0, PREVIEW_COUNT)
  const showMore = total > PREVIEW_COUNT
  const moreHref = `${profileBase}?tab=stats`

  return (
    <section className={cn('mt-6 px-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">علاقه‌مندی‌ها</h2>
        {showMore ? (
          <Link to={moreHref} className="text-xs font-medium text-primary-400">
            مشاهده همه ({toPersianDigits(total)})
          </Link>
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
              <div className="relative aspect-[2/3] bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
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
      {showMore ? (
        <Link
          to={moreHref}
          className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-border/50 bg-muted/25 text-sm font-medium text-foreground active:bg-muted/40"
        >
          مشاهده همه علاقه‌مندی‌ها
        </Link>
      ) : null}
    </section>
  )
}
