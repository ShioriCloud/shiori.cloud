export type SupportTicketCategory =
  | 'bug_report'
  | 'app_improvement'
  | 'feature_request'
  | 'account_issue'
  | 'other'

export type SupportTicketStatus = 'open' | 'answered' | 'closed'

export const SUPPORT_TICKET_CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  bug_report: 'گزارش خطا',
  app_improvement: 'بهبود اپلیکیشن',
  feature_request: 'درخواست قابلیت جدید',
  account_issue: 'مشکل حساب کاربری',
  other: 'سایر',
}

export const SUPPORT_TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: 'باز',
  answered: 'پاسخ داده شده',
  closed: 'بسته',
}

export const SUPPORT_TICKET_CATEGORIES = Object.keys(
  SUPPORT_TICKET_CATEGORY_LABELS
) as SupportTicketCategory[]

export type SupportTicketMessage = {
  id: string
  author_role: 'user' | 'staff'
  author_telegram_user_id: string
  body: string
  created_at: string
}

export type SupportTicketListItem = {
  id: string
  category: SupportTicketCategory
  subject: string
  status: SupportTicketStatus
  created_at: string
  updated_at: string
  last_message_preview: string | null
  message_count: number
}

export type SupportTicketDetail = SupportTicketListItem & {
  messages: SupportTicketMessage[]
}

export type CreateSupportTicketInput = {
  category: SupportTicketCategory
  subject: string
  body: string
}
