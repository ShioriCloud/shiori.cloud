import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from './useAppAuth'
import { useAnimeStore, type FavoriteProgress } from '../store/animeStore'
import {
  computeUserListStats,
  getUserAnimeList,
  removeUserAnimeListEntry,
  upsertUserAnimeListEntry,
  type UserAnimeListMutationResult,
} from '../services/userDataSource'
import { canSyncUserAnimeList } from '@/lib/userListAuth'
import { ensureDevAppAuth } from '@/lib/ensureDevAppAuth'
import { getSessionTelegramUserId } from '@/lib/telegramSessionStorage'
import {
  invalidateAnimeDetailQuery,
  patchAnimeDetailShioriScore,
} from './queries/invalidate'
import { queryKeys } from './queries/keys'

const toProgress = (row: {
  episodes_watched: number
  user_rating: number | null
}): FavoriteProgress => ({
  episodesWatched: row.episodes_watched,
  userRating: row.user_rating,
})

const hasTrackedProgress = (progress: FavoriteProgress): boolean =>
  Boolean(
    progress.listStatus ||
      (progress.episodesWatched ?? 0) > 0 ||
      progress.userRating != null
  )

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

    // Only seed from server when local store is empty — never wipe optimistic heart toggles.
    const shouldHydrateFromRemote = localIds.length === 0 && remoteRows.length > 0
    if (shouldHydrateFromRemote) {
      hydrateFavoritesFromRemote(
        remoteRows.map((row) => ({
          animeId: row.anime_id,
          progress: toProgress(row),
          isFavorite: row.is_favorite,
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
            is_favorite: true,
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

  const applyMutationResult = useCallback(
    (animeId: number | string, result: UserAnimeListMutationResult | undefined) => {
      if (result && 'shiori_score' in result) {
        patchAnimeDetailShioriScore(animeId, result.shiori_score)
      }
    },
    []
  )

  const refreshSocialProfileCaches = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.socialProfileMe })
  }, [queryClient])

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
      refreshSocialProfileCaches()
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
      const progress = favoriteProgress[String(animeId)] ?? {
        episodesWatched: 0,
        userRating: null,
      }
      if (typeof uid === 'number' && canSyncUserAnimeList()) {
        return upsertUserAnimeListEntry(uid, animeId, {
          episodes_watched: progress.episodesWatched,
          user_rating: progress.userRating,
          is_favorite: true,
        })
      }
      return undefined
    },
    onMutate: (animeId) => {
      addToFavorites(animeId)
    },
    onError: (_error, animeId) => {
      removeFromFavorites(animeId)
    },
    onSuccess: (_result, _animeId) => {
      refreshSocialProfileCaches()
    },
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: async (animeId: number | string) => {
      await ensureDevAppAuth()
      const uid = user?.id ?? getSessionTelegramUserId()
      const progress = favoriteProgress[String(animeId)] ?? {
        episodesWatched: 0,
        userRating: null,
      }
      if (typeof uid === 'number' && canSyncUserAnimeList()) {
        if (hasTrackedProgress(progress)) {
          return upsertUserAnimeListEntry(uid, animeId, {
            episodes_watched: progress.episodesWatched,
            user_rating: progress.userRating,
            is_favorite: false,
          })
        }
        return removeUserAnimeListEntry(uid, animeId)
      }
      return undefined
    },
    onMutate: (animeId) => {
      const previousProgress = favoriteProgress[String(animeId)] ?? {
        episodesWatched: 0,
        userRating: null,
      }
      const keepProgress = hasTrackedProgress(previousProgress)
      removeFromFavorites(animeId, keepProgress)
      return { previousProgress, keepProgress }
    },
    onError: (_error, animeId, context) => {
      addToFavorites(animeId)
      if (context?.previousProgress && !context.keepProgress) {
        setFavoriteProgress(animeId, context.previousProgress)
      }
    },
    onSuccess: (result, animeId) => {
      applyMutationResult(animeId, result)
      refreshSocialProfileCaches()
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

  const clearTrackingMutation = useMutation({
    mutationFn: async (animeId: number | string) => {
      const cleared: FavoriteProgress = {
        episodesWatched: 0,
        userRating: null,
        listStatus: null,
      }
      await ensureDevAppAuth()
      const uid = user?.id ?? getSessionTelegramUserId()
      const fav = favoriteAnime.some((id) => String(id) === String(animeId))
      let result: UserAnimeListMutationResult | undefined
      if (typeof uid === 'number' && canSyncUserAnimeList()) {
        if (fav) {
          result = await upsertUserAnimeListEntry(uid, animeId, {
            episodes_watched: 0,
            user_rating: null,
            is_favorite: true,
          })
        } else {
          try {
            result = await removeUserAnimeListEntry(uid, animeId)
          } catch {
            // Row may only exist locally until first sync.
          }
        }
      }
      setFavoriteProgress(animeId, cleared)
      return { result, animeId }
    },
    onMutate: (animeId) => {
      const previous = favoriteProgress[String(animeId)] ?? {
        episodesWatched: 0,
        userRating: null,
      }
      setFavoriteProgress(animeId, {
        episodesWatched: 0,
        userRating: null,
        listStatus: null,
      })
      patchAnimeDetailShioriScore(animeId, null)
      return { previous, animeId }
    },
    onError: (_error, animeId, context) => {
      if (context?.previous) {
        setFavoriteProgress(animeId, context.previous)
      }
    },
    onSuccess: (data) => {
      applyMutationResult(data.animeId, data.result)
      refreshSocialProfileCaches()
      invalidateAnimeDetailQuery(data.animeId)
    },
  })

  const clearListTracking = useCallback(
    (animeId: number | string) => clearTrackingMutation.mutateAsync(animeId),
    [clearTrackingMutation]
  )

  return {
    favoriteAnime,
    stats,
    getProgress,
    saveProgress,
    clearListTracking,
    toggleFavorite,
    isFavorite,
    isSaving: saveMutation.isPending || clearTrackingMutation.isPending,
    hasTelegramUser: inTelegram && typeof telegramUserId === 'number',
    hasAppUser: typeof telegramUserId === 'number',
    canSyncList: listSyncEnabled,
    inTelegram,
  }
}
