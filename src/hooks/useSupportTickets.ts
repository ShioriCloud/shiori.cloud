import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from './useAppAuth'
import { queryKeys } from './queries/keys'
import {
  createMySupportTicket,
  getMySupportTicket,
  listMySupportTickets,
  replyMySupportTicket,
} from '../services/shioriSupportTickets'
import type { CreateSupportTicketInput } from '../types/supportTickets'

export const useSupportTickets = () => {
  const { user, isReady, inTelegram } = useAppAuth()
  const telegramUserId = user?.id ?? 0
  const enabled = isReady && inTelegram && Boolean(user?.id)

  const listQuery = useQuery({
    queryKey: queryKeys.supportTickets(telegramUserId),
    queryFn: listMySupportTickets,
    enabled,
  })

  return {
    tickets: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
  }
}

export const useSupportTicket = (ticketId: string | undefined) => {
  const { user, isReady, inTelegram } = useAppAuth()
  const telegramUserId = user?.id ?? 0
  const enabled = isReady && inTelegram && Boolean(user?.id) && Boolean(ticketId)
  const queryClient = useQueryClient()

  const detailQuery = useQuery({
    queryKey: queryKeys.supportTicket(telegramUserId, ticketId ?? ''),
    queryFn: () => getMySupportTicket(ticketId!),
    enabled,
  })

  const replyMutation = useMutation({
    mutationFn: (body: string) => replyMySupportTicket(ticketId!, body),
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.supportTicket(telegramUserId, ticketId!),
        data
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.supportTickets(telegramUserId),
      })
    },
  })

  return {
    ticket: detailQuery.data ?? null,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    refetch: detailQuery.refetch,
    reply: replyMutation.mutateAsync,
    replying: replyMutation.isPending,
  }
}

export const useCreateSupportTicket = () => {
  const { user } = useAppAuth()
  const telegramUserId = user?.id ?? 0
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSupportTicketInput) => createMySupportTicket(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.supportTickets(telegramUserId),
      })
    },
  })
}
