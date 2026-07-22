import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_SHIORI_LISTS = 5

export type ShioriListIcon = 'heart' | 'star' | 'fire' | 'bookmark' | 'sparkle'

export type ShioriCustomList = {
  id: string
  name: string
  icon: ShioriListIcon
  animeIds: string[]
  createdAt: string
  updatedAt: string
}

export type BrowseHistoryEntry = {
  animeId: string
  viewedAt: string
}

export type DownloadRecord = {
  id: string
  animeId: string
  animeTitle: string
  animeImage: string
  episodeNumber: number
  episodeTitle?: string
  quality?: string
  fileSize?: string
  downloadedAt: string
  status: 'available' | 'removed'
}

type MyListState = {
  customLists: ShioriCustomList[]
  browseHistory: BrowseHistoryEntry[]
  downloads: DownloadRecord[]

  createList: (name: string, icon: ShioriListIcon) => ShioriCustomList | null
  updateList: (id: string, patch: Partial<Pick<ShioriCustomList, 'name' | 'icon'>>) => void
  deleteList: (id: string) => void
  addAnimeToList: (listId: string, animeId: string | number) => void
  removeAnimeFromList: (listId: string, animeId: string | number) => void

  recordBrowse: (animeId: string | number) => void
  removeHistoryEntry: (animeId: string | number) => void
  clearHistory: () => void

  recordDownload: (entry: Omit<DownloadRecord, 'id' | 'downloadedAt' | 'status'>) => void
  removeDownload: (id: string) => void
  clearDownloads: () => void
  markDownloadRemoved: (id: string) => void
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const useMyListStore = create<MyListState>()(
  persist(
    (set, get) => ({
      customLists: [],
      browseHistory: [],
      downloads: [],

      createList: (name, icon) => {
        if (get().customLists.length >= MAX_SHIORI_LISTS) return null
        const now = new Date().toISOString()
        const list: ShioriCustomList = {
          id: newId(),
          name: name.trim() || 'لیست بدون نام',
          icon,
          animeIds: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ customLists: [...s.customLists, list] }))
        return list
      },

      updateList: (id, patch) =>
        set((s) => ({
          customLists: s.customLists.map((l) =>
            l.id === id
              ? { ...l, ...patch, updatedAt: new Date().toISOString() }
              : l
          ),
        })),

      deleteList: (id) =>
        set((s) => ({
          customLists: s.customLists.filter((l) => l.id !== id),
        })),

      addAnimeToList: (listId, animeId) => {
        const key = String(animeId)
        set((s) => ({
          customLists: s.customLists.map((l) => {
            if (l.id !== listId) return l
            if (l.animeIds.includes(key)) return l
            return {
              ...l,
              animeIds: [...l.animeIds, key],
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      removeAnimeFromList: (listId, animeId) => {
        const key = String(animeId)
        set((s) => ({
          customLists: s.customLists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  animeIds: l.animeIds.filter((id) => id !== key),
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        }))
      },

      recordBrowse: (animeId) => {
        const key = String(animeId)
        const now = new Date().toISOString()
        set((s) => {
          const rest = s.browseHistory.filter((e) => e.animeId !== key)
          return {
            browseHistory: [{ animeId: key, viewedAt: now }, ...rest].slice(0, 100),
          }
        })
      },

      removeHistoryEntry: (animeId) => {
        const key = String(animeId)
        set((s) => ({
          browseHistory: s.browseHistory.filter((e) => e.animeId !== key),
        }))
      },

      clearHistory: () => set({ browseHistory: [] }),

      recordDownload: (entry) => {
        const record: DownloadRecord = {
          ...entry,
          id: newId(),
          downloadedAt: new Date().toISOString(),
          status: 'available',
        }
        set((s) => ({
          downloads: [record, ...s.downloads.filter((d) => d.id !== record.id)].slice(0, 200),
        }))
      },

      removeDownload: (id) =>
        set((s) => ({
          downloads: s.downloads.filter((d) => d.id !== id),
        })),

      clearDownloads: () => set({ downloads: [] }),

      markDownloadRemoved: (id) =>
        set((s) => ({
          downloads: s.downloads.map((d) =>
            d.id === id ? { ...d, status: 'removed' as const } : d
          ),
        })),
    }),
    { name: 'shiori-my-list-extra', version: 1 }
  )
)
