import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GenreItem } from '../types/catalog'

export interface AnimeListItem {
  id: number | string
  title: string
  image: string
  description: string
  status: string
  genres: GenreItem[]
  episodes: number
  isNew: boolean
  episode: string
}

export type FavoriteProgress = {
  episodesWatched: number
  userRating: number | null
  /** Explicit list status (paused/dropped); otherwise derived from episodes. */
  listStatus?:
    | 'planning'
    | 'watching'
    | 'completed'
    | 'rewatching'
    | 'paused'
    | 'dropped'
    | null
  /** When listStatus (or major progress) was last set — ISO string. */
  listStatusUpdatedAt?: string | null
}

interface AnimeState {
  animeList: AnimeListItem[]
  favoriteAnime: (number | string)[]
  favoriteProgress: Record<string, FavoriteProgress>
  addToFavorites: (animeId: number | string) => void
  removeFromFavorites: (animeId: number | string, keepProgress?: boolean) => void
  setFavoriteProgress: (animeId: number | string, progress: FavoriteProgress) => void
  hydrateFavoritesFromRemote: (
    entries: Array<{
      animeId: number | string
      progress: FavoriteProgress
      isFavorite?: boolean
      favoriteRank?: number | null
    }>
  ) => void
  mergeListFromRemote: (
    entries: Array<{
      animeId: number | string
      progress: FavoriteProgress
      isFavorite: boolean
      favoriteRank?: number | null
    }>
  ) => void
  moveFavorite: (animeId: number | string, direction: 'up' | 'down') => void
  reorderFavorites: (orderedIds: Array<number | string>) => void
  setAnimeList: (animeList: AnimeListItem[]) => void
}

const defaultProgress = (): FavoriteProgress => ({
  episodesWatched: 0,
  userRating: null,
})

type RemoteListEntry = {
  animeId: number | string
  progress: FavoriteProgress
  isFavorite?: boolean
  favoriteRank?: number | null
}

const sortFavoriteIds = (entries: RemoteListEntry[]) =>
  entries
    .filter((e) => e.isFavorite === true)
    .sort((a, b) => {
      const ar = a.favoriteRank ?? Number.MAX_SAFE_INTEGER
      const br = b.favoriteRank ?? Number.MAX_SAFE_INTEGER
      if (ar !== br) return ar - br
      return String(a.animeId).localeCompare(String(b.animeId))
    })
    .map((e) => e.animeId)

export const useAnimeStore = create<AnimeState>()(
  persist(
    (set) => ({
      animeList: [],
      favoriteAnime: [],
      favoriteProgress: {},
      addToFavorites: (animeId) =>
        set((state) => {
          const key = String(animeId)
          const already = state.favoriteAnime.some((id) => String(id) === key)
          return {
            favoriteAnime: already ? state.favoriteAnime : [...state.favoriteAnime, animeId],
            favoriteProgress: already
              ? state.favoriteProgress
              : { ...state.favoriteProgress, [key]: defaultProgress() },
          }
        }),
      removeFromFavorites: (animeId, keepProgress = false) =>
        set((state) => {
          const key = String(animeId)
          if (keepProgress) {
            return {
              favoriteAnime: state.favoriteAnime.filter((id) => String(id) !== key),
              favoriteProgress: state.favoriteProgress,
            }
          }
          const nextProgress = { ...state.favoriteProgress }
          delete nextProgress[key]
          return {
            favoriteAnime: state.favoriteAnime.filter((id) => String(id) !== key),
            favoriteProgress: nextProgress,
          }
        }),
      setFavoriteProgress: (animeId, progress) =>
        set((state) => ({
          favoriteProgress: {
            ...state.favoriteProgress,
            [String(animeId)]: progress,
          },
        })),
      hydrateFavoritesFromRemote: (entries) =>
        set(() => {
          const favoriteAnime = sortFavoriteIds(entries)
          const favoriteProgress = Object.fromEntries(
            entries.map((e) => [String(e.animeId), e.progress])
          )
          return { favoriteAnime, favoriteProgress }
        }),
      moveFavorite: (animeId, direction) =>
        set((state) => {
          const key = String(animeId)
          const idx = state.favoriteAnime.findIndex((id) => String(id) === key)
          if (idx < 0) return state
          const next = [...state.favoriteAnime]
          const swap = direction === 'up' ? idx - 1 : idx + 1
          if (swap < 0 || swap >= next.length) return state
          ;[next[idx], next[swap]] = [next[swap], next[idx]]
          return { favoriteAnime: next }
        }),
      reorderFavorites: (orderedIds) =>
        set({ favoriteAnime: [...orderedIds] }),
      mergeListFromRemote: (entries) =>
        set((state) => {
          const favoriteProgress = { ...state.favoriteProgress }
          const favOrder = [...state.favoriteAnime]
          const favSet = new Set(favOrder.map(String))

          for (const entry of entries) {
            const key = String(entry.animeId)
            favoriteProgress[key] = entry.progress
            if (entry.isFavorite) {
              if (!favSet.has(key)) {
                favSet.add(key)
                favOrder.push(entry.animeId)
              }
            } else if (favSet.has(key)) {
              favSet.delete(key)
              const idx = favOrder.findIndex((id) => String(id) === key)
              if (idx >= 0) favOrder.splice(idx, 1)
            }
          }

          return { favoriteAnime: favOrder, favoriteProgress }
        }),
      setAnimeList: (animeList) => set({ animeList }),
    }),
    {
      name: 'anime-storage',
      version: 3,
      migrate: (persisted: unknown) => {
        const state = persisted as Partial<AnimeState> | undefined
        return {
          animeList: state?.animeList ?? [],
          favoriteAnime: state?.favoriteAnime ?? [],
          favoriteProgress: state?.favoriteProgress ?? {},
        }
      },
    }
  )
)
