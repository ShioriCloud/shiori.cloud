import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { useSocialFeed } from '@/hooks/useSocialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import type { SocialProfileFeedItem } from '@/services/socialProfile'
import { ProfileUserListRow } from './ProfileUserListRow'

const activityLabel = (item: SocialProfileFeedItem): string => {
  if (item.type === 'rating') return 'نمره داد'
  if (item.type === 'list_add') return 'به لیستش اضافه کرد'
  return 'پیشرفت تماشا'
}

const activityDetail = (item: SocialProfileFeedItem): string => {
  if (item.type === 'rating' && item.user_rating != null) {
    return `نمره ${toPersianDigits(item.user_rating)}`
  }
  if (item.type === 'list_add') return 'افزوده‌شده به لیست'
  const progress =
    item.episodes_total != null && item.episodes_total > 0
      ? `${toPersianDigits(item.episodes_watched)}/${toPersianDigits(item.episodes_total)}`
      : toPersianDigits(item.episodes_watched)
  const rating =
    item.user_rating != null ? ` · نمره ${toPersianDigits(item.user_rating)}` : ''
  return `${progress} قسمت${rating}`
}

export const ProfileFeedPanel = ({ enabled = true }: { enabled?: boolean }) => {
  const { data, isLoading } = useSocialFeed(enabled)

  if (!enabled) {
    return (
      <MyListCompactCard className="p-4 text-center text-sm leading-7 text-muted-foreground">
        فید عمومی وقتی پروفایل اجتماعی برایت فعال شود در دسترس است.
      </MyListCompactCard>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-20 rounded-xl bg-muted/70" />
        <div className="h-20 rounded-xl bg-muted/70" />
      </div>
    )
  }

  if (!data?.enabled) {
    return (
      <MyListCompactCard className="p-4 text-center text-sm leading-7 text-muted-foreground">
        فید عمومی وقتی پروفایل اجتماعی برایت فعال شود در دسترس است.
      </MyListCompactCard>
    )
  }

  return (
    <div className="space-y-3">
      <Link
        to="/profile/people"
        className={cn(
          'flex h-11 items-center justify-center gap-2 rounded-xl border border-border/60',
          'bg-card text-sm font-medium text-foreground',
          'active:scale-[0.99] transition-transform'
        )}
      >
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
        جست‌وجوی کاربران
      </Link>

      {data.items.length === 0 ? (
        <ExploreEmptyState
          compact
          showImage={false}
          title="فید خالی است"
          subtitle="کاربرانی را که دوست داری دنبال کن تا فعالیتشان اینجا بیاید."
        />
      ) : (
        data.items.map((item) => {
          const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
          return (
            <MyListCompactCard
              key={`${item.actor.telegram_user_id}-${item.anime_id}-${item.updated_at}-${item.type}`}
              className="overflow-hidden"
            >
              <ProfileUserListRow user={item.actor} />
              <AnimePrefetchLink
                animeId={animePublicSegment(routeRef)}
                to={animeDetailPath(routeRef)}
                className="flex gap-3 border-t border-border/40 px-3 py-3 active:bg-muted/30"
              >
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[11px] text-muted-foreground">{activityLabel(item)}</p>
                  <BidiText as="p" className="line-clamp-2 text-sm font-semibold text-foreground">
                    {item.title}
                  </BidiText>
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                    {activityDetail(item)}
                  </p>
                </div>
              </AnimePrefetchLink>
            </MyListCompactCard>
          )
        })
      )}
    </div>
  )
}
