import { ensureTelegramListAuth } from '../lib/ensureTelegramListAuth'
import { shioriFetch } from '../lib/shioriApi'
import { resolveCatalogAnimeRecordId } from '../lib/resolveCatalogAnimeId'
import { assertUserAnimeListAuth } from '../lib/userListAuth'
import { getTelegramInitData } from '../lib/telegramRequestHeaders'
import type {
  AnimeFavoriteCountMap,
  UserAnimeListRow,
} from '../utils/userListStats'

const resolveListAnimeId = async (animeId: number | string): Promise<string> => {
  const recordId = await resolveCatalogAnimeRecordId(animeId)
  return String(recordId)
}

const withListAuth = async <T>(fn: () => Promise<T>): Promise<T> => {
  await ensureTelegramListAuth()
  assertUserAnimeListAuth()
  return fn()
}

export const getUserAnimeList = async (
  _telegramUserId: number
): Promise<UserAnimeListRow[]> => {
  return withListAuth(async () => {
    const result = await shioriFetch<{ items: UserAnimeListRow[] }>('/user-anime-list')
    return result.items ?? []
  })
}

export const upsertUserAnimeListEntry = async (
  _telegramUserId: number,
  animeId: number | string,
  payload: {
    episodes_watched?: number
    user_rating?: number | null
  }
): Promise<void> => {
  await withListAuth(async () => {
    const recordId = await resolveListAnimeId(animeId)
    await shioriFetch('/user-anime-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anime_id: recordId,
        episodes_watched: payload.episodes_watched,
        user_rating: payload.user_rating,
        telegram_init_data: getTelegramInitData() || undefined,
      }),
    })
  })
}

export const removeUserAnimeListEntry = async (
  _telegramUserId: number,
  animeId: number | string
): Promise<void> => {
  await withListAuth(async () => {
    const recordId = await resolveListAnimeId(animeId)
    await shioriFetch(`/user-anime-list/${encodeURIComponent(recordId)}`, {
      method: 'DELETE',
    })
  })
}

export const getAnimeFavoriteCounts = async (): Promise<AnimeFavoriteCountMap> =>
  shioriFetch<AnimeFavoriteCountMap>('/anime-catalog/favorite-counts')

export const getAnimeFavoriteCount = async (animeId: number | string): Promise<number> => {
  const recordId = await resolveCatalogAnimeRecordId(animeId)
  const count = await shioriFetch<number>(
    `/anime-catalog/${encodeURIComponent(String(recordId))}/favorite-count`
  )
  return Number(count) || 0
}
