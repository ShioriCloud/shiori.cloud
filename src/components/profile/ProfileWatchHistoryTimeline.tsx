import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileAnimeRailSkeleton } from '@/components/profile/ProfileSectionSkeletons'
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
    <section className="mx-4 mt-5 flex flex-col gap-3.5">
      <h2 className="text-[15.5px] font-bold leading-snug text-foreground">تاریخچه تماشا</h2>
      <ul className="flex flex-col gap-1">
        {history.map((item, index) => {
          const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
          const episode = item.episodes_watched ?? 0
          const when = formatRelativeTimeFa(item.updated_at)
          const isLast = index === history.length - 1
          const isLatest = index === 0
          return (
            <li key={`${item.anime_id}-${item.updated_at}`} className="flex h-[72px] items-start gap-3">
              <div className="flex h-full w-3 shrink-0 flex-col items-center pt-1.5" aria-hidden>
                <span
                  className={cn(
                    'size-2.5 rounded-full',
                    isLatest ? 'bg-primary-400' : 'border border-muted-foreground/50'
                  )}
                />
                {!isLast ? <span className="mt-1 w-px flex-1 bg-border/80" /> : null}
              </div>
              <AnimePrefetchLink
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="flex min-w-0 flex-1 items-start gap-3 active:opacity-85"
              >
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md border border-white/10 bg-muted">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pt-1.5 text-right">
                  <BidiText as="p" className="truncate text-[13.5px] font-semibold leading-5 text-foreground">
                    {item.title}
                  </BidiText>
                  <p className="text-xs leading-[18px] text-muted-foreground">
                    قسمت {toPersianDigits(episode)}
                  </p>
                </div>
              </AnimePrefetchLink>
              <time className="shrink-0 pt-1.5 text-[11.5px] leading-[17px] text-muted-foreground">
                {when}
              </time>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
