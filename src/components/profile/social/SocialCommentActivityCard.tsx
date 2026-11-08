import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import type { AnimeCommentActivity } from '@/services/animeComments'

type SocialCommentActivityCardProps = {
  item: AnimeCommentActivity
  className?: string
}

export const SocialCommentActivityCard = ({
  item,
  className,
}: SocialCommentActivityCardProps) => {
  const anime = item.anime
  const routeRef = anime ? { id: anime.id, slug: anime.slug, title: anime.title } : null
  const when = formatRelativeTimeFa(item.created_at)
  const likes = `${toPersianDigits(item.like_count)} پسند`

  const inner = (
    <article
      className={cn(
        'flex flex-col gap-2.5 rounded-[14px] border border-border/70 bg-card px-3.5 pb-3.5 pt-3',
        'dark:border-[#1e1e24] dark:bg-[#141418]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-[68px] w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-muted">
          {anime?.image ? (
            <img src={anime.image} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <BidiText as="p" className="truncate text-[13px] font-semibold leading-5 text-foreground">
            {anime?.title ?? 'انیمه'}
          </BidiText>
          <div className="mt-1 flex items-center gap-2 text-[11.5px] leading-[17px] text-muted-foreground">
            <time>{when}</time>
            <span className="size-1 shrink-0 rounded-full bg-muted-foreground/40" aria-hidden />
            <span>{likes}</span>
          </div>
        </div>
      </div>
      <p className="line-clamp-3 text-right text-[13px] leading-[22px] text-foreground/75">{item.body}</p>
    </article>
  )

  if (!routeRef) return inner

  return (
    <AnimePrefetchLink
      animeId={animePublicSegment(routeRef)}
      to={`${animeDetailPath(routeRef)}?tab=comments`}
      className="block transition-transform active:scale-[0.99]"
    >
      {inner}
    </AnimePrefetchLink>
  )
}
