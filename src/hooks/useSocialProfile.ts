import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ensureDevAppAuth, hasAppUserAuth } from '../lib/ensureDevAppAuth'
import { fetchSocialProfileMe, fetchSocialProfileUser } from '../services/socialProfile'
import { queryKeys } from './queries/keys'

export function useSocialProfileMe(enabled = true, page = 1, limit = 60) {
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

  return useQuery({
    queryKey: [...queryKeys.socialProfileMe, page, limit],
    queryFn: () => fetchSocialProfileMe(page, limit),
    enabled: enabled && authReady,
    staleTime: 60_000,
    retry: false,
  })
}

export function useSocialProfileUser(
  telegramUserId: string | undefined,
  enabled = true,
  page = 1,
  limit = 60
) {
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

  const id = telegramUserId?.trim() ?? ''

  return useQuery({
    queryKey: [...queryKeys.socialProfileUser(id), page, limit],
    queryFn: () => fetchSocialProfileUser(id, page, limit),
    enabled: enabled && authReady && id.length > 0,
    staleTime: 60_000,
    retry: false,
  })
}
