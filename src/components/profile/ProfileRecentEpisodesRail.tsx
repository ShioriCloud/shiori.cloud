import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'

type Item = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileRecentEpisodesRailProps = {
  items: Item[]
  restoreKey?: string
  maxItems?: number
}

const DEFAULT_MAX_RECENT = 6

export const ProfileRecentEpisodesRail = ({
  items,
  restoreKey = 'profile-recent-episodes',
  maxItems = DEFAULT_MAX_RECENT,
}: ProfileRecentEpisodesRailProps) => {
  const recent = items
    .filter((item) => (item.episodes_watched ?? 0) > 0)
    .slice(0, maxItems)
  if (recent.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="mb-3 px-4 text-sm font-semibold text-foreground">آخرین قسمت‌های دیده‌شده</h2>
      <HomeRailScroller restoreKey={restoreKey} className="px-4">
        {recent.map((item) => {
          const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
          const episode = item.episodes_watched ?? 0
          const when = formatRelativeTimeFa(item.updated_at)
          return (
            <HomeRailSlide key={`${item.anime_id}-${item.updated_at}`} className="w-[100px]">
              <div className="space-y-2">
                <AnimePrefetchLink
                  animeId={animePublicSegment(routeRef)}
                  to={animeDetailPath(routeRef)}
                  className="block active:scale-[0.98] transition-transform"
                  aria-label={`${item.title} قسمت ${episode}`}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <span className="text-[10px] font-medium opacity-90">قسمت</span>
                        <span className="text-3xl font-bold tabular-nums leading-none">
                          {toPersianDigits(episode)}
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimePrefetchLink>
                <div className="text-center">
                  <BidiText
                    as="p"
                    className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground"
                  >
                    {item.title}
                  </BidiText>
                  <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">{when}</p>
                </div>
              </div>
            </HomeRailSlide>
          )
        })}
      </HomeRailScroller>
    </div>
  )
}
