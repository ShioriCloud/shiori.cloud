import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from './useAppAuth'
import { useAnimeStore, type FavoriteProgress } from '../store/animeStore'
import {
  computeUserListStats,
  getUserAnimeList,
  removeUserAnimeListEntry,
  upsertUserAnimeListEntry,
  type AnimeFavoriteCountMap,
} from '../services/userDataSource'
import { canSyncUserAnimeList } from '@/lib/userListAuth'
import { queryKeys } from './queries/keys'

const toProgress = (row: {
  episodes_watched: number
  user_rating: number | null
}): FavoriteProgress => ({
  episodesWatched: row.episodes_watched,
  userRating: row.user_rating,
})

export const useUserAnimeList = () => {
  const { user, isReady, inTelegram } = useAppAuth()
  const telegramUserId = user?.id
  const queryClient = useQueryClient()
  const syncedRef = useRef(false)

  const favoriteAnime = useAnimeStore((s) => s.favoriteAnime)
  const favoriteProgress = useAnimeStore((s) => s.favoriteProgress)
  const addToFavorites = useAnimeStore((s) => s.addToFavorites)
  const removeFromFavorites = useAnimeStore((s) => s.removeFromFavorites)
  const setFavoriteProgress = useAnimeStore((s) => s.setFavoriteProgress)
  const hydrateFavoritesFromRemote = useAnimeStore((s) => s.hydrateFavoritesFromRemote)

  const listSyncEnabled =
    isReady && typeof telegramUserId === 'number' && canSyncUserAnimeList()

  const { data: remoteRows = [], isLoading: remoteLoading } = useQuery({
    queryKey: queryKeys.userAnimeList(telegramUserId ?? 0),
    queryFn: () => getUserAnimeList(telegramUserId!),
    enabled: listSyncEnabled && inTelegram,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!isReady || typeof telegramUserId !== 'number') return
    if (remoteLoading) return
    if (syncedRef.current) return

    syncedRef.current = true

    const localIds = favoriteAnime.map(String)
    const localProgressSnapshot = { ...favoriteProgress }
    const remoteIdSet = new Set(remoteRows.map((r) => String(r.anime_id)))

    // اگر سرور خالی برگرداند ولی local داده دارد، local را wipe نکن (مثلاً initData fail)
    const shouldHydrateFromRemote = remoteRows.length > 0 || localIds.length === 0
    if (shouldHydrateFromRemote) {
      hydrateFavoritesFromRemote(
        remoteRows.map((row) => ({
          animeId: row.anime_id,
          progress: toProgress(row),
        }))
      )
    }

    const localOnly = localIds.filter((id) => !remoteIdSet.has(id))
    if (localOnly.length === 0 || !canSyncUserAnimeList()) return

    void (async () => {
      for (const id of localOnly) {
        const progress = localProgressSnapshot[id] ?? { episodesWatched: 0, userRating: null }
        try {
          await upsertUserAnimeListEntry(telegramUserId, id, {
            episodes_watched: progress.episodesWatched,
            user_rating: progress.userRating,
          })
        } catch (e) {
          if (import.meta.env.DEV) console.warn('sync local favorite:', e)
        }
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userAnimeList(telegramUserId),
      })
    })()
  }, [
    isReady,
    telegramUserId,
    remoteLoading,
    remoteRows,
    favoriteAnime,
    favoriteProgress,
    hydrateFavoritesFromRemote,
    queryClient,
  ])

  useEffect(() => {
    syncedRef.current = false
  }, [telegramUserId, listSyncEnabled])

  const stats = useMemo(() => {
    const rows = favoriteAnime.map((animeId) => {
      const key = String(animeId)
      const progress = favoriteProgress[key] ?? { episodesWatched: 0, userRating: null }
      return {
        anime_id: animeId,
        episodes_watched: progress.episodesWatched,
        user_rating: progress.userRating,
      }
    })
    return computeUserListStats(rows)
  }, [favoriteAnime, favoriteProgress])

  const getProgress = useCallback(
    (animeId: number | string): FavoriteProgress =>
      favoriteProgress[String(animeId)] ?? { episodesWatched: 0, userRating: null },
    [favoriteProgress]
  )

  type FavoriteCountSnapshot = {
    perAnime: number | undefined
    allCounts: AnimeFavoriteCountMap | undefined
    patched: boolean
  }

  const getFavoriteCountBaseline = useCallback(
    (animeId: number | string): number | null => {
      const perAnime = queryClient.getQueryData<number>(queryKeys.animeFavoriteCount(animeId))
      if (typeof perAnime === 'number' && Number.isFinite(perAnime)) return perAnime
      const bulk = queryClient.getQueryData<AnimeFavoriteCountMap>(queryKeys.animeFavoriteCounts)
      const fromBulk = bulk?.[String(animeId)]
      if (typeof fromBulk === 'number' && Number.isFinite(fromBulk)) return fromBulk
      return null
    },
    [queryClient]
  )

  const setFavoriteCountCache = useCallback(
    (animeId: number | string, count: number) => {
      const key = String(animeId)
      const next = Math.max(0, count)
      queryClient.setQueryData<number>(queryKeys.animeFavoriteCount(animeId), next)
      queryClient.setQueryData<AnimeFavoriteCountMap>(queryKeys.animeFavoriteCounts, (old) => ({
        ...(old ?? {}),
        [key]: next,
      }))
    },
    [queryClient]
  )

  const patchFavoriteCountCache = useCallback(
    (animeId: number | string, delta: 1 | -1) => {
      const baseline = getFavoriteCountBaseline(animeId)
      if (baseline === null) return false
      setFavoriteCountCache(animeId, baseline + delta)
      return true
    },
    [getFavoriteCountBaseline, setFavoriteCountCache]
  )

  const applyFavoriteCountDelta = useCallback(
    (animeId: number | string, delta: 1 | -1): boolean => patchFavoriteCountCache(animeId, delta),
    [patchFavoriteCountCache]
  )

  const snapshotFavoriteCounts = useCallback(
    (animeId: number | string): FavoriteCountSnapshot => ({
      perAnime: queryClient.getQueryData<number>(queryKeys.animeFavoriteCount(animeId)),
      allCounts: queryClient.getQueryData<AnimeFavoriteCountMap>(queryKeys.animeFavoriteCounts),
      patched: false,
    }),
    [queryClient]
  )

  const restoreFavoriteCounts = useCallback(
    (animeId: number | string, snapshot: FavoriteCountSnapshot) => {
      queryClient.setQueryData(queryKeys.animeFavoriteCount(animeId), snapshot.perAnime)
      queryClient.setQueryData(queryKeys.animeFavoriteCounts, snapshot.allCounts)
    },
    [queryClient]
  )

  const saveMutation = useMutation({
    mutationFn: async ({
      animeId,
      progress,
    }: {
      animeId: number | string
      progress: FavoriteProgress
    }) => {
      if (typeof telegramUserId === 'number' && canSyncUserAnimeList()) {
        await upsertUserAnimeListEntry(telegramUserId, animeId, {
          episodes_watched: progress.episodesWatched,
          user_rating: progress.userRating,
        })
      }
      setFavoriteProgress(animeId, progress)
    },
    onMutate: async ({ animeId, progress }) => {
      const previous = favoriteProgress[String(animeId)] ?? {
        episodesWatched: 0,
        userRating: null,
      }
      setFavoriteProgress(animeId, progress)
      return { previous, animeId }
    },
    onError: (_error, { animeId }, context) => {
      if (context?.previous) {
        setFavoriteProgress(animeId, context.previous)
      }
    },
    onSuccess: (_data, variables) => {
      if (typeof telegramUserId === 'number') {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userAnimeList(telegramUserId),
        })
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.animeDetail(variables.animeId),
      })
    },
  })

  const addFavoriteMutation = useMutation({
    mutationFn: async (animeId: number | string) => {
      if (typeof telegramUserId === 'number' && canSyncUserAnimeList()) {
        await upsertUserAnimeListEntry(telegramUserId, animeId, {
          episodes_watched: 0,
          user_rating: null,
        })
      }
    },
    onMutate: (animeId) => {
      addToFavorites(animeId)
      const snapshot = snapshotFavoriteCounts(animeId)
      const patched = applyFavoriteCountDelta(animeId, 1)
      return { ...snapshot, patched }
    },
    onError: (_error, animeId, snapshot) => {
      removeFromFavorites(animeId)
      if (snapshot) restoreFavoriteCounts(animeId, snapshot)
    },
    onSuccess: (_data, animeId, snapshot) => {
      if (typeof telegramUserId === 'number') {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userAnimeList(telegramUserId),
        })
      }
      if (!snapshot?.patched) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.animeFavoriteCounts })
        void queryClient.invalidateQueries({ queryKey: queryKeys.animeFavoriteCount(animeId) })
      }
    },
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: async (animeId: number | string) => {
      if (typeof telegramUserId === 'number' && canSyncUserAnimeList()) {
        await removeUserAnimeListEntry(telegramUserId, animeId)
      }
    },
    onMutate: (animeId) => {
      removeFromFavorites(animeId)
      const snapshot = snapshotFavoriteCounts(animeId)
      const patched = applyFavoriteCountDelta(animeId, -1)
      return { ...snapshot, patched, previousProgress: favoriteProgress[String(animeId)] }
    },
    onError: (_error, animeId, context) => {
      addToFavorites(animeId)
      if (context?.previousProgress) {
        setFavoriteProgress(animeId, context.previousProgress)
      }
      if (context) restoreFavoriteCounts(animeId, context)
    },
    onSuccess: (_data, animeId, snapshot) => {
      if (typeof telegramUserId === 'number') {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userAnimeList(telegramUserId),
        })
      }
      if (!snapshot?.patched) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.animeFavoriteCounts })
        void queryClient.invalidateQueries({ queryKey: queryKeys.animeFavoriteCount(animeId) })
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.animeDetail(animeId) })
    },
  })

  const toggleFavorite = useCallback(
    async (animeId: number | string) => {
      const isFav = favoriteAnime.some((id) => String(id) === String(animeId))
      if (isFav) await removeFavoriteMutation.mutateAsync(animeId)
      else await addFavoriteMutation.mutateAsync(animeId)
    },
    [favoriteAnime, addFavoriteMutation, removeFavoriteMutation]
  )

  const isFavorite = useCallback(
    (animeId: number | string) => favoriteAnime.some((id) => String(id) === String(animeId)),
    [favoriteAnime]
  )

  const saveProgress = useCallback(
    (animeId: number | string, progress: FavoriteProgress) =>
      saveMutation.mutateAsync({ animeId, progress }),
    [saveMutation]
  )

  return {
    favoriteAnime,
    stats,
    getProgress,
    saveProgress,
    toggleFavorite,
    isFavorite,
    isSaving: saveMutation.isPending,
    hasTelegramUser: inTelegram && typeof telegramUserId === 'number',
    hasAppUser: typeof telegramUserId === 'number',
    canSyncList: listSyncEnabled,
    inTelegram,
  }
}
