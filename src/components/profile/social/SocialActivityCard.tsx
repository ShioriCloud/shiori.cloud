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

/** Persian sentence around the anime title for watch_status cards. */
const watchStatusSentenceParts = (
  status: string
): { before: string; after: string } | null => {
  switch (status) {
    case 'watching':
      return { before: 'داره انیمه‌ی ', after: ' رو می‌بینه.' }
    case 'planning':
      return { before: 'می‌خواد انیمه‌ی ', after: ' رو ببینه.' }
    case 'completed':
      return { before: 'انیمه‌ی ', after: ' رو کامل دید.' }
    case 'rewatching':
      return { before: 'داره انیمه‌ی ', after: ' رو دوباره می‌بینه.' }
    case 'paused':
      return { before: 'فعلاً دیدن انیمه‌ی ', after: ' رو متوقف کرد.' }
    case 'dropped':
      return { before: 'انیمه‌ی ', after: ' رو دراپ کرد.' }
    default:
      return null
  }
}

const activityHeadline = (item: SocialProfileFeedItem): string => {
  if (item.type === 'anime_comment') return item.comment_preview
  if (item.type === 'public_list_add') return `به «${item.list_name}» اضافه کرد`
  if (item.type === 'playlist_created') return 'پلی‌لیست عمومی ساخت'
  if (item.type === 'rating' && item.user_rating != null) {
    return `نمره ${toPersianDigits(item.user_rating)} داد`
  }
  if (item.type === 'list_add') return 'به لیست تماشا اضافه کرد'
  const rating =
    item.user_rating != null ? ` · نمره ${toPersianDigits(item.user_rating)}` : ''
  if (item.type === 'watch_status') {
    const status = String(item.list_status ?? '').trim()
    const parts = watchStatusSentenceParts(status)
    if (parts) return `${parts.before}${item.title}${parts.after}${rating}`
    return `وضعیت تماشای ${item.title} را عوض کرد${rating}`
  }
  const progress =
    item.episodes_total != null && item.episodes_total > 0
      ? `${toPersianDigits(item.episodes_watched)} از ${toPersianDigits(item.episodes_total)}`
      : toPersianDigits(item.episodes_watched)
  return `قسمت ${progress} را دید${rating}`
}

const watchProgressPercent = (item: SocialProfileFeedItem): number | null => {
  if (item.type === 'watch_status') {
    const status = String(item.list_status ?? '').trim()
    if (item.episodes_total == null || item.episodes_total <= 0) return null
    if (status === 'completed') return 100
    if (status === 'watching' || status === 'rewatching') {
      return Math.min(100, Math.round((item.episodes_watched / item.episodes_total) * 100))
    }
    return null
  }
  if (item.type !== 'watch_progress') return null
  if (item.episodes_total == null || item.episodes_total <= 0) return null
  return Math.min(100, Math.round((item.episodes_watched / item.episodes_total) * 100))
}

type SocialActivityCardProps = {
  item: SocialProfileFeedItem
}

const useFeedEngagement = (
  item: SocialProfileFeedItem,
  engagement: SocialFeedEngagement,
  onEngagement: (next: SocialFeedEngagement) => void
) => {
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

  return {
    busy,
    noteOpen,
    setNoteOpen,
    noteDraft,
    setNoteDraft,
    notePrivate,
    setNotePrivate,
    key,
    visibleNotes,
    myPrivateOnly,
    onToggleLike,
    openNote,
    saveNote,
    onEngagement,
  }
}

const FeedEngagementActions = ({
  engagement,
  busy,
  myPrivateOnly,
  onToggleLike,
  openNote,
}: {
  engagement: SocialFeedEngagement
  busy: boolean
  myPrivateOnly: boolean
  onToggleLike: () => void
  openNote: () => void
}) => (
  <div className="flex shrink-0 items-center gap-0.5">
    <button
      type="button"
      onClick={() => void onToggleLike()}
      disabled={busy}
      aria-label="لایک"
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-1.5 text-[11px] font-medium tabular-nums',
        'active:opacity-80',
        engagement.liked_by_me ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Heart
        className={cn('size-3.5', engagement.liked_by_me && 'fill-current')}
        aria-hidden
      />
      {engagement.like_count > 0 ? toPersianDigits(engagement.like_count) : null}
    </button>
    <button
      type="button"
      onClick={openNote}
      aria-label={engagement.my_note ? 'ویرایش یادداشت' : 'یادداشت'}
      className={cn(
        'relative inline-flex size-8 items-center justify-center rounded-lg',
        'active:opacity-80',
        engagement.my_note
          ? 'text-amber-600 dark:text-amber-300'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <StickyNote className="size-3.5" aria-hidden />
      {myPrivateOnly ? (
        <Lock className="absolute end-0.5 top-0.5 size-2.5 opacity-70" aria-hidden />
      ) : null}
    </button>
  </div>
)

const FeedEngagementExtras = ({
  engagement,
  onEngagement,
  ctl,
}: {
  engagement: SocialFeedEngagement
  onEngagement: (next: SocialFeedEngagement) => void
  ctl: ReturnType<typeof useFeedEngagement>
}) => {
  const {
    busy,
    noteOpen,
    setNoteOpen,
    noteDraft,
    setNoteDraft,
    notePrivate,
    setNotePrivate,
    key,
    visibleNotes,
    saveNote,
  } = ctl
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      {visibleNotes.length > 0 ? (
        <ul className="space-y-2 border-t border-border/25 px-3 py-2">
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
              <div className="min-w-0 flex-1 text-start">
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
                disabled={busy || deleting}
                onClick={() => {
                  void (async () => {
                    setDeleting(true)
                    try {
                      const next = await deleteSocialFeedNote(key)
                      onEngagement(next)
                      setNoteDraft('')
                      setNoteOpen(false)
                    } catch {
                      showAppToast('حذف نوت ناموفق بود', 'error')
                    } finally {
                      setDeleting(false)
                    }
                  })()
                }}
              >
                حذف
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" size="sm" disabled={busy || deleting} onClick={() => void saveNote()}>
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const FeedCardShell = ({
  item,
  isOwn,
  engagement,
  onEngagement,
  children,
}: {
  item: SocialProfileFeedItem
  isOwn: boolean
  engagement: SocialFeedEngagement
  onEngagement: (next: SocialFeedEngagement) => void
  children: ReactNode
}) => {
  const meta = socialFeedMeta[item.type]
  const when = formatRelativeTimeFa(item.updated_at)
  const ctl = useFeedEngagement(item, engagement, onEngagement)

  return (
    <article className={FEED_CARD_SURFACE_CLASS}>
      <span
        aria-hidden
        className={cn('absolute inset-y-0 start-0 w-[2px]', meta.edgeClass)}
      />

      <div className="flex items-center gap-2 pe-2.5 ps-3.5 pt-2.5 pb-1.5">
        <Link
          to={`/u/${encodeURIComponent(item.actor.telegram_user_id)}`}
          className="flex min-w-0 flex-1 items-center gap-2 active:opacity-85"
        >
          <SocialUserAvatar
            photoUrl={item.actor.photo_url}
            displayName={item.actor.display_name}
            size="sm"
            className="ring-0"
          />
          {/* justify-start in RTL = toward avatar (right); avoid justify-end which flips left. */}
          <div className="min-w-0 flex-1 text-start">
            <p className="flex min-w-0 items-center justify-start gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">
                {item.actor.display_name}
              </span>
              {isOwn ? (
                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  تو
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 flex min-w-0 items-center justify-start gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn('size-1.5 shrink-0 rounded-full', meta.dotClass)} aria-hidden />
              <span className="truncate">{meta.label}</span>
              <span className="text-border">·</span>
              <time dateTime={item.updated_at} className="shrink-0 tabular-nums">
                {when}
              </time>
            </p>
          </div>
        </Link>

        <FeedEngagementActions
          engagement={engagement}
          busy={ctl.busy}
          myPrivateOnly={ctl.myPrivateOnly}
          onToggleLike={ctl.onToggleLike}
          openNote={ctl.openNote}
        />
      </div>

      {children}

      <FeedEngagementExtras
        engagement={engagement}
        onEngagement={onEngagement}
        ctl={ctl}
      />
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
      <FeedCardShell
        item={item}
        isOwn={isOwn}
        engagement={engagement}
        onEngagement={setEngagement}
      >
        <Link
          to={listTo}
          className="flex gap-2.5 border-t border-border/30 px-3.5 py-2.5 active:bg-muted/20"
        >
          <div
            className={cn(
              'flex size-14 shrink-0 items-center justify-center rounded-xl border',
              meta.tileClass
            )}
          >
            <meta.Icon className="size-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 self-center text-start">
            <BidiText
              as="p"
              className="line-clamp-2 text-end text-sm font-semibold leading-snug text-foreground"
            >
              {item.list_name}
            </BidiText>
            <p className="mt-0.5 text-xs text-muted-foreground">{headline}</p>
          </div>
        </Link>
      </FeedCardShell>
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
  const isWatchStatus = item.type === 'watch_status'
  const progress = watchProgressPercent(item)
  const statusParts =
    isWatchStatus && 'list_status' in item
      ? watchStatusSentenceParts(String(item.list_status ?? '').trim())
      : null
  const ratingSuffix =
    isWatchStatus && item.user_rating != null
      ? ` · نمره ${toPersianDigits(item.user_rating)}`
      : ''

  const mediaBlock = (
    <>
      <div
        className={cn(
          'media-card-skeuo media-card-skeuo-dense shrink-0 rounded-xl',
          isComment ? 'w-12' : 'w-14'
        )}
      >
        <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
          {item.image ? (
            <img src={item.image} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>
      <div className="min-w-0 flex-1 self-center text-start">
        {isWatchStatus && statusParts ? (
          <p className="line-clamp-3 text-sm leading-snug text-foreground">
            {statusParts.before}
            <BidiText as="span" className="font-semibold">
              {item.title}
            </BidiText>
            {statusParts.after}
            {ratingSuffix ? (
              <span className="text-muted-foreground">{ratingSuffix}</span>
            ) : null}
          </p>
        ) : (
          <>
            <BidiText
              as="p"
              className="line-clamp-2 text-end text-sm font-semibold leading-snug text-foreground"
            >
              {item.title}
            </BidiText>
            {isComment ? (
              <p className="mt-1 line-clamp-2 rounded-lg bg-muted/45 px-2 py-1.5 text-xs leading-5 text-foreground/90">
                {headline}
              </p>
            ) : (
              <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{headline}</p>
            )}
          </>
        )}
        {progress != null ? (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
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
    <FeedCardShell
      item={item}
      isOwn={isOwn}
      engagement={engagement}
      onEngagement={setEngagement}
    >
      {bottomPrefetchId ? (
        <AnimePrefetchLink
          animeId={bottomPrefetchId}
          to={bottomTo}
          className="flex gap-2.5 border-t border-border/30 px-3.5 py-2.5 active:bg-muted/20"
        >
          {mediaBlock}
        </AnimePrefetchLink>
      ) : (
        <Link
          to={bottomTo}
          className="flex gap-2.5 border-t border-border/30 px-3.5 py-2.5 active:bg-muted/20"
        >
          {mediaBlock}
        </Link>
      )}
    </FeedCardShell>
  )
}
