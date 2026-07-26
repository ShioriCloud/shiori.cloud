import { shioriFetch } from '../lib/shioriApi'
import type {
  CreateSupportTicketInput,
  SupportTicketDetail,
  SupportTicketListItem,
} from '../types/supportTickets'

export const listMySupportTickets = async (): Promise<SupportTicketListItem[]> =>
  shioriFetch<SupportTicketListItem[]>('/support-tickets')

export const getMySupportTicket = async (id: string): Promise<SupportTicketDetail> =>
  shioriFetch<SupportTicketDetail>(`/support-tickets/${encodeURIComponent(id)}`)

export const createMySupportTicket = async (
  input: CreateSupportTicketInput
): Promise<SupportTicketDetail> =>
  shioriFetch<SupportTicketDetail>('/support-tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

export const replyMySupportTicket = async (
  id: string,
  body: string
): Promise<SupportTicketDetail> =>
  shioriFetch<SupportTicketDetail>(
    `/support-tickets/${encodeURIComponent(id)}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    }
  )
