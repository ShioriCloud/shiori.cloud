import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'auto' | 'light' | 'dark'

type ThemeState = {
  /** `auto` follows Telegram colorScheme (or system outside Telegram). */
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  /** Legacy toggle: flips between light and dark (exits auto). */
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'auto',
      setPreference: (preference) => set({ preference }),
      toggleTheme: () => {
        const current = get().preference
        if (current === 'dark') set({ preference: 'light' })
        else set({ preference: 'dark' })
      },
    }),
    {
      name: 'theme-storage',
      version: 2,
      migrate: (persisted) => {
        const raw = persisted as { isDarkMode?: boolean; preference?: ThemePreference } | null
        if (raw && typeof raw.preference === 'string') {
          return { preference: raw.preference }
        }
        if (raw && typeof raw.isDarkMode === 'boolean') {
          return { preference: raw.isDarkMode ? 'dark' : 'light' }
        }
        return { preference: 'auto' as ThemePreference }
      },
    }
  )
)
