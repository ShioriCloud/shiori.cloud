import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'

const MAX_ITEMS = 8

type Item = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileSocialWatchedRailProps = {
  items: Item[]
}

export const ProfileSocialWatchedRail = ({ items }: ProfileSocialWatchedRailProps) => {
  const slice = items.slice(0, MAX_ITEMS)
  if (slice.length === 0) return null

  return (
    <div>
      <h2 className="mb-3 px-4 text-sm font-semibold text-foreground">انیمه‌های تماشاشده</h2>
      <HomeRailScroller restoreKey="profile-social-watched" className="px-4">
        {slice.map((item) => {
          const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
          const progressLabel =
            item.episodes_total != null && item.episodes_total > 0
              ? `${toPersianDigits(item.episodes_watched)}/${toPersianDigits(item.episodes_total)}`
              : toPersianDigits(item.episodes_watched)
          return (
            <HomeRailSlide key={item.anime_id} className="w-[100px]">
              <AnimePrefetchLink
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="group block active:scale-[0.98] transition-transform"
                aria-label={`مشاهده ${item.title}`}
              >
                <div className="media-card-skeuo rounded-xl">
                  <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white tabular-nums">
                      {progressLabel}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-2 pt-6">
                      <BidiText
                        as="p"
                        className="text-[10px] font-semibold text-white line-clamp-2 text-left"
                      >
                        {item.title}
                      </BidiText>
                    </div>
                  </div>
                </div>
              </AnimePrefetchLink>
            </HomeRailSlide>
          )
        })}
      </HomeRailScroller>
    </div>
  )
}
