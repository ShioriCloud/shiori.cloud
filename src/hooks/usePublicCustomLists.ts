import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ensureDevAppAuth, hasAppUserAuth } from '../lib/ensureDevAppAuth'
import {
  fetchPublicCustomList,
  fetchPublicCustomLists,
} from '../services/shioriCustomLists'
import { queryKeys } from './queries/keys'

function usePublicListsAuthReady(enabled: boolean) {
  const [authReady, setAuthReady] = useState(() => hasAppUserAuth())

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void ensureDevAppAuth().then((ok) => {
      if (!cancelled) setAuthReady(ok)
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return authReady
}

export function usePublicCustomListsQuery(
  telegramUserId: string | undefined,
  enabled = true
) {
  const authReady = usePublicListsAuthReady(enabled)
  const id = telegramUserId?.trim() ?? ''

  return useQuery({
    queryKey: queryKeys.publicCustomLists(id),
    queryFn: () => fetchPublicCustomLists(id),
    enabled: enabled && authReady && id.length > 0,
    staleTime: 60_000,
    retry: false,
  })
}

export function usePublicCustomListQuery(
  telegramUserId: string | undefined,
  listId: string | undefined,
  enabled = true
) {
  const authReady = usePublicListsAuthReady(enabled)
  const userId = telegramUserId?.trim() ?? ''
  const list = listId?.trim() ?? ''

  return useQuery({
    queryKey: queryKeys.publicCustomList(userId, list),
    queryFn: () => fetchPublicCustomList(userId, list),
    enabled: enabled && authReady && userId.length > 0 && list.length > 0,
    staleTime: 60_000,
    retry: false,
  })
}
