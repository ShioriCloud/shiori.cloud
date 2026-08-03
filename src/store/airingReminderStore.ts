import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * @deprecated Legacy local-only store. Migrated once to server via
 * `useAiringReminders` (`POST .../airing-reminders/sync`), then cleared.
 * Kept only so old localStorage keys can still be read during migrate.
 */
type AiringReminderState = {
  reminderAnimeIds: string[]
  isReminderOn: (animeId: number | string) => boolean
  enableReminder: (animeId: number | string) => void
  disableReminder: (animeId: number | string) => void
  toggleReminder: (animeId: number | string) => boolean
}

export const useAiringReminderStore = create<AiringReminderState>()(
  persist(
    (set, get) => ({
      reminderAnimeIds: [],
      isReminderOn: (animeId) =>
        get().reminderAnimeIds.some((id) => String(id) === String(animeId)),
      enableReminder: (animeId) =>
        set((state) => {
          const key = String(animeId)
          if (state.reminderAnimeIds.some((id) => String(id) === key)) return state
          return { reminderAnimeIds: [...state.reminderAnimeIds, key] }
        }),
      disableReminder: (animeId) =>
        set((state) => ({
          reminderAnimeIds: state.reminderAnimeIds.filter(
            (id) => String(id) !== String(animeId)
          ),
        })),
      toggleReminder: (animeId) => {
        const wasOn = get().isReminderOn(animeId)
        if (wasOn) get().disableReminder(animeId)
        else get().enableReminder(animeId)
        return !wasOn
      },
    }),
    { name: 'airing-reminders' }
  )
)
