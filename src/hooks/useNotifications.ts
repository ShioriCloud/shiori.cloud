import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from './useAppAuth'
import {
  getMyNotificationPreferences,
  getMyNotifications,
  markAllMyNotificationsRead,
  markMyNotificationRead,
  updateMyNotificationPreferences,
  type NotificationPreferences,
} from '../services/userDataSource'
import { queryKeys } from './queries/keys'

export const useNotifications = () => {
  const { user, isReady, inTelegram } = useAppAuth()
  const telegramUserId = user?.id
  const queryClient = useQueryClient()

  const enabled = isReady && inTelegram && typeof telegramUserId === 'number'
  const prefsKey = queryKeys.notificationPreferences(telegramUserId ?? 0)

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(telegramUserId ?? 0),
    queryFn: getMyNotifications,
    enabled,
    staleTime: 20_000,
  })

  const preferencesQuery = useQuery({
    queryKey: prefsKey,
    queryFn: getMyNotificationPreferences,
    enabled,
    staleTime: 60_000,
  })

  const markReadMutation = useMutation({
    mutationFn: markMyNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(telegramUserId ?? 0) })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllMyNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(telegramUserId ?? 0) })
    },
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      updateMyNotificationPreferences(prefs),
    onMutate: async (prefs) => {
      await queryClient.cancelQueries({ queryKey: prefsKey })
      const previous = queryClient.getQueryData<NotificationPreferences>(prefsKey)
      const base: NotificationPreferences = previous ?? {
        notify_new_episode: true,
        notify_telegram_dm: true,
      }
      queryClient.setQueryData<NotificationPreferences>(prefsKey, {
        ...base,
        ...prefs,
      })
      return { previous }
    },
    onError: (_err, _prefs, context) => {
      if (context?.previous) {
        queryClient.setQueryData(prefsKey, context.previous)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(prefsKey, data)
    },
  })

  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((n) => !n.is_read).length
  const pendingPrefs = updatePreferencesMutation.isPending
    ? updatePreferencesMutation.variables
    : undefined

  return {
    notifications,
    unreadCount,
    preferences: preferencesQuery.data,
    isLoading: notificationsQuery.isLoading,
    preferencesLoading: preferencesQuery.isLoading,
    refetch: notificationsQuery.refetch,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    updatingPreferences: updatePreferencesMutation.isPending,
    updatingNotifyNewEpisode: Boolean(
      pendingPrefs && Object.prototype.hasOwnProperty.call(pendingPrefs, 'notify_new_episode')
    ),
    updatingNotifyTelegramDm: Boolean(
      pendingPrefs && Object.prototype.hasOwnProperty.call(pendingPrefs, 'notify_telegram_dm')
    ),
  }
}
