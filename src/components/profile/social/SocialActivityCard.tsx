import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, StickyNote } from 'lucide-react'
import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import { hapticSelection } from '@/lib/telegramHaptics'
import { showAppToast } from '@/store/appFeedbackStore'
import {
  deleteSocialFeedNote,
  socialFeedActivityKey,
  toggleSocialFeedLike,
  upsertSocialFeedNote,
  type SocialFeedEngagement,
  type SocialProfileFeedItem,
} from '@/services/socialProfile'
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

const FeedEngagementBar = ({
  item,
  engagement,
  onEngagement,
}: {
  item: SocialProfileFeedItem
  engagement: SocialFeedEngagement
  onEngagement: (next: SocialFeedEngagement) => void
}) => {
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState(engagement.my_note ?? '')
  const [busy, setBusy] = useState(false)
  const key = engagement.activity_key || socialFeedActivityKey(item)

  const onToggleLike = async () => {
    if (busy) return
    hapticSelection()
    setBusy(true)
    try {
      const next = await toggleSocialFeedLike(key, item.type)
      onEngagement(next)
    } catch {
      showAppToast('لایک ثبت نشد', 'error')
    } finally {
      setBusy(false)
    }
  }

  const openNote = () => {
    setNoteDraft(engagement.my_note ?? '')
    setNoteOpen(true)
  }

  const saveNote = async () => {
    const text = noteDraft.trim()
    setBusy(true)
    try {
      if (!text) {
        const next = await deleteSocialFeedNote(key)
        onEngagement(next)
      } else {
        const next = await upsertSocialFeedNote(key, text)
        onEngagement(next)
      }
      setNoteOpen(false)
      showAppToast(text ? 'نوت ذخیره شد' : 'نوت حذف شد', 'success')
    } catch {
      showAppToast('ذخیره نوت ناموفق بود', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1 border-t border-border/35 px-2 py-1.5">
        <button
          type="button"
          onClick={() => void onToggleLike()}
          disabled={busy}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium',
            'active:opacity-80',
            engagement.liked_by_me
              ? 'text-rose-500'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Heart
            className={cn('h-3.5 w-3.5', engagement.liked_by_me && 'fill-current')}
            aria-hidden
          />
          {engagement.like_count > 0 ? toPersianDigits(engagement.like_count) : 'پسند'}
        </button>
        <button
          type="button"
          onClick={openNote}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium',
            'active:opacity-80',
            engagement.my_note
              ? 'text-amber-600 dark:text-amber-300'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <StickyNote className="h-3.5 w-3.5" aria-hidden />
          {engagement.my_note ? 'نوت' : 'یادداشت'}
        </button>
      </div>

      {engagement.my_note ? (
        <p className="border-t border-border/25 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          یادداشت تو: {engagement.my_note}
        </p>
      ) : null}

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-sm border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle>یادداشت روی این فعالیت</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="فقط برای خودت دیده می‌شود…"
            maxLength={280}
            className="min-h-[6rem]"
          />
          <DialogFooter className="gap-2 sm:justify-between">
            {engagement.my_note ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setNoteDraft('')
                  void (async () => {
                    setBusy(true)
                    try {
                      const next = await deleteSocialFeedNote(key)
                      onEngagement(next)
                      setNoteOpen(false)
                    } catch {
                      showAppToast('حذف نوت ناموفق بود', 'error')
                    } finally {
                      setBusy(false)
                    }
                  })()
                }}
              >
                حذف
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" size="sm" disabled={busy} onClick={() => void saveNote()}>
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const SocialActivityCard = ({ item }: SocialActivityCardProps) => {
  const [engagement, setEngagement] = useState<SocialFeedEngagement>(
    () =>
      item.engagement ?? {
        activity_key: socialFeedActivityKey(item),
        like_count: 0,
        liked_by_me: false,
        my_note: null,
      }
  )
  const meta = socialFeedMeta[item.type]
  const when = formatRelativeTimeFa(item.updated_at)

  if (item.type === 'user_follow') {
    return (
      <article className={cn(SOCIAL_SURFACE_CLASS, 'overflow-hidden')}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Link
            to={`/u/${encodeURIComponent(item.actor.telegram_user_id)}`}
            className="shrink-0 active:opacity-85"
          >
            <SocialUserAvatar
              photoUrl={item.actor.photo_url}
              displayName={item.actor.display_name}
              size="sm"
              className="ring-0"
            />
          </Link>
          <p className="min-w-0 flex-1 truncate text-xs leading-5 text-foreground">
            <Link
              to={`/u/${encodeURIComponent(item.actor.telegram_user_id)}`}
              className="font-semibold active:opacity-85"
            >
              {item.actor.display_name}
            </Link>
            <span className="text-muted-foreground"> شروع کرد دنبال کردن </span>
            <Link
              to={`/u/${encodeURIComponent(item.target.telegram_user_id)}`}
              className="font-semibold active:opacity-85"
            >
              {item.target.display_name}
            </Link>
            <span className="text-muted-foreground"> · {when}</span>
          </p>
          <Link
            to={`/u/${encodeURIComponent(item.target.telegram_user_id)}`}
            className="shrink-0 active:opacity-85"
          >
            <SocialUserAvatar
              photoUrl={item.target.photo_url}
              displayName={item.target.display_name}
              size="sm"
              className="ring-0"
            />
          </Link>
        </div>
        <FeedEngagementBar item={item} engagement={engagement} onEngagement={setEngagement} />
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
    item.type === 'public_list_add' ? null : animePublicSegment(routeRef)

  const detail = activityDetail(item)
  const isComment = item.type === 'anime_comment'

  const mediaBlock = (
    <>
      <div
        className={cn(
          'media-card-skeuo shrink-0 rounded-xl',
          isComment ? 'w-14' : 'w-[4.25rem]'
        )}
      >
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
        <p
          className={cn(
            'mt-1 text-xs tabular-nums',
            isComment ? 'line-clamp-3 text-foreground/90' : 'text-muted-foreground'
          )}
        >
          {detail}
        </p>
      </div>
    </>
  )

  return (
    <article className={cn(SOCIAL_SURFACE_CLASS, 'overflow-hidden')}>
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

      {bottomPrefetchId ? (
        <AnimePrefetchLink
          animeId={bottomPrefetchId}
          to={bottomTo}
          className="flex gap-3 border-t border-border/35 px-3 py-3 active:bg-muted/25"
        >
          {mediaBlock}
        </AnimePrefetchLink>
      ) : (
        <Link
          to={bottomTo}
          className="flex gap-3 border-t border-border/35 px-3 py-3 active:bg-muted/25"
        >
          {mediaBlock}
        </Link>
      )}

      <FeedEngagementBar item={item} engagement={engagement} onEngagement={setEngagement} />
    </article>
  )
}
