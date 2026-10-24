import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import type { AnimeCommentActivity } from '@/services/animeComments'
import { MessageCircle } from 'lucide-react'
import { SOCIAL_SURFACE_CLASS } from './socialUi'

type SocialCommentActivityCardProps = {
  item: AnimeCommentActivity
  tone?: 'self' | 'public'
  className?: string
}

export const SocialCommentActivityCard = ({
  item,
  tone = 'self',
  className,
}: SocialCommentActivityCardProps) => {
  const anime = item.anime
  const routeRef = anime ? { id: anime.id, slug: anime.slug, title: anime.title } : null
  const verb = item.parent_id
    ? tone === 'public'
      ? 'پاسخ داد'
      : 'پاسخ دادی'
    : tone === 'public'
      ? 'نظر گذاشت'
      : 'نظر گذاشتی'
  const when = formatRelativeTimeFa(item.created_at)
  const likes =
    item.like_count > 0 ? ` · ${toPersianDigits(item.like_count)} پسند` : ''

  const inner = (
    <article className={cn(SOCIAL_SURFACE_CLASS, className)}>
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-semibold text-foreground">{verb}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {when}
            {likes}
          </p>
        </div>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
            'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300'
          )}
          aria-hidden
        >
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
      </div>

      <div className="flex gap-3 border-t border-border/35 px-3 py-3">
        <div className="media-card-skeuo w-[4.25rem] shrink-0 rounded-xl">
          <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
            {anime?.image ? (
              <img src={anime.image} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <BidiText
            as="p"
            className="line-clamp-2 text-sm font-semibold leading-snug text-foreground"
          >
            {anime?.title ?? 'انیمه'}
          </BidiText>
          <p className="mt-1 line-clamp-3 text-xs leading-6 text-foreground/90">{item.body}</p>
        </div>
      </div>
    </article>
  )

  if (!routeRef) return inner

  return (
    <AnimePrefetchLink
      animeId={animePublicSegment(routeRef)}
      to={`${animeDetailPath(routeRef)}?tab=comments`}
      className="block active:scale-[0.99] transition-transform"
    >
      {inner}
    </AnimePrefetchLink>
  )
}
