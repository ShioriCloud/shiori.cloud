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
  listStatus?: 'planning' | 'watching' | 'completed' | 'paused' | 'dropped' | null
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
    }>
  ) => void
  setAnimeList: (animeList: AnimeListItem[]) => void
}

const defaultProgress = (): FavoriteProgress => ({
  episodesWatched: 0,
  userRating: null,
})

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
          const favoriteAnime = entries
            .filter((e) => e.isFavorite !== false)
            .map((e) => e.animeId)
          const favoriteProgress = Object.fromEntries(
            entries.map((e) => [String(e.animeId), e.progress])
          )
          return { favoriteAnime, favoriteProgress }
        }),
      setAnimeList: (animeList) => set({ animeList }),
    }),
    {
      name: 'anime-storage',
      version: 2,
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
