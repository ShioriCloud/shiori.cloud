import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ensureDevAppAuth, hasAppUserAuth } from '../lib/ensureDevAppAuth'
import {
  claimEpisodePackDownload,
  claimPaidEpisodeDownload,
  fetchSubscriptionMe,
  fetchSubscriptionPlans,
  type ClaimDownloadResult,
} from '../services/subscriptions'
import { queryKeys } from './queries/keys'

export function useSubscriptionMe(enabled = true) {
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
    queryKey: queryKeys.subscriptionMe,
    queryFn: fetchSubscriptionMe,
    enabled: enabled && authReady,
    staleTime: 30_000,
    retry: false,
  })
}

export function useSubscriptionPlans(enabled = true) {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans,
    queryFn: fetchSubscriptionPlans,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function useClaimPaidEpisodeDownload() {
  return useMutation({
    mutationFn: (episodeId: string) => claimPaidEpisodeDownload(episodeId),
  })
}

export function useClaimEpisodePackDownload() {
  return useMutation({
    mutationFn: (animeId: string) => claimEpisodePackDownload(animeId),
  })
}

export function useInvalidateSubscription() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionMe })
  }
}

export type { ClaimDownloadResult }
