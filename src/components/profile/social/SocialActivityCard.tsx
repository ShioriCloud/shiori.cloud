import { Link } from 'react-router-dom'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import type { SocialProfileFeedItem } from '@/services/socialProfile'
import { SocialUserAvatar } from './SocialUserAvatar'
import { SOCIAL_SURFACE_CLASS } from './socialUi'
import { socialFeedMeta } from './socialFeedMeta'

const activityDetail = (item: SocialProfileFeedItem): string => {
  if (item.type === 'anime_comment') return item.comment_preview
  if (item.type === 'public_list_add') return `به «${item.list_name}» اضافه کرد`
  if (item.type === 'user_follow') return item.target.display_name
  if (item.type === 'rating' && item.user_rating != null) {
    return `نمره ${toPersianDigits(item.user_rating)}`
  }
  if (item.type === 'list_add') return 'افزوده به لیست تماشا'
  const progress =
    item.episodes_total != null && item.episodes_total > 0
      ? `${toPersianDigits(item.episodes_watched)}/${toPersianDigits(item.episodes_total)}`
      : toPersianDigits(item.episodes_watched)
  const rating =
    item.user_rating != null ? ` · نمره ${toPersianDigits(item.user_rating)}` : ''
  return `${progress} قسمت${rating}`
}

type SocialActivityCardProps = {
  item: SocialProfileFeedItem
}

const FeedActorHeader = ({
  item,
}: {
  item: SocialProfileFeedItem
}) => {
  const meta = socialFeedMeta[item.type]
  const when = formatRelativeTimeFa(item.updated_at)

  return (
    <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
      <Link
        to={`/u/${encodeURIComponent(item.actor.telegram_user_id)}`}
        className="flex min-w-0 flex-1 items-center gap-2.5 active:opacity-85"
      >
        <SocialUserAvatar
          photoUrl={item.actor.photo_url}
          displayName={item.actor.display_name}
          size="sm"
          className="ring-0"
        />
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-semibold text-foreground">
            {item.actor.display_name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {meta.label}
            <span className="mx-1 opacity-50">·</span>
            {when}
          </p>
        </div>
      </Link>
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
          meta.pillClass
        )}
        aria-hidden
      >
        <meta.Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
    </div>
  )
}

export const SocialActivityCard = ({ item }: SocialActivityCardProps) => {
  if (item.type === 'user_follow') {
    return (
      <article className={SOCIAL_SURFACE_CLASS}>
        <FeedActorHeader item={item} />
        <Link
          to={`/u/${encodeURIComponent(item.target.telegram_user_id)}`}
          className="flex items-center gap-3 border-t border-border/35 px-3 py-3 active:bg-muted/25"
        >
          <SocialUserAvatar
            photoUrl={item.target.photo_url}
            displayName={item.target.display_name}
            size="md"
          />
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.target.display_name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">پروفایل کاربر</p>
          </div>
        </Link>
      </article>
    )
  }

  const routeRef = {
    id: item.anime_id,
    slug: item.slug,
    title: item.title,
  }
  const bottomTo =
    item.type === 'public_list_add'
      ? `/u/${encodeURIComponent(item.actor.telegram_user_id)}/lists/${encodeURIComponent(item.list_id)}`
      : animeDetailPath(routeRef)

  const bottomPrefetchId =
    item.type === 'public_list_add'
      ? null
      : animePublicSegment(routeRef)

  const detail = activityDetail(item)
  const detailClass =
    item.type === 'anime_comment' ? 'line-clamp-3 text-foreground/90' : 'text-muted-foreground'

  const bottomContent = (
    <>
      <div className="media-card-skeuo w-[4.25rem] shrink-0 rounded-xl">
        <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
          {item.image ? (
            <img src={item.image} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>
      <div className="min-w-0 flex-1 text-right">
        <BidiText as="p" className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {item.title}
        </BidiText>
        <p className={cn('mt-1 text-xs tabular-nums', detailClass)}>{detail}</p>
      </div>
    </>
  )

  return (
    <article className={SOCIAL_SURFACE_CLASS}>
      <FeedActorHeader item={item} />
      {bottomPrefetchId ? (
        <AnimePrefetchLink
          animeId={bottomPrefetchId}
          to={bottomTo}
          className="flex gap-3 border-t border-border/35 px-3 py-3 active:bg-muted/25"
        >
          {bottomContent}
        </AnimePrefetchLink>
      ) : (
        <Link
          to={bottomTo}
          className="flex gap-3 border-t border-border/35 px-3 py-3 active:bg-muted/25"
        >
          {bottomContent}
        </Link>
      )}
    </article>
  )
}
