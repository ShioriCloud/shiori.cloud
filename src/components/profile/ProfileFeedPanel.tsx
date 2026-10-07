import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { useSocialFeed } from '@/hooks/useSocialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'
import { ProfileUserListRow } from './ProfileUserListRow'

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

  if (data.items.length === 0) {
    return (
      <ExploreEmptyState
        compact
        showImage={false}
        title="فید خالی است"
        subtitle="کاربرانی را که دوست داری دنبال کن تا پیشرفت تماشایشان اینجا بیاید."
      />
    )
  }

  return (
    <div className="space-y-3">
      {data.items.map((item) => {
        const routeRef = { id: item.anime_id, slug: item.slug, title: item.title }
        const progress =
          item.episodes_total != null && item.episodes_total > 0
            ? `${toPersianDigits(item.episodes_watched)}/${toPersianDigits(item.episodes_total)}`
            : toPersianDigits(item.episodes_watched)
        return (
          <MyListCompactCard key={`${item.actor.telegram_user_id}-${item.anime_id}-${item.updated_at}`} className="overflow-hidden">
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
                <p className="text-[11px] text-muted-foreground">پیشرفت تماشا</p>
                <BidiText as="p" className="line-clamp-2 text-sm font-semibold text-foreground">
                  {item.title}
                </BidiText>
                <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{progress} قسمت</p>
              </div>
            </AnimePrefetchLink>
          </MyListCompactCard>
        )
      })}
    </div>
  )
}
