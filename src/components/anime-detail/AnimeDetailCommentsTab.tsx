import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Message01Icon, UserIcon } from 'hugeicons-react'
import { BidiText } from '@/components/BidiText'
import { ProfileAuthPanel } from '@/components/ProfileAuthPanel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import { useAppAuth } from '@/hooks/useAppAuth'
import {
  useAnimeCommentMutations,
  useAnimeCommentsQuery,
} from '@/hooks/useAnimeComments'
import type { AnimeComment } from '@/services/animeComments'
import { hapticSelection } from '@/lib/telegramHaptics'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const formatCommentTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })
}

const CommentComposer = ({
  placeholder,
  submitLabel,
  disabled,
  pending,
  onSubmit,
}: {
  placeholder: string
  submitLabel: string
  disabled?: boolean
  pending?: boolean
  onSubmit: (body: string) => Promise<void>
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
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || pending}
        maxLength={2000}
        rows={3}
        className="min-h-[5.5rem] resize-none text-sm leading-6"
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={disabled || pending || !body.trim()}>
          {pending ? 'در حال ارسال…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

const CommentAuthorAvatar = ({ photoUrl }: { photoUrl: string | null }) => (
  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
    {photoUrl ? (
      <img src={photoUrl} alt="" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <UserIcon className="h-4 w-4 text-muted-foreground/50" />
      </div>
    )}
  </div>
)

const CommentBody = ({
  comment,
  onReply,
  onDelete,
  deleting,
  showReplyAction,
}: {
  comment: AnimeComment
  onReply?: () => void
  onDelete?: () => void
  deleting?: boolean
  showReplyAction?: boolean
}) => {
  const username = comment.author.username ? `@${comment.author.username}` : null

  return (
    <div className="flex gap-2.5">
      <Link
        to={`/u/${encodeURIComponent(comment.author.telegram_user_id)}`}
        className="shrink-0"
        aria-label={comment.author.display_name}
      >
        <CommentAuthorAvatar photoUrl={comment.author.photo_url} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <Link
            to={`/u/${encodeURIComponent(comment.author.telegram_user_id)}`}
            className="text-sm font-semibold text-foreground hover:text-primary-400"
          >
            {comment.author.display_name}
          </Link>
          {username ? (
            <span className="text-[11px] text-muted-foreground">{username}</span>
          ) : null}
          <span className="text-[10px] text-muted-foreground/80">
            {formatCommentTime(comment.created_at)}
          </span>
        </div>
        <BidiText as="p" className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
          {comment.body}
        </BidiText>
        <div className="mt-2 flex flex-wrap gap-2">
          {showReplyAction && onReply ? (
            <button
              type="button"
              onClick={onReply}
              className="text-[11px] font-medium text-primary-400 hover:underline"
            >
              پاسخ
            </button>
          ) : null}
          {comment.is_own && onDelete ? (
            <button
              type="button"
              disabled={deleting}
              onClick={() => void onDelete()}
              className="text-[11px] font-medium text-muted-foreground hover:text-red-400 disabled:opacity-50"
            >
              {deleting ? 'حذف…' : 'حذف'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const CommentReplies = ({ animeId, parentId }: { animeId: string; parentId: string }) => {
  const { data, isLoading } = useAnimeCommentsQuery(animeId, true, parentId, 1, 50)
  const { create, remove } = useAnimeCommentMutations(animeId)
  const [replyOpen, setReplyOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="mr-4 mt-2 space-y-2 border-r-2 border-border/40 pr-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/60" />
        ))}
      </div>
    )
  }

  const items = data?.items ?? []

  return (
    <div className="mr-4 mt-3 space-y-3 border-r-2 border-border/40 pr-3">
      {items.map((reply) => (
        <CommentBody
          key={reply.id}
          comment={reply}
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
        <CommentComposer
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
    <MyListCompactCard className="p-3.5">
      <CommentBody
        comment={comment}
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
        <div className="mt-3 border-t border-border/40 pt-3">
          <CommentComposer
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
        </div>
      ) : null}
      {replyCount > 0 ? (
        <button
          type="button"
          onClick={() => setRepliesOpen((v) => !v)}
          className={cn(
            'mt-2 text-[11px] font-medium text-muted-foreground hover:text-foreground',
            repliesOpen && 'text-primary-400'
          )}
        >
          {repliesOpen
            ? 'پنهان کردن پاسخ‌ها'
            : `مشاهده ${toPersianDigits(replyCount)} پاسخ`}
        </button>
      ) : null}
      {repliesOpen ? <CommentReplies animeId={animeId} parentId={comment.id} /> : null}
    </MyListCompactCard>
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
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/60" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">نظرات</h2>
        <span className="text-xs text-muted-foreground">
          {isLoading ? '…' : `${toPersianDigits(total)} نظر`}
        </span>
      </div>

      <MyListCompactCard className="p-3.5">
        <CommentComposer
          placeholder="نظر خود را درباره این انیمه بنویسید…"
          submitLabel="ثبت نظر"
          pending={create.isPending}
          disabled={!canUseComments}
          onSubmit={async (body) => {
            await create.mutateAsync({ anime_id: animeKey, body })
          }}
        />
      </MyListCompactCard>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/60" />
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
        <div className="space-y-2">
          {data!.items.map((comment) => (
            <RootCommentRow key={comment.id} animeId={animeKey} comment={comment} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
