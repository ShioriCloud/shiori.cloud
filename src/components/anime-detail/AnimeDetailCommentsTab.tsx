import { FormEvent, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Message01Icon } from 'hugeicons-react'
import { ChevronDown, CornerDownLeft, Flag, MessageSquare, ThumbsUp, Trash2 } from 'lucide-react'
import { BidiText } from '@/components/BidiText'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { SocialListSkeleton } from '@/components/profile/social/SocialListSkeleton'
import { SocialUserAvatar } from '@/components/profile/social/SocialUserAvatar'
import { SOCIAL_INSET_SHELL_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { useAppAuth } from '@/hooks/useAppAuth'
import {
  useAnimeCommentMutations,
  useAnimeCommentsQuery,
} from '@/hooks/useAnimeComments'
import type { AnimeComment } from '@/services/animeComments'
import { formatRelativeTimeFa } from '@/lib/myListUtils'
import { hapticSelection } from '@/lib/telegramHaptics'
import { showAppConfirm, showAppToast } from '@/store/appFeedbackStore'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const replyContextSnippet = (body: string, maxLen = 80): string | null => {
  const flat = body.replace(/\s+/g, ' ').trim()
  if (!flat) return null
  if (flat.length <= maxLen) return flat
  return `${flat.slice(0, maxLen - 1)}…`
}

const CommentCardShell = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <article dir="rtl" className={cn(SOCIAL_INSET_SHELL_CLASS, className)}>
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

const commentActionPill = (active?: boolean) =>
  cn(
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
    'text-[11px] font-semibold active:scale-[0.98] transition-transform',
    active
      ? 'border-primary-400/35 bg-primary-500/15 text-primary-400'
      : 'border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground'
  )

const CommentCard = ({
  comment,
  animeId,
  onReply,
  onDelete,
  deleting,
  showReplyAction,
  replyCount,
  repliesOpen,
  onToggleReplies,
  compact,
}: {
  comment: AnimeComment
  animeId: string
  onReply?: () => void
  onDelete?: () => void
  deleting?: boolean
  showReplyAction?: boolean
  replyCount?: number
  repliesOpen?: boolean
  onToggleReplies?: () => void
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

  const repliesTotal = replyCount ?? 0

  return (
    <CommentCardShell
      className={cn(compact && 'border-border/40 bg-muted/15 py-3 dark:bg-muted/10')}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <Link to={profileHref} className="shrink-0" aria-label={comment.author.display_name}>
            <SocialUserAvatar
              photoUrl={comment.author.photo_url}
              displayName={comment.author.display_name}
              size={compact ? 'sm' : 'md'}
              className="ring-0"
            />
          </Link>
          <div className="min-w-0 flex-1 text-right">
            <Link
              to={profileHref}
              className="block truncate text-sm font-bold text-foreground hover:text-primary-400"
            >
              {comment.author.display_name}
            </Link>
            <p className="mt-0.5 text-[10px] leading-5 text-muted-foreground/90 tabular-nums">
              {formatRelativeTimeFa(comment.created_at)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
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
      </div>

      {comment.reply_to && !comment.is_deleted ? (
        <p className="mt-2 text-right text-[11px] text-muted-foreground">
          به{' '}
          <span className="font-semibold text-primary-400/95">
            {comment.reply_to.author.display_name}
          </span>
        </p>
      ) : null}

      <BidiText
        as="p"
        className={cn(
          'mt-3 whitespace-pre-wrap text-right text-sm leading-7',
          comment.is_deleted ? 'text-muted-foreground/70 italic' : 'text-foreground/95'
        )}
      >
        {comment.is_deleted ? 'این نظر حذف شده' : comment.body}
      </BidiText>

      {!comment.is_deleted &&
      ((showReplyAction && onReply) || (repliesTotal > 0 && onToggleReplies)) ? (
        <div className="mt-3 flex flex-wrap items-center justify-start gap-2">
          {showReplyAction && onReply ? (
            <button type="button" onClick={onReply} className={commentActionPill(true)}>
              <span>پاسخ</span>
              <CornerDownLeft className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
          {repliesTotal > 0 && onToggleReplies ? (
            <button
              type="button"
              onClick={onToggleReplies}
              className={commentActionPill(repliesOpen)}
              aria-expanded={repliesOpen}
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              <span>
                {repliesOpen
                  ? 'پنهان کردن پاسخ‌ها'
                  : `${toPersianDigits(repliesTotal)} پاسخ`}
              </span>
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', repliesOpen && 'rotate-180')}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      ) : null}
    </CommentCardShell>
  )
}

const CommentReplies = ({
  animeId,
  parentId,
  rootAuthorName,
  rootCommentSnippet,
}: {
  animeId: string
  parentId: string
  rootAuthorName: string
  rootCommentSnippet: string | null
}) => {
  const { data, isLoading } = useAnimeCommentsQuery(animeId, true, parentId, 1, 50)
  const { create, remove } = useAnimeCommentMutations(animeId)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)

  const openReplyComposer = (target?: AnimeComment) => {
    setReplyOpen(true)
    if (target) {
      setReplyTo({ id: target.id, name: target.author.display_name })
    } else {
      setReplyTo(null)
    }
  }

  if (isLoading) {
    return (
      <div className="mt-2 border-r-2 border-primary-400/20 pr-3 mr-1">
        <SocialListSkeleton rows={2} />
      </div>
    )
  }

  const items = data?.items ?? []

  return (
    <div className="mr-1 mt-1 space-y-2 border-r-2 border-primary-400/30 pr-3">
      <div
        className={cn(
          'rounded-xl border border-border/40 bg-muted/25 px-2.5 py-2 text-right',
          'dark:bg-muted/15'
        )}
      >
        <p className="text-[11px] leading-5 text-muted-foreground">
          در پاسخ به{' '}
          <span className="font-semibold text-foreground">{rootAuthorName}</span>
        </p>
        {rootCommentSnippet ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground/85">
            «{rootCommentSnippet}»
          </p>
        ) : null}
      </div>
      {items.map((reply) => (
        <CommentCard
          key={reply.id}
          animeId={animeId}
          comment={reply}
          compact
          showReplyAction
          onReply={() => openReplyComposer(reply)}
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
          {replyTo ? (
            <p className="mb-2 text-right text-[11px] text-muted-foreground">
              در پاسخ به{' '}
              <span className="font-semibold text-foreground">{replyTo.name}</span>
            </p>
          ) : null}
          <CommentComposer
            compact
            placeholder={
              replyTo ? `پاسخ به ${replyTo.name}…` : 'پاسخ خود را بنویسید…'
            }
            submitLabel="ارسال پاسخ"
            pending={create.isPending}
            onSubmit={async (body) => {
              await create.mutateAsync({
                anime_id: animeId,
                body,
                parent_id: parentId,
                reply_to_comment_id: replyTo?.id,
              })
              setReplyOpen(false)
              setReplyTo(null)
            }}
          />
        </CommentCardShell>
      ) : (
        <button
          type="button"
          onClick={() => openReplyComposer()}
          className={commentActionPill(false)}
        >
          <span>نوشتن پاسخ</span>
          <CornerDownLeft className="h-3.5 w-3.5" aria-hidden />
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
        replyCount={replyCount}
        repliesOpen={repliesOpen}
        onToggleReplies={() => setRepliesOpen((v) => !v)}
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
      {repliesOpen ? (
        <CommentReplies
          animeId={animeId}
          parentId={comment.id}
          rootAuthorName={comment.author.display_name}
          rootCommentSnippet={
            comment.is_deleted ? null : replyContextSnippet(comment.body)
          }
        />
      ) : null}
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
    return <SocialListSkeleton rows={3} />
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

      {isLoading ? <SocialListSkeleton rows={3} /> : null}

      {isError ? (
        <ExploreEmptyState
          title="بارگذاری نظرات ناموفق بود"
          actionLabel="تلاش مجدد"
          onAction={() => void refetch()}
        />
      ) : null}

      {!isLoading && !isError && (data?.items.length ?? 0) === 0 ? (
        <div className={cn(SOCIAL_SURFACE_CLASS, 'border-dashed py-10 px-6 text-center')}>
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
