import { RequireAppAuth } from '@/components/RequireAppAuth'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CustomerServiceIcon, Add01Icon } from 'hugeicons-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import {
  ExploreOptionButton,
  SHIORI_PRIMARY_BUTTON_CLASS,
  SHIORI_SECONDARY_BUTTON_CLASS,
} from '@/components/explore/ExploreUi'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useCreateSupportTicket, useSupportTickets } from '@/hooks/useSupportTickets'
import {
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_CATEGORY_LABELS,
  SUPPORT_TICKET_STATUS_LABELS,
  type SupportTicketCategory,
} from '@/types/supportTickets'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'

const isSupportCategory = (value: string | null): value is SupportTicketCategory =>
  Boolean(value && (SUPPORT_TICKET_CATEGORIES as string[]).includes(value))

const formatTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })
}

const statusTone = (status: string) => {
  if (status === 'answered')
    return 'border-emerald-500/35 bg-emerald-500/15 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-200'
  if (status === 'closed') return 'border-border bg-muted/80 text-muted-foreground'
  return 'border-primary-400/40 bg-primary-400/15 text-primary-700 dark:border-primary-400/35 dark:bg-primary-400/15 dark:text-primary-200'
}

const SupportPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { inTelegram, user } = useAppAuth()
  const { tickets, isLoading, isError, refetch } = useSupportTickets()
  const createMutation = useCreateSupportTicket()

  const [composeOpen, setComposeOpen] = useState(false)
  const [category, setCategory] = useState<SupportTicketCategory>('bug_report')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const composePrefillDone = useRef(false)
  const [pendingComposeOpen, setPendingComposeOpen] = useState(false)

  const canUse = inTelegram && Boolean(user?.id)

  useEffect(() => {
    if (composePrefillDone.current) return
    if (searchParams.get('compose') !== '1') return
    composePrefillDone.current = true

    const nextCategory = searchParams.get('category')
    if (isSupportCategory(nextCategory)) setCategory(nextCategory)

    const nextSubject = searchParams.get('subject')?.trim()
    if (nextSubject) setSubject(nextSubject)

    const nextBody = searchParams.get('body')?.trim()
    if (nextBody) setBody(nextBody)

    setPendingComposeOpen(true)

    const cleaned = new URLSearchParams(searchParams)
    cleaned.delete('compose')
    cleaned.delete('category')
    cleaned.delete('subject')
    cleaned.delete('body')
    setSearchParams(cleaned, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!canUse || !pendingComposeOpen) return
    setComposeOpen(true)
    setPendingComposeOpen(false)
  }, [canUse, pendingComposeOpen])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (subject.trim().length < 3) {
      setFormError('عنوان باید حداقل ۳ کاراکتر باشد')
      return
    }
    if (body.trim().length < 10) {
      setFormError('متن پیام باید حداقل ۱۰ کاراکتر باشد')
      return
    }
    try {
      const ticket = await createMutation.mutateAsync({
        category,
        subject: subject.trim(),
        body: body.trim(),
      })
      setComposeOpen(false)
      setSubject('')
      setBody('')
      navigate(`/support/${ticket.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'ارسال تیکت ناموفق بود')
    }
  }

  return (
    <div className="pb-24">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <CustomerServiceIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <h1 className="truncate text-lg font-semibold text-foreground">پشتیبانی</h1>
          </div>
          {canUse ? (
            <Button
              type="button"
              size="sm"
              className={cn('h-9 shrink-0 gap-1 px-3 text-xs font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
              onClick={() => {
                hapticSelection()
                setComposeOpen((v) => !v)
              }}
            >
              <Add01Icon className="h-3.5 w-3.5" />
              تیکت جدید
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        {!canUse ? (
          <MyListCompactCard className="p-4 text-sm leading-7 text-muted-foreground">
            برای ارسال تیکت باید از داخل تلگرام وارد مینی‌اپ شوی.
          </MyListCompactCard>
        ) : null}

        {composeOpen && canUse ? (
          <MyListCompactCard className="p-3">
            <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  دسته‌بندی
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORT_TICKET_CATEGORIES.map((key) => (
                    <ExploreOptionButton
                      key={key}
                      active={category === key}
                      onClick={() => setCategory(key)}
                      className="min-h-10 py-2 text-xs"
                    >
                      {SUPPORT_TICKET_CATEGORY_LABELS[key]}
                    </ExploreOptionButton>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="ticket-subject" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  عنوان
                </label>
                <input
                  id="ticket-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={120}
                  placeholder="خلاصه مشکل یا درخواست"
                  className="ui-elevated h-11 w-full rounded-lg px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="ticket-body" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  پیام
                </label>
                <textarea
                  id="ticket-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={4000}
                  rows={5}
                  placeholder="جزئیات را بنویس…"
                  className="ui-elevated w-full resize-none rounded-lg px-3 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {formError ? (
                <p className="text-xs text-red-400">{formError}</p>
              ) : null}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={cn('h-11 flex-1 font-semibold', SHIORI_SECONDARY_BUTTON_CLASS)}
                  onClick={() => setComposeOpen(false)}
                  disabled={createMutation.isPending}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  className={cn('h-11 flex-1 font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'در حال ارسال…' : 'ارسال تیکت'}
                </Button>
              </div>
            </form>
          </MyListCompactCard>
        ) : null}

        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg surface-skeuo" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <MyListCompactCard className="space-y-3 p-4">
            <p className="text-sm text-red-400">خطا در بارگذاری تیکت‌ها</p>
            <Button type="button" variant="outline" className="h-10" onClick={() => void refetch()}>
              تلاش مجدد
            </Button>
          </MyListCompactCard>
        ) : null}

        {!isLoading && !isError && canUse && tickets.length === 0 && !composeOpen ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center text-muted-foreground">
            <CustomerServiceIcon className="mb-1 h-12 w-12" />
            <p className="font-medium text-foreground">هنوز تیکتی نداری</p>
            <p className="text-sm leading-6">
              اگر مشکلی دیدی یا پیشنهادی داری، از دکمه «تیکت جدید» بفرست.
            </p>
          </div>
        ) : null}

        {!isLoading && !isError && tickets.length > 0 ? (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <Link key={ticket.id} to={`/support/${ticket.id}`} className="block">
                <MyListCompactCard className="p-3 active:scale-[0.995]">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="min-w-0 flex-1 text-sm font-semibold leading-6 text-foreground line-clamp-2 text-end">
                      {ticket.subject}
                    </h2>
                    <span
                      className={cn(
                        'inline-flex shrink-0 rounded-md border px-1.5 py-1 text-[10px] font-medium',
                        statusTone(ticket.status)
                      )}
                    >
                      {SUPPORT_TICKET_STATUS_LABELS[ticket.status]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {SUPPORT_TICKET_CATEGORY_LABELS[ticket.category]} · {formatTime(ticket.updated_at)}
                  </p>
                  {ticket.last_message_preview ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground/90 text-end">
                      {ticket.last_message_preview}
                    </p>
                  ) : null}
                </MyListCompactCard>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function Support() {
  return (
    <RequireAppAuth>
      <SupportPage />
    </RequireAppAuth>
  )
}
