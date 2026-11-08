import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileAnimeRailSkeleton } from '@/components/profile/ProfileSectionSkeletons'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'

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
    <section className="mx-4 mt-5 flex flex-col gap-3">
      <h2 className="text-[15.5px] font-bold leading-snug text-foreground">تاریخچه تماشا</h2>
      <ul className="flex flex-col gap-2.5">
        {history.map((item) => {
          const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
          const episode = item.episodes_watched ?? 0
          const when = formatRelativeTimeFa(item.updated_at)
          return (
            <li key={`${item.anime_id}-${item.updated_at}`}>
              <AnimePrefetchLink
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-3 py-3 active:opacity-85 dark:border-[#1e1e24] dark:bg-[#141418]"
              >
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <BidiText as="p" className="truncate text-sm font-semibold text-foreground">
                    {item.title}
                  </BidiText>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>قسمت {toPersianDigits(episode)}</span>
                    <span className="size-1 rounded-full bg-muted-foreground/40" aria-hidden />
                    <time>{when}</time>
                  </div>
                </div>
              </AnimePrefetchLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
