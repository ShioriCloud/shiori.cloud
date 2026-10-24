import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { ensureDevAppAuth, hasAppUserAuth } from '../lib/ensureDevAppAuth'
import {
  createAnimeComment,
  deleteAnimeComment,
  fetchAnimeComments,
  fetchAnimeCommentsAccess,
  fetchMyAnimeComments,
  likeAnimeComment,
  reportAnimeComment,
  unlikeAnimeComment,
  type AnimeCommentList,
} from '../services/animeComments'
import { queryKeys } from './queries/keys'

function useCommentsAuthReady(enabled: boolean) {
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

export function useAnimeCommentsAccess(enabled = true) {
  const authReady = useCommentsAuthReady(enabled)

  return useQuery({
    queryKey: queryKeys.animeCommentsAccess,
    queryFn: fetchAnimeCommentsAccess,
    enabled: enabled && authReady,
    staleTime: 60_000,
    retry: false,
  })
}

export function useAnimeCommentsQuery(
  animeId: string | undefined,
  enabled = true,
  parentId?: string,
  page = 1,
  limit = 20
) {
  const authReady = useCommentsAuthReady(enabled)
  const id = animeId?.trim() ?? ''

  return useQuery({
    queryKey: queryKeys.animeComments(id, parentId ?? null, page, limit),
    queryFn: () =>
      fetchAnimeComments(id, {
        parent_id: parentId,
        page,
        limit,
      }),
    enabled: enabled && authReady && id.length > 0,
    staleTime: 30_000,
  })
}

export function useAnimeCommentMutations(animeId: string | undefined) {
  const queryClient = useQueryClient()
  const id = animeId?.trim() ?? ''

  const invalidate = useCallback(() => {
    if (!id) return
    void queryClient.invalidateQueries({ queryKey: ['anime-comments', id] })
  }, [queryClient, id])

  const create = useMutation({
    mutationFn: createAnimeComment,
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: deleteAnimeComment,
    onSuccess: invalidate,
  })

  const like = useMutation({
    mutationFn: likeAnimeComment,
    onSuccess: invalidate,
  })

  const unlike = useMutation({
    mutationFn: unlikeAnimeComment,
    onSuccess: invalidate,
  })

  const report = useMutation({
    mutationFn: reportAnimeComment,
  })

  return { create, remove, like, unlike, report }
}

export function useMyAnimeCommentsQuery(enabled = true, page = 1, limit = 20) {
  const authReady = useCommentsAuthReady(enabled)

  return useQuery({
    queryKey: queryKeys.animeCommentsMine(page, limit),
    queryFn: () => fetchMyAnimeComments(page, limit),
    enabled: enabled && authReady,
    staleTime: 30_000,
  })
}

export type { AnimeCommentList }
