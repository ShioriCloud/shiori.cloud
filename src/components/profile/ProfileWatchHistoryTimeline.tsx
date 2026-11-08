import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileAnimeRailSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

type Item = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileWatchHistoryTimelineProps = {
  items: Item[]
  isLoading?: boolean
  variant: 'own' | 'public'
}

export const ProfileWatchHistoryTimeline = ({
  items,
  isLoading = false,
  variant,
}: ProfileWatchHistoryTimelineProps) => {
  if (isLoading) {
    return <ProfileAnimeRailSkeleton className="mt-2" titleClassName="w-36" />
  }

  const history = [...items]
    .filter((item) => (item.episodes_watched ?? 0) > 0)
    .sort((a, b) => Date.parse(b.updated_at || '') - Date.parse(a.updated_at || ''))

  if (history.length === 0) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title={variant === 'own' ? 'هنوز قسمتی ثبت نشده' : 'هنوز فعالیت تماشایی نیست'}
        subtitle={
          variant === 'own'
            ? 'وقتی قسمتی را دیده یا علامت بزنی اینجا نمایش داده می‌شود.'
            : 'وقتی این کاربر قسمتی ببیند اینجا می‌آید.'
        }
      />
    )
  }

  return (
    <div className="mx-4 mt-2">
      <h2 className="mb-2.5 text-sm font-semibold text-foreground">تاریخچه تماشا</h2>
      <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>
        <ul>
          {history.map((item, index) => {
            const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
            const episode = item.episodes_watched ?? 0
            const when = formatRelativeTimeFa(item.updated_at)
            const isLast = index === history.length - 1
            return (
              <li
                key={`${item.anime_id}-${item.updated_at}`}
                className={cn('relative flex gap-3 px-3 py-3', !isLast && 'border-b border-border/35')}
              >
                <div className="flex w-12 shrink-0 flex-col items-center pt-0.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-400/80" />
                  {!isLast ? (
                    <span className="mt-1 w-px flex-1 min-h-[2.5rem] bg-border/50" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <time className="text-[11px] tabular-nums text-muted-foreground">{when}</time>
                  <AnimePrefetchLink
                    animeId={animePublicSegment(routeRef)}
                    to={animeDetailPath(routeRef)}
                    className="mt-1 flex items-start gap-3 active:opacity-85"
                  >
                    <div className="media-card-skeuo w-10 shrink-0 rounded-lg">
                      <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <BidiText as="p" className="line-clamp-2 text-sm font-semibold text-foreground">
                        {item.title}
                      </BidiText>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        قسمت {toPersianDigits(episode)}
                      </p>
                    </div>
                  </AnimePrefetchLink>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
