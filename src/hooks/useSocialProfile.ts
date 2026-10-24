import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { ensureDevAppAuth, hasAppUserAuth } from '../lib/ensureDevAppAuth'
import {
  fetchSocialFeed,
  fetchSocialFollowers,
  fetchSocialFollowing,
  fetchSocialProfileMe,
  fetchSocialProfileUser,
  followSocialUser,
  searchSocialUsers,
  unfollowSocialUser,
  updateSocialDisplayName,
  blockSocialUser,
  unblockSocialUser,
  muteSocialUser,
  unmuteSocialUser,
  fetchBlockedSocialUsers,
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

const feedNextPage = (last: Awaited<ReturnType<typeof fetchSocialFeed>>) => {
  if (!last.enabled) return undefined
  const loaded = last.page * last.limit
  if (loaded >= last.total) return undefined
  return last.page + 1
}

export function useSocialFeedInfinite(enabled = true, limit = 20) {
  const authReady = useSocialAuthReady(enabled)

  return useInfiniteQuery({
    queryKey: [...queryKeys.socialProfileFeed(1, limit), 'infinite'] as const,
    queryFn: ({ pageParam }) => fetchSocialFeed(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: feedNextPage,
    enabled: enabled && authReady,
    staleTime: 30_000,
    retry: false,
  })
}

const listNextPage = (
  last: Awaited<ReturnType<typeof fetchSocialFollowers>>
) => {
  if (!last.enabled) return undefined
  const loaded = last.page * last.limit
  if (loaded >= last.total) return undefined
  return last.page + 1
}

export function useSocialFollowListInfinite(
  telegramUserId: string | undefined,
  kind: 'followers' | 'following',
  enabled = true,
  limit = 30
) {
  const authReady = useSocialAuthReady(enabled)
  const id = telegramUserId?.trim() ?? ''

  return useInfiniteQuery({
    queryKey: [
      ...(kind === 'followers'
        ? queryKeys.socialProfileFollowers(id, 1, limit)
        : queryKeys.socialProfileFollowing(id, 1, limit)),
      'infinite',
    ] as const,
    queryFn: ({ pageParam }) =>
      kind === 'followers'
        ? fetchSocialFollowers(id, pageParam, limit)
        : fetchSocialFollowing(id, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: listNextPage,
    enabled: enabled && authReady && id.length > 0,
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

export function useSocialUserSearch(query: string, enabled = true) {
  const authReady = useSocialAuthReady(enabled)
  const q = query.trim()

  return useQuery({
    queryKey: queryKeys.socialProfileSearch(q),
    queryFn: () => searchSocialUsers(q),
    enabled: enabled && authReady && q.length >= 2,
    staleTime: 20_000,
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

export function useBlockedSocialUsers(enabled = true) {
  const authReady = useSocialAuthReady(enabled)

  return useQuery({
    queryKey: ['user-social-profile', 'blocks'] as const,
    queryFn: fetchBlockedSocialUsers,
    enabled: enabled && authReady,
    staleTime: 30_000,
    retry: false,
  })
}

export function useSocialModerationMutations(targetTelegramUserId: string | undefined) {
  const queryClient = useQueryClient()
  const targetId = targetTelegramUserId?.trim() ?? ''

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['user-social-profile'] })
    void queryClient.invalidateQueries({ queryKey: ['anime-comments'] })
  }, [queryClient])

  const block = useMutation({
    mutationFn: () => blockSocialUser(targetId),
    onSuccess: invalidate,
  })
  const unblock = useMutation({
    mutationFn: () => unblockSocialUser(targetId),
    onSuccess: invalidate,
  })
  const mute = useMutation({
    mutationFn: () => muteSocialUser(targetId),
    onSuccess: invalidate,
  })
  const unmute = useMutation({
    mutationFn: () => unmuteSocialUser(targetId),
    onSuccess: invalidate,
  })

  return {
    block,
    unblock,
    mute,
    unmute,
    isPending:
      block.isPending ||
      unblock.isPending ||
      mute.isPending ||
      unmute.isPending,
  }
}

export function useUpdateSocialDisplayName() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (displayName: string) => updateSocialDisplayName(displayName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-social-profile'] })
      void queryClient.invalidateQueries({ queryKey: ['anime-comments'] })
    },
  })
}
