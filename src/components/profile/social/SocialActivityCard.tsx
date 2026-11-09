import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Lock, StickyNote } from 'lucide-react'
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
import { useAppAuth } from '@/hooks/useAppAuth'
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
import { FEED_CARD_SURFACE_CLASS, socialFeedMeta } from './socialFeedMeta'

const emptyEngagement = (item: SocialProfileFeedItem): SocialFeedEngagement => ({
  activity_key: socialFeedActivityKey(item),
  like_count: 0,
  liked_by_me: false,
  my_note: null,
  my_note_is_private: false,
  notes: [],
  public_notes: [],
})

const activityHeadline = (item: SocialProfileFeedItem): string => {
  if (item.type === 'anime_comment') return item.comment_preview
  if (item.type === 'public_list_add') return `به «${item.list_name}» اضافه کرد`
  if (item.type === 'playlist_created') return 'پلی‌لیست عمومی ساخت'
  if (item.type === 'rating' && item.user_rating != null) {
    return `نمره ${toPersianDigits(item.user_rating)} داد`
  }
  if (item.type === 'list_add') return 'به لیست تماشا اضافه کرد'
  const progress =
    item.episodes_total != null && item.episodes_total > 0
      ? `${toPersianDigits(item.episodes_watched)} از ${toPersianDigits(item.episodes_total)}`
      : toPersianDigits(item.episodes_watched)
  const rating =
    item.user_rating != null ? ` · نمره ${toPersianDigits(item.user_rating)}` : ''
  return `قسمت ${progress} را دید${rating}`
}

const watchProgressPercent = (item: SocialProfileFeedItem): number | null => {
  if (item.type !== 'watch_progress') return null
  if (item.episodes_total == null || item.episodes_total <= 0) return null
  return Math.min(100, Math.round((item.episodes_watched / item.episodes_total) * 100))
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
  const [notePrivate, setNotePrivate] = useState(engagement.my_note_is_private === true)
  const [busy, setBusy] = useState(false)
  const key = engagement.activity_key || socialFeedActivityKey(item)
  const visibleNotes = engagement.notes ?? engagement.public_notes ?? []
  const myPrivateOnly =
    Boolean(engagement.my_note) && engagement.my_note_is_private === true

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
    setNotePrivate(engagement.my_note_is_private === true)
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
        const next = await upsertSocialFeedNote(key, text, notePrivate)
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
      <div className="flex items-center gap-0.5 px-3 py-2">
        <button
          type="button"
          onClick={() => void onToggleLike()}
          disabled={busy}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium',
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
          {engagement.like_count > 0 ? toPersianDigits(engagement.like_count) : 'لایک'}
        </button>
        <button
          type="button"
          onClick={openNote}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium',
            'active:opacity-80',
            engagement.my_note
              ? 'text-amber-600 dark:text-amber-300'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <StickyNote className="h-3.5 w-3.5" aria-hidden />
          {engagement.my_note ? 'نوت' : 'یادداشت'}
          {myPrivateOnly ? <Lock className="h-3 w-3 opacity-70" aria-hidden /> : null}
        </button>
      </div>

      {visibleNotes.length > 0 ? (
        <ul className="space-y-2 border-t border-border/25 px-3 py-2.5">
          {visibleNotes.map((note) => (
            <li key={`${note.telegram_user_id}:${note.created_at}`} className="flex gap-2">
              <Link
                to={`/u/${encodeURIComponent(note.telegram_user_id)}`}
                className="shrink-0 active:opacity-85"
              >
                <SocialUserAvatar
                  photoUrl={note.photo_url}
                  displayName={note.display_name}
                  size="sm"
                  className="!h-7 !w-7 ring-0"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[11px] leading-4">
                  <Link
                    to={`/u/${encodeURIComponent(note.telegram_user_id)}`}
                    className="font-semibold text-foreground active:opacity-85"
                  >
                    {note.display_name}
                  </Link>
                  {note.is_private ? (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1 py-0.5 text-[9px] font-medium text-muted-foreground">
                      <Lock className="h-2.5 w-2.5" aria-hidden />
                      خصوصی
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[11px] leading-5 text-foreground/85">{note.body}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-sm border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle>یادداشت روی این فعالیت</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder={
              notePrivate ? 'فقط تو و صاحب فعالیت می‌بینید…' : 'همه می‌توانند ببینند…'
            }
            maxLength={280}
            className="min-h-[6rem]"
          />
          <button
            type="button"
            onClick={() => setNotePrivate((v) => !v)}
            className={cn(
              'flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-start text-xs transition-colors',
              notePrivate
                ? 'border-amber-400/35 bg-amber-400/10 text-amber-900 dark:text-amber-100'
                : 'border-border/55 bg-muted/30 text-foreground'
            )}
          >
            {notePrivate ? (
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <StickyNote className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{notePrivate ? 'خصوصی' : 'عمومی'}</span>
              <span className="mt-0.5 block text-[11px] opacity-80">
                {notePrivate
                  ? 'فقط ارسال‌کننده و صاحب فعالیت می‌بینند'
                  : 'همه در فید می‌بینند؛ صاحب فعالیت هم مطلع می‌شود'}
              </span>
            </span>
          </button>
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

const FeedCardChrome = ({
  item,
  isOwn,
  children,
}: {
  item: SocialProfileFeedItem
  isOwn: boolean
  children: ReactNode
}) => {
  const meta = socialFeedMeta[item.type]
  const when = formatRelativeTimeFa(item.updated_at)

  return (
    <article className={FEED_CARD_SURFACE_CLASS}>
      <span
        aria-hidden
        className={cn('absolute inset-y-0 start-0 w-[2px]', meta.edgeClass)}
      />

      <div className="flex items-center gap-2.5 pe-3 ps-3.5 pt-3 pb-2">
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
            <p className="flex min-w-0 items-center justify-end gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">
                {item.actor.display_name}
              </span>
              {isOwn ? (
                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  تو
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn('size-1.5 shrink-0 rounded-full', meta.dotClass)} aria-hidden />
              <span className="truncate">{meta.label}</span>
              <span className="text-border">·</span>
              <time dateTime={item.updated_at} className="shrink-0 tabular-nums">
                {when}
              </time>
            </p>
          </div>
        </Link>
      </div>

      {children}
    </article>
  )
}

export const SocialActivityCard = ({ item }: SocialActivityCardProps) => {
  const { user } = useAppAuth()
  const [engagement, setEngagement] = useState<SocialFeedEngagement>(
    () => item.engagement ?? emptyEngagement(item)
  )
  const meta = socialFeedMeta[item.type]
  const isOwn = Boolean(user?.id != null && String(user.id) === String(item.actor.telegram_user_id))
  const headline = activityHeadline(item)

  if (item.type === 'playlist_created') {
    const listTo = `/u/${encodeURIComponent(item.actor.telegram_user_id)}/lists/${encodeURIComponent(item.list_id)}`
    return (
      <FeedCardChrome item={item} isOwn={isOwn}>
        <Link
          to={listTo}
          className="flex gap-3 border-t border-border/30 px-3.5 py-3 active:bg-muted/20"
        >
          <div
            className={cn(
              'flex size-[4.25rem] shrink-0 items-center justify-center rounded-xl border',
              meta.tileClass
            )}
          >
            <meta.Icon className="size-6" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 self-center text-right">
            <BidiText as="p" className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {item.list_name}
            </BidiText>
            <p className="mt-1 text-xs text-muted-foreground">{headline}</p>
          </div>
        </Link>
        <div className="border-t border-border/30">
          <FeedEngagementBar
            item={item}
            engagement={engagement}
            onEngagement={setEngagement}
          />
        </div>
      </FeedCardChrome>
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
  const isComment = item.type === 'anime_comment'
  const progress = watchProgressPercent(item)

  const mediaBlock = (
    <>
      <div
        className={cn(
          'media-card-skeuo media-card-skeuo-dense shrink-0 rounded-xl',
          isComment ? 'w-14' : 'w-[4.25rem]'
        )}
      >
        <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
          {item.image ? (
            <img src={item.image} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>
      <div className="min-w-0 flex-1 self-center text-right">
        <BidiText as="p" className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {item.title}
        </BidiText>
        {isComment ? (
          <p className="mt-1.5 line-clamp-3 rounded-xl bg-muted/45 px-2.5 py-2 text-xs leading-5 text-foreground/90">
            {headline}
          </p>
        ) : (
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">{headline}</p>
        )}
        {progress != null ? (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-sky-500/80 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>
    </>
  )

  return (
    <FeedCardChrome item={item} isOwn={isOwn}>
      {bottomPrefetchId ? (
        <AnimePrefetchLink
          animeId={bottomPrefetchId}
          to={bottomTo}
          className="flex gap-3 border-t border-border/30 px-3.5 py-3 active:bg-muted/20"
        >
          {mediaBlock}
        </AnimePrefetchLink>
      ) : (
        <Link
          to={bottomTo}
          className="flex gap-3 border-t border-border/30 px-3.5 py-3 active:bg-muted/20"
        >
          {mediaBlock}
        </Link>
      )}
      <div className="border-t border-border/30">
        <FeedEngagementBar
          item={item}
          engagement={engagement}
          onEngagement={setEngagement}
        />
      </div>
    </FeedCardChrome>
  )
}
