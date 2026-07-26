import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CustomerServiceIcon, Add01Icon } from 'hugeicons-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useCreateSupportTicket, useSupportTickets } from '@/hooks/useSupportTickets'
import {
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_CATEGORY_LABELS,
  SUPPORT_TICKET_STATUS_LABELS,
  type SupportTicketCategory,
} from '@/types/supportTickets'
import { cn } from '@/lib/utils'

const formatTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })
}

const statusTone = (status: string) => {
  if (status === 'answered') return 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
  if (status === 'closed') return 'border-border/50 bg-muted/40 text-muted-foreground'
  return 'border-primary-400/35 bg-primary-400/15 text-primary-200'
}

const Support = () => {
  const navigate = useNavigate()
  const { inTelegram, user } = useAppAuth()
  const { tickets, isLoading, isError, refetch } = useSupportTickets()
  const createMutation = useCreateSupportTicket()

  const [composeOpen, setComposeOpen] = useState(false)
  const [category, setCategory] = useState<SupportTicketCategory>('bug_report')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const canUse = inTelegram && Boolean(user?.id)

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
            <button
              type="button"
              onClick={() => setComposeOpen((v) => !v)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border px-2.5',
                'border-border/50 bg-muted/35 text-xs font-medium text-muted-foreground',
                'transition-colors hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <Add01Icon className="h-3.5 w-3.5" />
              تیکت جدید
            </button>
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
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORT_TICKET_CATEGORIES.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={cn(
                        'rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors',
                        category === key
                          ? 'border-primary-400/40 bg-primary-400/15 text-primary-200'
                          : 'border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      {SUPPORT_TICKET_CATEGORY_LABELS[key]}
                    </button>
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
                  className={cn(
                    'h-11 w-full rounded-lg border border-border/50 bg-muted/25 px-3',
                    'text-sm text-foreground outline-none placeholder:text-muted-foreground/70',
                    'focus:border-primary-400/40'
                  )}
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
                  className={cn(
                    'w-full resize-none rounded-lg border border-border/50 bg-muted/25 px-3 py-2.5',
                    'text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70',
                    'focus:border-primary-400/40'
                  )}
                />
              </div>

              {formError ? (
                <p className="text-xs text-red-400">{formError}</p>
              ) : null}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => setComposeOpen(false)}
                  disabled={createMutation.isPending}
                >
                  انصراف
                </Button>
                <Button type="submit" className="h-11 flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'در حال ارسال…' : 'ارسال تیکت'}
                </Button>
              </div>
            </form>
          </MyListCompactCard>
        ) : null}

        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-muted/70" />
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

export default Support
