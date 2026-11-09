import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { PROFILE_ANIME_META_CLASS, ProfileAnimePoster } from '@/components/profile/ProfileAnimeMediaRow'
import { PROFILE_PANEL_CLASS } from '@/components/profile/profileStatsCard'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import type { AnimeCommentActivity } from '@/services/animeComments'
import { BidiText } from '@/components/BidiText'

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
  const likes = `${toPersianDigits(item.like_count)} لایک`

  const inner = (
    <article className={cn(PROFILE_PANEL_CLASS, 'flex flex-col gap-2.5 rounded-2xl px-3 py-3', className)}>
      <div className="flex items-center gap-3">
        <ProfileAnimePoster src={anime?.image} />
        <div className="min-w-0 flex-1 text-right">
          <BidiText as="p" className="line-clamp-2 text-[13.5px] font-semibold leading-5 text-foreground">
            {anime?.title ?? 'انیمه'}
          </BidiText>
          <div className={PROFILE_ANIME_META_CLASS} dir="rtl">
            <time>{when}</time>
            <span className="size-1 shrink-0 rounded-full bg-foreground/30" aria-hidden />
            <span>{likes}</span>
          </div>
        </div>
      </div>
      <p className="line-clamp-3 text-right text-[13px] leading-6 text-foreground/80">{item.body}</p>
    </article>
  )

  if (!routeRef) return inner

  return (
    <AnimePrefetchLink
      animeId={animePublicSegment(routeRef)}
      to={`${animeDetailPath(routeRef)}?tab=comments`}
      className="block active:opacity-90"
    >
      {inner}
    </AnimePrefetchLink>
  )
}
