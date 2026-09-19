import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  claimFreeDownload,
  fetchDonationTokenTiers,
  fetchDownloadTokenBalance,
  fetchDownloadTokenWallet,
  type ClaimFreeDownloadResult,
} from '../services/downloadTokens'
import { ensureDevAppAuth, hasAppUserAuth } from '../lib/ensureDevAppAuth'
import { queryKeys } from './queries/keys'

export function useDownloadTokenBalance(enabled = true) {
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
    queryKey: queryKeys.downloadTokenBalance,
    queryFn: fetchDownloadTokenBalance,
    enabled: enabled && authReady,
    staleTime: 30_000,
    retry: false,
  })
}

export function useDownloadTokenWallet(enabled = true) {
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
    queryKey: queryKeys.downloadTokenWallet,
    queryFn: fetchDownloadTokenWallet,
    enabled: enabled && authReady,
    staleTime: 30_000,
    retry: false,
  })
}

export function useDonationTokenTiers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.donationTokenTiers,
    queryFn: fetchDonationTokenTiers,
    enabled,
    staleTime: 5 * 60_000,
  })
}

export function useClaimFreeDownload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (episodeId: string) => {
      await ensureDevAppAuth()
      return claimFreeDownload(episodeId)
    },
    onSuccess: (result: ClaimFreeDownloadResult) => {
      if (result.ok) {
        queryClient.setQueryData(queryKeys.downloadTokenBalance, {
          balance: result.balance,
        })
        queryClient.setQueryData(queryKeys.downloadTokenWallet, (prev: unknown) => {
          if (!prev || typeof prev !== 'object') return prev
          return { ...(prev as Record<string, unknown>), balance: result.balance }
        })
        return
      }
      if (result.code === 'insufficient_tokens') {
        queryClient.setQueryData(queryKeys.downloadTokenBalance, {
          balance: result.balance,
        })
        queryClient.setQueryData(queryKeys.downloadTokenWallet, (prev: unknown) => {
          if (!prev || typeof prev !== 'object') return prev
          return { ...(prev as Record<string, unknown>), balance: result.balance }
        })
      }
    },
  })
}
