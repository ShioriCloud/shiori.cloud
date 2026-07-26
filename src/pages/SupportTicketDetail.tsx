import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CustomerServiceIcon } from 'hugeicons-react'
import { BidiText } from '@/components/BidiText'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { Button } from '@/components/ui/button'
import { useSupportTicket } from '@/hooks/useSupportTickets'
import {
  SUPPORT_TICKET_CATEGORY_LABELS,
  SUPPORT_TICKET_STATUS_LABELS,
} from '@/types/supportTickets'
import { cn } from '@/lib/utils'

const formatTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })
}

const SupportTicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { ticket, isLoading, isError, refetch, reply, replying } = useSupportTicket(ticketId)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onReply = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (body.trim().length < 1) return
    try {
      await reply(body.trim())
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال پاسخ ناموفق بود')
    }
  }

  return (
    <div className="pb-24">
      <div className="sticky top-[var(--app-header-offset)] z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <CustomerServiceIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-foreground">
              {ticket?.subject ?? 'جزئیات تیکت'}
            </h1>
            {ticket ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {SUPPORT_TICKET_CATEGORY_LABELS[ticket.category]} ·{' '}
                {SUPPORT_TICKET_STATUS_LABELS[ticket.status]}
              </p>
            ) : null}
          </div>
          <Link
            to="/support"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            بازگشت
          </Link>
        </div>
      </div>

      <div className="space-y-3 px-4 pt-4">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted/70" />
            ))}
          </div>
        ) : null}

        {isError || (!isLoading && !ticket) ? (
          <MyListCompactCard className="space-y-3 p-4">
            <p className="text-sm text-red-400">تیکت پیدا نشد</p>
            <Button type="button" variant="outline" className="h-10" onClick={() => void refetch()}>
              تلاش مجدد
            </Button>
          </MyListCompactCard>
        ) : null}

        {ticket
          ? ticket.messages.map((message) => {
              const isStaff = message.author_role === 'staff'
              return (
                <div
                  key={message.id}
                  className={cn('flex', isStaff ? 'justify-start' : 'justify-end')}
                >
                  <MyListCompactCard
                    className={cn(
                      'max-w-[90%] p-3',
                      isStaff && 'border-primary-400/25 bg-primary-400/10'
                    )}
                  >
                    <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                      {isStaff ? 'پشتیبانی' : 'شما'} · {formatTime(message.created_at)}
                    </p>
                    <BidiText as="p" className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {message.body}
                    </BidiText>
                  </MyListCompactCard>
                </div>
              )
            })
          : null}

        {ticket && ticket.status !== 'closed' ? (
          <MyListCompactCard className="p-3">
            <form className="space-y-2" onSubmit={(e) => void onReply(e)}>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={4000}
                placeholder="پاسخ خود را بنویس…"
                className={cn(
                  'w-full resize-none rounded-lg border border-border/50 bg-muted/25 px-3 py-2.5',
                  'text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70',
                  'focus:border-primary-400/40'
                )}
              />
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
              <Button type="submit" className="h-11 w-full" disabled={replying || !body.trim()}>
                {replying ? 'در حال ارسال…' : 'ارسال پاسخ'}
              </Button>
            </form>
          </MyListCompactCard>
        ) : null}

        {ticket?.status === 'closed' ? (
          <p className="px-1 text-center text-xs text-muted-foreground">این تیکت بسته شده است.</p>
        ) : null}
      </div>
    </div>
  )
}

export default SupportTicketDetail
