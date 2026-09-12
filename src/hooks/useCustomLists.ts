import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppAuth } from './useAppAuth'
import {
  addUserCustomListItem,
  createUserCustomList,
  deleteUserCustomList,
  getUserCustomLists,
  removeUserCustomListItem,
  reorderUserCustomListItems,
  updateUserCustomList,
  type UserCustomListRow,
} from '../services/userDataSource'
import { canSyncUserAnimeList } from '@/lib/userListAuth'
import { ensureDevAppAuth } from '@/lib/ensureDevAppAuth'
import { getSessionTelegramUserId } from '@/lib/telegramSessionStorage'
import { queryKeys } from './queries/keys'
import {
  MAX_SHIORI_LISTS,
  isShioriListIcon,
  useMyListStore,
  type ShioriCustomList,
  type ShioriListIcon,
} from '@/store/myListStore'

const normalizeListName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ')

const isBrowserOffline = () =>
  typeof navigator !== 'undefined' && navigator.onLine === false

const toStoreList = (row: UserCustomListRow): ShioriCustomList => ({
  id: row.id,
  name: row.name,
  icon: isShioriListIcon(row.icon) ? row.icon : 'heart',
  animeIds: [...(row.items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item) => item.anime_id),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

let migrateInFlight: Promise<void> | null = null

const mergeLocalIntoRemote = async (local: ShioriCustomList[], remote: UserCustomListRow[]) => {
  const remotes = remote.map((row) => ({ ...row, items: [...(row.items ?? [])] }))
  const matched = new Set<string>()
  const aliases: Record<string, string> = {}

  for (const localList of local) {
    const byId = remotes.find((row) => row.id === localList.id)
    if (byId) {
      matched.add(byId.id)
      for (const animeId of localList.animeIds) {
        if (byId.items.some((item) => item.anime_id === animeId)) continue
        try {
          const updated = await addUserCustomListItem(byId.id, animeId)
          Object.assign(byId, updated)
          byId.items = updated.items ?? byId.items
        } catch (error) {
          if (import.meta.env.DEV) console.warn('sync custom list item:', error)
        }
      }
      continue
    }

    const byName = remotes.find(
      (row) =>
        !matched.has(row.id) && normalizeListName(row.name) === normalizeListName(localList.name)
    )
    if (byName) {
      matched.add(byName.id)
      if (byName.id !== localList.id) aliases[localList.id] = byName.id
      for (const animeId of localList.animeIds) {
        if (byName.items.some((item) => item.anime_id === animeId)) continue
        try {
          const updated = await addUserCustomListItem(byName.id, animeId)
          Object.assign(byName, updated)
          byName.items = updated.items ?? byName.items
        } catch (error) {
          if (import.meta.env.DEV) console.warn('sync custom list item:', error)
        }
      }
      continue
    }

    if (remotes.length >= MAX_SHIORI_LISTS) continue

    try {
      const created = await createUserCustomList({
        id: localList.id,
        name: localList.name,
        icon: localList.icon,
      })
      remotes.push({ ...created, items: [...(created.items ?? [])] })
      matched.add(created.id)
      if (created.id !== localList.id) aliases[localList.id] = created.id
      const target = remotes[remotes.length - 1]
      for (const animeId of localList.animeIds) {
        try {
          const updated = await addUserCustomListItem(created.id, animeId)
          Object.assign(target, updated)
          target.items = updated.items ?? target.items
        } catch (error) {
          if (import.meta.env.DEV) console.warn('sync custom list item:', error)
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) console.warn('sync create custom list:', error)
    }
  }

  return aliases
}

export const useCustomLists = (options?: { syncRemote?: boolean }) => {
  const syncRemote = options?.syncRemote !== false
  const { user, isReady } = useAppAuth()
  const queryClient = useQueryClient()
  const syncedRef = useRef(false)

  const [sessionUserId, setSessionUserId] = useState<number | null>(() =>
    getSessionTelegramUserId()
  )
  const [listAuthReady, setListAuthReady] = useState(() => canSyncUserAnimeList())
  const [storeHydrated, setStoreHydrated] = useState(() =>
    useMyListStore.persist.hasHydrated()
  )
  const [isOffline, setIsOffline] = useState(() => isBrowserOffline())

  useEffect(() => {
    const unsub = useMyListStore.persist.onFinishHydration(() => {
      setStoreHydrated(true)
    })
    setStoreHydrated(useMyListStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    void ensureDevAppAuth().then((ok) => {
      setSessionUserId(getSessionTelegramUserId())
      setListAuthReady(ok || canSyncUserAnimeList())
    })
  }, [])

  useEffect(() => {
    const update = () => {
      const offline = isBrowserOffline()
      setIsOffline(offline)
      if (!offline) syncedRef.current = false
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  const telegramUserId = user?.id ?? sessionUserId ?? undefined

  const customLists = useMyListStore((s) => s.customLists)
  const listIdAliases = useMyListStore((s) => s.listIdAliases)
  const createListLocal = useMyListStore((s) => s.createList)
  const updateListLocal = useMyListStore((s) => s.updateList)
  const deleteListLocal = useMyListStore((s) => s.deleteList)
  const addAnimeToListLocal = useMyListStore((s) => s.addAnimeToList)
  const removeAnimeFromListLocal = useMyListStore((s) => s.removeAnimeFromList)
  const replaceCustomLists = useMyListStore((s) => s.replaceCustomLists)
  const remapListId = useMyListStore((s) => s.remapListId)

  const listSyncEnabled =
    syncRemote &&
    isReady &&
    storeHydrated &&
    typeof telegramUserId === 'number' &&
    listAuthReady &&
    canSyncUserAnimeList() &&
    !isOffline

  const { data: remoteRows = [], isLoading: remoteLoading } = useQuery({
    queryKey: queryKeys.userCustomLists(telegramUserId ?? 0),
    queryFn: getUserCustomLists,
    enabled: listSyncEnabled,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!syncRemote) return
    if (!isReady || !storeHydrated || typeof telegramUserId !== 'number') return
    if (!listSyncEnabled) return
    if (remoteLoading) return
    if (syncedRef.current) return
    if (migrateInFlight) return

    syncedRef.current = true
    const localSnapshot = useMyListStore.getState().customLists

    migrateInFlight = (async () => {
      const aliases = await mergeLocalIntoRemote(localSnapshot, remoteRows)
      let nextRows = remoteRows
      if (localSnapshot.length > 0) {
        try {
          nextRows = await getUserCustomLists()
          queryClient.setQueryData(queryKeys.userCustomLists(telegramUserId), nextRows)
        } catch (error) {
          if (import.meta.env.DEV) console.warn('refetch custom lists:', error)
        }
      }

      const shouldHydrate = nextRows.length > 0 || localSnapshot.length === 0
      if (shouldHydrate) {
        const snapshotIds = new Set(localSnapshot.map((list) => list.id))
        const createdDuringSync = useMyListStore
          .getState()
          .customLists.filter(
            (list) =>
              !snapshotIds.has(list.id) &&
              !nextRows.some((row) => row.id === list.id)
          )
        replaceCustomLists(
          [...nextRows.map(toStoreList), ...createdDuringSync].slice(0, MAX_SHIORI_LISTS),
          aliases
        )
      }
    })()
      .catch((error) => {
        syncedRef.current = false
        if (import.meta.env.DEV) console.warn('custom list migrate:', error)
      })
      .finally(() => {
        migrateInFlight = null
      })
  }, [
    syncRemote,
    isReady,
    storeHydrated,
    telegramUserId,
    listSyncEnabled,
    remoteLoading,
    remoteRows,
    replaceCustomLists,
    queryClient,
  ])

  useEffect(() => {
    syncedRef.current = false
  }, [telegramUserId, listSyncEnabled])

  const canCallApi = () =>
    typeof (user?.id ?? getSessionTelegramUserId()) === 'number' &&
    canSyncUserAnimeList() &&
    !isBrowserOffline()

  const invalidate = useCallback(() => {
    const uid = user?.id ?? getSessionTelegramUserId()
    if (typeof uid === 'number') {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userCustomLists(uid) })
    }
  }, [queryClient, user?.id])

  const createListMutation = useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon: ShioriListIcon }) => {
      const created = createListLocal(name, icon)
      if (!created) return null
      if (!canCallApi()) return created
      try {
        const remote = await createUserCustomList({
          id: created.id,
          name: created.name,
          icon: created.icon,
        })
        if (remote.id !== created.id) remapListId(created.id, remote.id)
        return { ...created, id: remote.id }
      } catch (error) {
        deleteListLocal(created.id)
        throw error
      }
    },
    onSuccess: () => invalidate(),
  })

  const updateListMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Pick<ShioriCustomList, 'name' | 'icon'>>
    }) => {
      const previous = useMyListStore.getState().customLists.find((list) => list.id === id)
      updateListLocal(id, patch)
      if (!canCallApi()) return
      try {
        await updateUserCustomList(id, patch)
      } catch (error) {
        if (previous) {
          updateListLocal(id, { name: previous.name, icon: previous.icon })
        }
        throw error
      }
    },
    onSuccess: () => invalidate(),
  })

  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      const previous = useMyListStore.getState().customLists
      deleteListLocal(id)
      if (!canCallApi()) return
      try {
        await deleteUserCustomList(id)
      } catch (error) {
        replaceCustomLists(previous)
        throw error
      }
    },
    onSuccess: () => invalidate(),
  })

  const addAnimeMutation = useMutation({
    mutationFn: async ({
      listId,
      animeId,
    }: {
      listId: string
      animeId: string | number
    }) => {
      const previous = useMyListStore.getState().customLists
      addAnimeToListLocal(listId, animeId)
      if (!canCallApi()) return
      try {
        await addUserCustomListItem(listId, animeId)
      } catch (error) {
        replaceCustomLists(previous)
        throw error
      }
    },
    onSuccess: () => invalidate(),
  })

  const removeAnimeMutation = useMutation({
    mutationFn: async ({
      listId,
      animeId,
    }: {
      listId: string
      animeId: string | number
    }) => {
      const previous = useMyListStore.getState().customLists
      removeAnimeFromListLocal(listId, animeId)
      if (!canCallApi()) return
      try {
        await removeUserCustomListItem(listId, animeId)
      } catch (error) {
        replaceCustomLists(previous)
        throw error
      }
    },
    onSuccess: () => invalidate(),
  })

  const createList = useCallback(
    async (name: string, icon: ShioriListIcon) => createListMutation.mutateAsync({ name, icon }),
    [createListMutation]
  )

  const updateList = useCallback(
    async (id: string, patch: Partial<Pick<ShioriCustomList, 'name' | 'icon'>>) =>
      updateListMutation.mutateAsync({ id, patch }),
    [updateListMutation]
  )

  const deleteList = useCallback(
    async (id: string) => deleteListMutation.mutateAsync(id),
    [deleteListMutation]
  )

  const addAnimeToList = useCallback(
    async (listId: string, animeId: string | number) =>
      addAnimeMutation.mutateAsync({ listId, animeId }),
    [addAnimeMutation]
  )

  const removeAnimeFromList = useCallback(
    async (listId: string, animeId: string | number) =>
      removeAnimeMutation.mutateAsync({ listId, animeId }),
    [removeAnimeMutation]
  )

  const reorderItems = useCallback(
    async (listId: string, animeIds: Array<string | number>) => {
      if (!canCallApi()) return
      await reorderUserCustomListItems(listId, animeIds)
      invalidate()
    },
    [invalidate]
  )

  const resolveListId = useCallback(
    (listId: string | null | undefined) => {
      if (!listId) return listId
      return listIdAliases[listId] ?? listId
    },
    [listIdAliases]
  )

  return {
    customLists,
    createList,
    updateList,
    deleteList,
    addAnimeToList,
    removeAnimeFromList,
    reorderItems,
    resolveListId,
    listIdAliases,
    isOffline,
    canSyncLists: listSyncEnabled,
    isRemoteLoading: remoteLoading,
    isMutating:
      createListMutation.isPending ||
      updateListMutation.isPending ||
      deleteListMutation.isPending ||
      addAnimeMutation.isPending ||
      removeAnimeMutation.isPending,
  }
}
