import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from './useAppAuth'
import {
  disableMyAiringReminder,
  enableMyAiringReminder,
  getMyAiringReminders,
  syncMyAiringReminders,
} from '../services/userDataSource'
import { useAiringReminderStore } from '../store/airingReminderStore'
import { queryKeys } from './queries/keys'

const LOCAL_MIGRATED_KEY = 'shiori_airing_reminders_migrated_v1'

/**
 * Server-backed airing reminders. One-shot migrates legacy Zustand localStorage ids.
 */
export const useAiringReminders = () => {
  const { user, isReady, inTelegram } = useAppAuth()
  const telegramUserId = user?.id
  const queryClient = useQueryClient()
  const enabled = isReady && inTelegram && typeof telegramUserId === 'number'
  const listKey = queryKeys.airingReminders(telegramUserId ?? 0)
  const migratedRef = useRef(false)

  const remindersQuery = useQuery({
    queryKey: listKey,
    queryFn: getMyAiringReminders,
    enabled,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!enabled || migratedRef.current) return
    if (typeof window === 'undefined') return
    try {
      if (localStorage.getItem(LOCAL_MIGRATED_KEY) === '1') {
        migratedRef.current = true
        return
      }
    } catch {
      // ignore
    }

    const localIds = useAiringReminderStore.getState().reminderAnimeIds ?? []
    migratedRef.current = true

    void (async () => {
      try {
        if (localIds.length > 0) {
          const merged = await syncMyAiringReminders(localIds.map(String))
          queryClient.setQueryData(listKey, merged)
        }
        localStorage.setItem(LOCAL_MIGRATED_KEY, '1')
        useAiringReminderStore.setState({ reminderAnimeIds: [] })
      } catch {
        migratedRef.current = false
      }
    })()
  }, [enabled, listKey, queryClient])

  const enableMutation = useMutation({
    mutationFn: (animeId: string | number) => enableMyAiringReminder(animeId),
    onMutate: async (animeId) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<string[]>(listKey) ?? []
      const key = String(animeId)
      if (!previous.some((id) => String(id) === key)) {
        queryClient.setQueryData<string[]>(listKey, [...previous, key])
      }
      return { previous }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(listKey, ctx.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listKey })
    },
  })

  const disableMutation = useMutation({
    mutationFn: (animeId: string | number) => disableMyAiringReminder(animeId),
    onMutate: async (animeId) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<string[]>(listKey) ?? []
      const key = String(animeId)
      queryClient.setQueryData<string[]>(
        listKey,
        previous.filter((id) => String(id) !== key)
      )
      return { previous }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(listKey, ctx.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listKey })
    },
  })

  const animeIds = remindersQuery.data ?? []
  const isReminderOn = (animeId: string | number) =>
    animeIds.some((id) => String(id) === String(animeId))

  const toggleReminder = async (animeId: string | number): Promise<boolean> => {
    const nowOn = !isReminderOn(animeId)
    if (nowOn) await enableMutation.mutateAsync(animeId)
    else await disableMutation.mutateAsync(animeId)
    return nowOn
  }

  return {
    animeIds,
    isReminderOn,
    toggleReminder,
    isLoading: remindersQuery.isLoading,
    isToggling: enableMutation.isPending || disableMutation.isPending,
  }
}
