import { ensureTelegramListAuth } from '../lib/ensureTelegramListAuth'
import { ensureDevAppAuth } from '../lib/ensureDevAppAuth'
import { shioriFetch } from '../lib/shioriApi'
import { resolveCatalogAnimeRecordId } from '../lib/resolveCatalogAnimeId'
import { assertUserAnimeListAuth } from '../lib/userListAuth'
import { getTelegramInitData } from '../lib/telegramRequestHeaders'
import type { ShioriListIcon } from '@/store/myListStore'

export type UserCustomListItemRow = {
  anime_id: string
  position: number
}

export type UserCustomListRow = {
  id: string
  name: string
  icon: ShioriListIcon | string
  created_at: string
  updated_at: string
  items: UserCustomListItemRow[]
}

const withListAuth = async <T>(fn: () => Promise<T>): Promise<T> => {
  await ensureDevAppAuth()
  await ensureTelegramListAuth()
  assertUserAnimeListAuth()
  return fn()
}

const resolveListAnimeId = async (animeId: number | string): Promise<string> => {
  const recordId = await resolveCatalogAnimeRecordId(animeId)
  return String(recordId)
}

export const getUserCustomLists = async (): Promise<UserCustomListRow[]> => {
  return withListAuth(async () => {
    const result = await shioriFetch<{ lists: UserCustomListRow[] }>('/user-custom-lists')
    return result.lists ?? []
  })
}

export const createUserCustomList = async (payload: {
  id?: string
  name: string
  icon?: ShioriListIcon
}): Promise<UserCustomListRow> => {
  return withListAuth(async () => {
    return shioriFetch<UserCustomListRow>('/user-custom-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: payload.id,
        name: payload.name,
        icon: payload.icon,
        telegram_init_data: getTelegramInitData() || undefined,
      }),
    })
  })
}

export const updateUserCustomList = async (
  listId: string,
  payload: { name?: string; icon?: ShioriListIcon }
): Promise<UserCustomListRow> => {
  return withListAuth(async () => {
    return shioriFetch<UserCustomListRow>(
      `/user-custom-lists/${encodeURIComponent(listId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
  })
}

export const deleteUserCustomList = async (listId: string): Promise<void> => {
  await withListAuth(async () => {
    await shioriFetch<{ ok?: boolean }>(
      `/user-custom-lists/${encodeURIComponent(listId)}`,
      { method: 'DELETE' }
    )
  })
}

export const addUserCustomListItem = async (
  listId: string,
  animeId: number | string
): Promise<UserCustomListRow> => {
  return withListAuth(async () => {
    const recordId = await resolveListAnimeId(animeId)
    return shioriFetch<UserCustomListRow>(
      `/user-custom-lists/${encodeURIComponent(listId)}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anime_id: recordId,
          telegram_init_data: getTelegramInitData() || undefined,
        }),
      }
    )
  })
}

export const removeUserCustomListItem = async (
  listId: string,
  animeId: number | string
): Promise<UserCustomListRow> => {
  return withListAuth(async () => {
    const recordId = await resolveListAnimeId(animeId)
    return shioriFetch<UserCustomListRow>(
      `/user-custom-lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(recordId)}`,
      { method: 'DELETE' }
    )
  })
}

export const reorderUserCustomListItems = async (
  listId: string,
  animeIds: Array<string | number>
): Promise<UserCustomListRow> => {
  return withListAuth(async () => {
    const recordIds = await Promise.all(animeIds.map((id) => resolveListAnimeId(id)))
    return shioriFetch<UserCustomListRow>(
      `/user-custom-lists/${encodeURIComponent(listId)}/items/order`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anime_ids: recordIds }),
      }
    )
  })
}
