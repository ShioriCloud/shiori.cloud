import { shioriFetch } from '../lib/shioriApi'

export type AnimeCommentAuthor = {
  telegram_user_id: string
  display_name: string
  username: string | null
  photo_url: string | null
}

export type AnimeComment = {
  id: string
  anime_id: string
  parent_id: string | null
  body: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  is_own: boolean
  author: AnimeCommentAuthor
  reply_count: number
}

export type AnimeCommentList = {
  items: AnimeComment[]
  total: number
  page: number
  limit: number
}

export const fetchAnimeComments = async (
  animeId: string,
  params?: { parent_id?: string; page?: number; limit?: number }
): Promise<AnimeCommentList> =>
  shioriFetch<AnimeCommentList>(
    `/anime-comments/anime/${encodeURIComponent(animeId)}${buildQuery(params)}`
  )

export const createAnimeComment = async (input: {
  anime_id: string
  body: string
  parent_id?: string
}): Promise<AnimeComment> =>
  shioriFetch<AnimeComment>('/anime-comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

export const deleteAnimeComment = async (commentId: string): Promise<{ ok: true }> =>
  shioriFetch<{ ok: true }>(`/anime-comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  })

const buildQuery = (params?: {
  parent_id?: string
  page?: number
  limit?: number
}): string => {
  if (!params) return ''
  const qs = new URLSearchParams()
  if (params.parent_id) qs.set('parent_id', params.parent_id)
  if (params.page != null) qs.set('page', String(params.page))
  if (params.limit != null) qs.set('limit', String(params.limit))
  const s = qs.toString()
  return s ? `?${s}` : ''
}
