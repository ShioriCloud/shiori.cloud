import { ensureDevAppAuth } from '../lib/ensureDevAppAuth'
import { ensureTelegramListAuth } from '../lib/ensureTelegramListAuth'
import { getTelegramInitData } from '../lib/telegramRequestHeaders'
import { readTelegramMiniAppSession } from '../lib/telegramSessionStorage'
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
  like_count: number
  liked_by_me: boolean
}

export type AnimeCommentActivity = AnimeComment & {
  anime: {
    id: string
    slug: string | null
    title: string
    image: string
  } | null
}

export type AnimeCommentList = {
  items: AnimeComment[]
  total: number
  page: number
  limit: number
}

const withCommentsAuth = async <T>(fn: () => Promise<T>): Promise<T> => {
  await ensureDevAppAuth()
  await ensureTelegramListAuth()
  return fn()
}

/** Same fallbacks as list/register when proxies strip auth headers. */
const authBodyFields = (): {
  telegram_init_data?: string
  app_session_token?: string
} => ({
  telegram_init_data: getTelegramInitData() || undefined,
  app_session_token: readTelegramMiniAppSession()?.token?.trim() || undefined,
})

export const fetchAnimeCommentsAccess = async (): Promise<{ enabled: boolean }> => {
  await ensureDevAppAuth()
  await ensureTelegramListAuth()
  return shioriFetch<{ enabled: boolean }>('/anime-comments/access')
}

export const fetchAnimeComments = async (
  animeId: string,
  params?: { parent_id?: string; page?: number; limit?: number }
): Promise<AnimeCommentList> =>
  withCommentsAuth(() =>
    shioriFetch<AnimeCommentList>(
      `/anime-comments/anime/${encodeURIComponent(animeId)}${buildQuery(params)}`
    )
  )

export const createAnimeComment = async (input: {
  anime_id: string
  body: string
  parent_id?: string
}): Promise<AnimeComment> =>
  withCommentsAuth(() =>
    shioriFetch<AnimeComment>('/anime-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        ...authBodyFields(),
      }),
    })
  )

export const deleteAnimeComment = async (commentId: string): Promise<{ ok: true }> =>
  withCommentsAuth(() =>
    shioriFetch<{ ok: true }>(`/anime-comments/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authBodyFields()),
    })
  )

export const likeAnimeComment = async (
  commentId: string
): Promise<{ ok: true; like_count: number; liked_by_me: boolean }> =>
  withCommentsAuth(() =>
    shioriFetch(`/anime-comments/${encodeURIComponent(commentId)}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authBodyFields()),
    })
  )

export const unlikeAnimeComment = async (
  commentId: string
): Promise<{ ok: true; like_count: number; liked_by_me: boolean }> =>
  withCommentsAuth(() =>
    shioriFetch(`/anime-comments/${encodeURIComponent(commentId)}/like`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authBodyFields()),
    })
  )

export const reportAnimeComment = async (commentId: string): Promise<{ ok: true }> =>
  withCommentsAuth(() =>
    shioriFetch(`/anime-comments/${encodeURIComponent(commentId)}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authBodyFields()),
    })
  )

export const fetchMyAnimeComments = async (
  page = 1,
  limit = 20
): Promise<{
  items: AnimeCommentActivity[]
  total: number
  page: number
  limit: number
}> =>
  withCommentsAuth(() =>
    shioriFetch(
      `/anime-comments/me?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
    )
  )

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
