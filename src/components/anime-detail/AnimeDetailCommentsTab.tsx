import { FormEvent, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Message01Icon, UserIcon } from 'hugeicons-react'
import { CornerDownLeft, Flag, ThumbsUp, Trash2 } from 'lucide-react'
import { BidiText } from '@/components/BidiText'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { useAppAuth } from '@/hooks/useAppAuth'
import {
  useAnimeCommentMutations,
  useAnimeCommentsQuery,
} from '@/hooks/useAnimeComments'
import type { AnimeComment } from '@/services/animeComments'
import { hapticSelection } from '@/lib/telegramHaptics'
import { showAppConfirm, showAppToast } from '@/store/appFeedbackStore'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const formatCommentTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const time = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
  return `${date} - ${time}`
}

const CommentCardShell = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <article
    dir="rtl"
    className={cn(
      'rounded-2xl border border-border/50 bg-muted/25 px-3.5 py-3.5',
      'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] dark:bg-muted/15',
      className
    )}
  >
    {children}
  </article>
)

const CommentComposer = ({
  placeholder,
  submitLabel,
  disabled,
  pending,
  onSubmit,
  compact,
}: {
  placeholder: string
  submitLabel: string
  disabled?: boolean
  pending?: boolean
  onSubmit: (body: string) => Promise<void>
  compact?: boolean
}) => {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = body.trim()
    if (!trimmed) return
    try {
      hapticSelection()
      await onSubmit(trimmed)
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال نظر ناموفق بود')
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2" dir="rtl">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || pending}
        maxLength={2000}
        rows={compact ? 2 : 3}
        className="min-h-[5rem] resize-none text-sm leading-7 text-right"
      />
      {error ? <p className="text-right text-xs text-red-400">{error}</p> : null}
      <div className="flex justify-start">
        <Button type="submit" size="sm" disabled={disabled || pending || !body.trim()}>
          {pending ? 'در حال ارسال…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

const CommentAuthorAvatar = ({
  photoUrl,
  size = 'md',
}: {
  photoUrl: string | null
  size?: 'md' | 'sm'
}) => (
  <div
    className={cn(
      'shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted',
      size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
    )}
  >
    {photoUrl ? (
      <img src={photoUrl} alt="" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <UserIcon className={cn('text-muted-foreground/50', size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')} />
      </div>
    )}
  </div>
)

const CommentCard = ({
  comment,
  animeId,
  onReply,
  onDelete,
  deleting,
  showReplyAction,
  compact,
}: {
  comment: AnimeComment
  animeId: string
  onReply?: () => void
  onDelete?: () => void
  deleting?: boolean
  showReplyAction?: boolean
  compact?: boolean
}) => {
  const profileHref = `/u/${encodeURIComponent(comment.author.telegram_user_id)}`
  const { like, unlike, report } = useAnimeCommentMutations(animeId)
  const likeCount = comment.like_count ?? 0
  const liked = comment.liked_by_me === true

  const onToggleLike = async () => {
    if (comment.is_deleted) return
    hapticSelection()
    try {
      if (liked) await unlike.mutateAsync(comment.id)
      else await like.mutateAsync(comment.id)
    } catch (err) {
      showAppToast(err instanceof Error ? err.message : 'پسندیدن ناموفق بود')
    }
  }

  const onReport = async () => {
    const ok = await showAppConfirm({
      title: 'گزارش نظر',
      message: 'این نظر برای بررسی مدیران علامت می‌خورد.',
      confirmLabel: 'گزارش',
      destructive: true,
    })
    if (!ok) return
    try {
      await report.mutateAsync(comment.id)
      showAppToast('گزارش ثبت شد')
    } catch (err) {
      showAppToast(err instanceof Error ? err.message : 'گزارش ناموفق بود')
    }
  }

  return (
    <CommentCardShell className={compact ? 'py-3' : undefined}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] tabular-nums',
              liked ? 'text-primary-400' : 'text-muted-foreground',
              comment.is_deleted && 'opacity-50'
            )}
            aria-label="پسندیدن"
            disabled={comment.is_deleted || like.isPending || unlike.isPending}
            onClick={() => void onToggleLike()}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{toPersianDigits(likeCount)}</span>
          </button>
          {comment.is_own && onDelete && !comment.is_deleted ? (
            <button
              type="button"
              disabled={deleting}
              onClick={() => void onDelete()}
              className="rounded-lg p-1 text-muted-foreground hover:text-red-400 disabled:opacity-50"
              aria-label="حذف نظر"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : !comment.is_own ? (
            <button
              type="button"
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
              aria-label="گزارش"
              disabled={report.isPending || comment.is_deleted}
              onClick={() => void onReport()}
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 items-start justify-end gap-2.5">
          <div className="min-w-0 text-right">
            <Link
              to={profileHref}
              className="block truncate text-sm font-bold text-foreground hover:text-primary-400"
            >
              {comment.author.display_name}
            </Link>
            <p className="mt-0.5 text-[10px] leading-5 text-muted-foreground/90 tabular-nums">
              {formatCommentTime(comment.created_at)}
            </p>
          </div>
          <Link to={profileHref} className="shrink-0" aria-label={comment.author.display_name}>
            <CommentAuthorAvatar photoUrl={comment.author.photo_url} size={compact ? 'sm' : 'md'} />
          </Link>
        </div>
      </div>

      <BidiText
        as="p"
        className={cn(
          'mt-3 whitespace-pre-wrap text-right text-sm leading-7',
          comment.is_deleted ? 'text-muted-foreground/70 italic' : 'text-foreground/95'
        )}
      >
        {comment.is_deleted ? 'این نظر حذف شده' : comment.body}
      </BidiText>

      {showReplyAction && onReply && !comment.is_deleted ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onReply}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5',
              'bg-primary-500/15 text-[11px] font-semibold text-primary-400',
              'border border-primary-400/25 active:scale-[0.98] transition-transform'
            )}
          >
            <span>پاسخ</span>
            <CornerDownLeft className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
    </CommentCardShell>
  )
}

const CommentReplies = ({ animeId, parentId }: { animeId: string; parentId: string }) => {
  const { data, isLoading } = useAnimeCommentsQuery(animeId, true, parentId, 1, 50)
  const { create, remove } = useAnimeCommentMutations(animeId)
  const [replyOpen, setReplyOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="mt-2 space-y-2 border-r-2 border-primary-400/20 pr-3 mr-1">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    )
  }

  const items = data?.items ?? []

  return (
    <div className="mt-2 space-y-2 border-r-2 border-primary-400/20 pr-3 mr-1">
      {items.map((reply) => (
        <CommentCard
          key={reply.id}
          animeId={animeId}
          comment={reply}
          compact
          deleting={remove.isPending}
          onDelete={
            reply.is_own
              ? async () => {
                  await remove.mutateAsync(reply.id)
                }
              : undefined
          }
        />
      ))}
      {replyOpen ? (
        <CommentCardShell className="py-3">
          <CommentComposer
            compact
            placeholder="پاسخ خود را بنویسید…"
            submitLabel="ارسال پاسخ"
            pending={create.isPending}
            onSubmit={async (body) => {
              await create.mutateAsync({
                anime_id: animeId,
                body,
                parent_id: parentId,
              })
              setReplyOpen(false)
            }}
          />
        </CommentCardShell>
      ) : (
        <button
          type="button"
          onClick={() => setReplyOpen(true)}
          className="text-[11px] font-medium text-primary-400"
        >
          نوشتن پاسخ
        </button>
      )}
    </div>
  )
}

const RootCommentRow = ({
  animeId,
  comment,
}: {
  animeId: string
  comment: AnimeComment
}) => {
  const { create, remove } = useAnimeCommentMutations(animeId)
  const [repliesOpen, setRepliesOpen] = useState(false)
  const [replyComposerOpen, setReplyComposerOpen] = useState(false)
  const replyCount = comment.reply_count ?? 0

  return (
    <div className="space-y-2">
      <CommentCard
        comment={comment}
        animeId={animeId}
        showReplyAction
        deleting={remove.isPending}
        onReply={() => {
          setReplyComposerOpen((v) => !v)
          if (replyCount > 0) setRepliesOpen(true)
        }}
        onDelete={
          comment.is_own
            ? async () => {
                await remove.mutateAsync(comment.id)
              }
            : undefined
        }
      />
      {replyComposerOpen ? (
        <CommentCardShell className="py-3">
          <CommentComposer
            compact
            placeholder="پاسخ به این نظر…"
            submitLabel="ارسال پاسخ"
            pending={create.isPending}
            onSubmit={async (body) => {
              await create.mutateAsync({
                anime_id: animeId,
                body,
                parent_id: comment.id,
              })
              setReplyComposerOpen(false)
              setRepliesOpen(true)
            }}
          />
        </CommentCardShell>
      ) : null}
      {replyCount > 0 ? (
        <button
          type="button"
          onClick={() => setRepliesOpen((v) => !v)}
          className={cn(
            'w-full text-right text-[11px] font-medium text-muted-foreground hover:text-foreground',
            repliesOpen && 'text-primary-400'
          )}
        >
          {repliesOpen
            ? 'پنهان کردن پاسخ‌ها'
            : `مشاهده ${toPersianDigits(replyCount)} پاسخ`}
        </button>
      ) : null}
      {repliesOpen ? <CommentReplies animeId={animeId} parentId={comment.id} /> : null}
    </div>
  )
}

export const AnimeDetailCommentsTab = ({ animeId }: { animeId: string | number }) => {
  const animeKey = String(animeId)
  const { user, isReady, inTelegram, login, register } = useAppAuth()
  const canUseComments = isReady && (inTelegram || Boolean(user))
  const { data, isLoading, isError, refetch } = useAnimeCommentsQuery(
    animeKey,
    canUseComments
  )
  const { create } = useAnimeCommentMutations(animeKey)

  if (!isReady) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted/50" />
        ))}
      </div>
    )
  }

  if (!inTelegram && !user) {
    return (
      <div className="pt-2">
        <ProfileAuthPanel login={login} register={register} layout="card" />
        <p className="mt-4 text-center text-xs text-muted-foreground leading-6">
          برای دیدن و نوشتن نظر باید وارد حساب شیوری شوی.
        </p>
      </div>
    )
  }

  const total = data?.total ?? 0

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">نظرات</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {isLoading ? '…' : `${toPersianDigits(total)} نظر`}
        </span>
      </div>

      <CommentCardShell>
        <CommentComposer
          placeholder="نظر خود را درباره این انیمه بنویسید…"
          submitLabel="ثبت نظر"
          pending={create.isPending}
          disabled={!canUseComments}
          onSubmit={async (body) => {
            await create.mutateAsync({ anime_id: animeKey, body })
          }}
        />
      </CommentCardShell>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <ExploreEmptyState
          title="بارگذاری نظرات ناموفق بود"
          actionLabel="تلاش مجدد"
          onAction={() => void refetch()}
        />
      ) : null}

      {!isLoading && !isError && (data?.items.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-10 px-6 text-center">
          <Message01Icon className="mx-auto h-10 w-10 text-muted-foreground/35" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">هنوز نظری ثبت نشده. اولین نفر باش!</p>
        </div>
      ) : null}

      {!isLoading && !isError && (data?.items.length ?? 0) > 0 ? (
        <div className="space-y-3">
          {data!.items.map((comment) => (
            <RootCommentRow key={comment.id} animeId={animeKey} comment={comment} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
