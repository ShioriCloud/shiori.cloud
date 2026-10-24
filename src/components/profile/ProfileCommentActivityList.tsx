import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'
import type { AnimeCommentActivity } from '@/services/animeComments'

type ProfileCommentActivityListProps = {
  items: AnimeCommentActivity[]
  tone?: 'self' | 'public'
}

export const ProfileCommentActivityList = ({
  items,
  tone = 'self',
}: ProfileCommentActivityListProps) => (
  <div className="space-y-3">
    {items.map((item) => {
      const anime = item.anime
      const routeRef = anime
        ? { id: anime.id, slug: anime.slug, title: anime.title }
        : null
      const verb = item.parent_id
        ? tone === 'public'
          ? 'پاسخ داد'
          : 'پاسخ دادی'
        : tone === 'public'
          ? 'نظر گذاشت'
          : 'نظر گذاشتی'
      const inner = (
        <MyListCompactCard className="flex gap-3 overflow-hidden px-3 py-3">
          <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
            {anime?.image ? (
              <img src={anime.image} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[11px] text-muted-foreground">
              {verb}
              {item.like_count > 0
                ? ` · ${toPersianDigits(item.like_count)} پسند`
                : ''}
            </p>
            <BidiText as="p" className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground">
              {anime?.title ?? 'انیمه'}
            </BidiText>
            <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">
              {item.body}
            </p>
          </div>
        </MyListCompactCard>
      )

      if (!routeRef) return <div key={item.id}>{inner}</div>

      return (
        <AnimePrefetchLink
          key={item.id}
          animeId={animePublicSegment(routeRef)}
          to={`${animeDetailPath(routeRef)}?tab=comments`}
          className="block active:scale-[0.99] transition-transform"
        >
          {inner}
        </AnimePrefetchLink>
      )
    })}
  </div>
)
