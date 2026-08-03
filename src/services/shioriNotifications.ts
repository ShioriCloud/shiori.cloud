import { shioriFetch } from '../lib/shioriApi'
import type {
  NotificationPreferences,
  UserNotificationRow,
} from '../types/notifications'

export const getMyNotifications = async (): Promise<UserNotificationRow[]> =>
  shioriFetch<UserNotificationRow[]>('/anime-notifications')

export const markMyNotificationRead = async (notificationId: string): Promise<void> => {
  await shioriFetch(`/anime-notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
  })
}

export const markAllMyNotificationsRead = async (): Promise<void> => {
  await shioriFetch('/anime-notifications/read-all', { method: 'POST' })
}

export const getMyNotificationPreferences = async (): Promise<NotificationPreferences> =>
  shioriFetch<NotificationPreferences>('/anime-notifications/preferences')

export const updateMyNotificationPreferences = async (
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> =>
  shioriFetch<NotificationPreferences>('/anime-notifications/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  })

export const getMyAiringReminders = async (): Promise<string[]> => {
  const data = await shioriFetch<{ anime_ids: string[] }>(
    '/anime-notifications/airing-reminders'
  )
  return Array.isArray(data?.anime_ids) ? data.anime_ids.map(String) : []
}

export const enableMyAiringReminder = async (animeId: string | number): Promise<void> => {
  await shioriFetch(
    `/anime-notifications/airing-reminders/${encodeURIComponent(String(animeId))}`,
    { method: 'PUT' }
  )
}

export const disableMyAiringReminder = async (animeId: string | number): Promise<void> => {
  await shioriFetch(
    `/anime-notifications/airing-reminders/${encodeURIComponent(String(animeId))}`,
    { method: 'DELETE' }
  )
}

export const syncMyAiringReminders = async (animeIds: string[]): Promise<string[]> => {
  const data = await shioriFetch<{ anime_ids: string[] }>(
    '/anime-notifications/airing-reminders/sync',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anime_ids: animeIds }),
    }
  )
  return Array.isArray(data?.anime_ids) ? data.anime_ids.map(String) : []
}
