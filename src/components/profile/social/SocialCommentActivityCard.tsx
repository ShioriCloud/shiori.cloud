import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
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

  const inner = (
    <article
      className={cn(
        'flex flex-col gap-2.5 rounded-[14px] border border-border/70 bg-card px-3.5 pb-3.5 pt-3',
        'dark:border-[#1e1e24] dark:bg-[#141418]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="h-[42px] w-[30px] shrink-0 overflow-hidden rounded-[6px] border border-white/10 bg-muted">
            {anime?.image ? (
              <img src={anime.image} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <BidiText
            as="p"
            className="truncate text-[13px] font-semibold leading-5 text-foreground"
          >
            {anime?.title ?? 'انیمه'}
          </BidiText>
        </div>
        <time className="shrink-0 text-[11.5px] leading-[17px] text-muted-foreground">{when}</time>
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
