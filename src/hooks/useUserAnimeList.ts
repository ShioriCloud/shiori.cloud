import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from './useAppAuth'
import { useAnimeStore, type FavoriteProgress } from '../store/animeStore'
import {
  computeUserListStats,
  getUserAnimeList,
  removeUserAnimeListEntry,
  upsertUserAnimeListEntry,
  type AnimeFavoriteCountMap,
  type UserAnimeListMutationResult,
} from '../services/userDataSource'
import { canSyncUserAnimeList } from '@/lib/userListAuth'
import { ensureDevAppAuth } from '@/lib/ensureDevAppAuth'
import { getSessionTelegramUserId } from '@/lib/telegramSessionStorage'
import {
  invalidateAnimeDetailQuery,
  patchAnimeDetailShioriScore,
  patchAnimeFavoriteCount,
} from './queries/invalidate'
import { queryKeys } from './queries/keys'

const toProgress = (row: {
  episodes_watched: number
  user_rating: number | null
}): FavoriteProgress => ({
  episodesWatched: row.episodes_watched,
  userRating: row.user_rating,
})

export const useUserAnimeList = (options?: { syncRemoteList?: boolean }) => {
  const syncRemoteList = options?.syncRemoteList !== false
  const { user, isReady, inTelegram } = useAppAuth()
  const queryClient = useQueryClient()
  const syncedRef = useRef(false)

  const [sessionUserId, setSessionUserId] = useState<number | null>(() =>
    getSessionTelegramUserId()
  )
  const [listAuthReady, setListAuthReady] = useState(() => canSyncUserAnimeList())
  const [storeHydrated, setStoreHydrated] = useState(() =>
    useAnimeStore.persist.hasHydrated()
  )

  useEffect(() => {
    const unsub = useAnimeStore.persist.onFinishHydration(() => {
      setStoreHydrated(true)
    })
    setStoreHydrated(useAnimeStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    void ensureDevAppAuth().then((ok) => {
      setSessionUserId(getSessionTelegramUserId())
      setListAuthReady(ok || canSyncUserAnimeList())
    })
  }, [])

  const telegramUserId = user?.id ?? sessionUserId ?? undefined

  const favoriteAnime = useAnimeStore((s) => s.favoriteAnime)
  const favoriteProgress = useAnimeStore((s) => s.favoriteProgress)
  const addToFavorites = useAnimeStore((s) => s.addToFavorites)
  const removeFromFavorites = useAnimeStore((s) => s.removeFromFavorites)
  const setFavoriteProgress = useAnimeStore((s) => s.setFavoriteProgress)
  const hydrateFavoritesFromRemote = useAnimeStore((s) => s.hydrateFavoritesFromRemote)

  const listSyncEnabled =
    syncRemoteList &&
    isReady &&
    storeHydrated &&
    typeof telegramUserId === 'number' &&
    listAuthReady &&
    canSyncUserAnimeList()

  const { data: remoteRows = [], isLoading: remoteLoading } = useQuery({
    queryKey: queryKeys.userAnimeList(telegramUserId ?? 0),
    queryFn: () => getUserAnimeList(telegramUserId!),
    enabled: listSyncEnabled,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!syncRemoteList) return
    if (!isReady || !storeHydrated || typeof telegramUserId !== 'number') return
    if (remoteLoading) return
    if (syncedRef.current) return

    syncedRef.current = true

    const localIds = favoriteAnime.map(String)
    const localProgressSnapshot = { ...favoriteProgress }
    const remoteIdSet = new Set(remoteRows.map((r) => String(r.anime_id)))

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
    syncRemoteList,
    isReady,
    storeHydrated,
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
  }

  const getFavoriteCountBaseline = useCallback(
    (animeId: number | string): number => {
      const perAnime = queryClient.getQueryData<number>(queryKeys.animeFavoriteCount(animeId))
      if (typeof perAnime === 'number' && Number.isFinite(perAnime)) return perAnime
      const bulk = queryClient.getQueryData<AnimeFavoriteCountMap>(queryKeys.animeFavoriteCounts)
      const fromBulk = bulk?.[String(animeId)]
      if (typeof fromBulk === 'number' && Number.isFinite(fromBulk)) return fromBulk

      // Fall back to any alias key found via detail cache.
      for (const [key, data] of queryClient.getQueriesData<{ id?: string | number }>({
        queryKey: ['anime', 'detail', 'v2'],
      })) {
        if (data != null && String(data.id) === String(animeId) && key[3] != null) {
          const alias = queryClient.getQueryData<number>(
            queryKeys.animeFavoriteCount(String(key[3]))
          )
          if (typeof alias === 'number' && Number.isFinite(alias)) return alias
        }
      }
      return 0
    },
    [queryClient]
  )

  const snapshotFavoriteCounts = useCallback(
    (animeId: number | string): FavoriteCountSnapshot => ({
      perAnime: queryClient.getQueryData<number>(queryKeys.animeFavoriteCount(animeId)),
      allCounts: queryClient.getQueryData<AnimeFavoriteCountMap>(queryKeys.animeFavoriteCounts),
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

  const applyMutationResult = useCallback(
    (animeId: number | string, result: UserAnimeListMutationResult | undefined) => {
      if (typeof result?.favorite_count === 'number') {
        patchAnimeFavoriteCount(animeId, result.favorite_count)
      }
      if (result && 'shiori_score' in result) {
        patchAnimeDetailShioriScore(animeId, result.shiori_score)
      }
    },
    []
  )

  const saveMutation = useMutation({
    mutationFn: async ({
      animeId,
      progress,
    }: {
      animeId: number | string
      progress: FavoriteProgress
    }) => {
      await ensureDevAppAuth()
      const uid = user?.id ?? getSessionTelegramUserId()
      let result: UserAnimeListMutationResult | undefined
      if (typeof uid === 'number' && canSyncUserAnimeList()) {
        result = await upsertUserAnimeListEntry(uid, animeId, {
          episodes_watched: progress.episodesWatched,
          user_rating: progress.userRating,
        })
      }
      setFavoriteProgress(animeId, progress)
      return { result, progress }
    },
    onMutate: async ({ animeId, progress }) => {
      const previous = favoriteProgress[String(animeId)] ?? {
        episodesWatched: 0,
        userRating: null,
      }
      setFavoriteProgress(animeId, progress)
      // Optimistic Shiori score when anime had none yet.
      if (typeof progress.userRating === 'number') {
        patchAnimeDetailShioriScore(animeId, progress.userRating)
      }
      return { previous, animeId }
    },
    onError: (_error, { animeId }, context) => {
      if (context?.previous) {
        setFavoriteProgress(animeId, context.previous)
      }
    },
    onSuccess: (data, variables) => {
      if (typeof telegramUserId === 'number') {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userAnimeList(telegramUserId),
        })
      }
      applyMutationResult(variables.animeId, data.result)
      if (data.result?.shiori_score === undefined && typeof data.progress.userRating === 'number') {
        patchAnimeDetailShioriScore(variables.animeId, data.progress.userRating)
      }
      // Keep patched score — a blind invalidate was refetching and wiping it.
      if (data.result?.shiori_score == null && data.progress.userRating == null) {
        invalidateAnimeDetailQuery(variables.animeId)
      }
    },
  })

  const addFavoriteMutation = useMutation({
    mutationFn: async (animeId: number | string) => {
      await ensureDevAppAuth()
      const uid = user?.id ?? getSessionTelegramUserId()
      if (typeof uid === 'number' && canSyncUserAnimeList()) {
        return upsertUserAnimeListEntry(uid, animeId, {
          episodes_watched: 0,
          user_rating: null,
        })
      }
      return undefined
    },
    onMutate: (animeId) => {
      addToFavorites(animeId)
      const snapshot = snapshotFavoriteCounts(animeId)
      patchAnimeFavoriteCount(animeId, getFavoriteCountBaseline(animeId) + 1)
      return snapshot
    },
    onError: (_error, animeId, snapshot) => {
      removeFromFavorites(animeId)
      if (snapshot) restoreFavoriteCounts(animeId, snapshot)
    },
    onSuccess: (result, animeId) => {
      if (typeof telegramUserId === 'number') {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userAnimeList(telegramUserId),
        })
      }
      if (typeof result?.favorite_count === 'number') {
        patchAnimeFavoriteCount(animeId, result.favorite_count)
      }
    },
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: async (animeId: number | string) => {
      await ensureDevAppAuth()
      const uid = user?.id ?? getSessionTelegramUserId()
      if (typeof uid === 'number' && canSyncUserAnimeList()) {
        return removeUserAnimeListEntry(uid, animeId)
      }
      return undefined
    },
    onMutate: (animeId) => {
      removeFromFavorites(animeId)
      const snapshot = snapshotFavoriteCounts(animeId)
      patchAnimeFavoriteCount(animeId, getFavoriteCountBaseline(animeId) - 1)
      return { ...snapshot, previousProgress: favoriteProgress[String(animeId)] }
    },
    onError: (_error, animeId, context) => {
      addToFavorites(animeId)
      if (context?.previousProgress) {
        setFavoriteProgress(animeId, context.previousProgress)
      }
      if (context) restoreFavoriteCounts(animeId, context)
    },
    onSuccess: (result, animeId) => {
      if (typeof telegramUserId === 'number') {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userAnimeList(telegramUserId),
        })
      }
      applyMutationResult(animeId, result)
      if (typeof result?.favorite_count === 'number') {
        patchAnimeFavoriteCount(animeId, result.favorite_count)
      }
      invalidateAnimeDetailQuery(animeId)
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
