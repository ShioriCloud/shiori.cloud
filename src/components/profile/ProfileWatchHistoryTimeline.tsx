import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { ProfileAnimeMediaRow } from '@/components/profile/ProfileAnimeMediaRow'
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
      <ul className="flex flex-col gap-2">
        {history.map((item) => {
          const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
          const episode = item.episodes_watched ?? 0
          const when = formatRelativeTimeFa(item.updated_at)
          return (
            <li key={`${item.anime_id}-${item.updated_at}`}>
              <ProfileAnimeMediaRow
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                image={item.image}
                title={item.title}
                meta={
                  <>
                    <span>قسمت {toPersianDigits(episode)}</span>
                    <span className="size-1 rounded-full bg-foreground/30" aria-hidden />
                    <time>{when}</time>
                  </>
                }
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
