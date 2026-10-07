import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { ensureDevAppAuth, hasAppUserAuth } from '../lib/ensureDevAppAuth'
import {
  fetchSocialFeed,
  fetchSocialFollowers,
  fetchSocialFollowing,
  fetchSocialProfileMe,
  fetchSocialProfileUser,
  followSocialUser,
  unfollowSocialUser,
} from '../services/socialProfile'
import { queryKeys } from './queries/keys'

function useSocialAuthReady(enabled: boolean) {
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

export function useSocialProfileMe(enabled = true, page = 1, limit = 60) {
  const authReady = useSocialAuthReady(enabled)

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
  const authReady = useSocialAuthReady(enabled)
  const id = telegramUserId?.trim() ?? ''

  return useQuery({
    queryKey: [...queryKeys.socialProfileUser(id), page, limit],
    queryFn: () => fetchSocialProfileUser(id, page, limit),
    enabled: enabled && authReady && id.length > 0,
    staleTime: 60_000,
    retry: false,
  })
}

export function useSocialFeed(enabled = true, page = 1, limit = 30) {
  const authReady = useSocialAuthReady(enabled)

  return useQuery({
    queryKey: queryKeys.socialProfileFeed(page, limit),
    queryFn: () => fetchSocialFeed(page, limit),
    enabled: enabled && authReady,
    staleTime: 30_000,
    retry: false,
  })
}

export function useSocialFollowList(
  telegramUserId: string | undefined,
  kind: 'followers' | 'following',
  enabled = true,
  page = 1,
  limit = 30
) {
  const authReady = useSocialAuthReady(enabled)
  const id = telegramUserId?.trim() ?? ''

  return useQuery({
    queryKey:
      kind === 'followers'
        ? queryKeys.socialProfileFollowers(id, page, limit)
        : queryKeys.socialProfileFollowing(id, page, limit),
    queryFn: () =>
      kind === 'followers'
        ? fetchSocialFollowers(id, page, limit)
        : fetchSocialFollowing(id, page, limit),
    enabled: enabled && authReady && id.length > 0,
    staleTime: 30_000,
    retry: false,
  })
}

export function useSocialFollowMutation(targetTelegramUserId: string | undefined) {
  const queryClient = useQueryClient()
  const targetId = targetTelegramUserId?.trim() ?? ''

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['user-social-profile'] })
  }, [queryClient])

  const follow = useMutation({
    mutationFn: () => followSocialUser(targetId),
    onSuccess: invalidate,
  })

  const unfollow = useMutation({
    mutationFn: () => unfollowSocialUser(targetId),
    onSuccess: invalidate,
  })

  return { follow, unfollow, isPending: follow.isPending || unfollow.isPending }
}
