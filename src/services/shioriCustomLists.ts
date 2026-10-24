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
  is_public?: boolean
  created_at: string
  updated_at: string
  items: UserCustomListItemRow[]
}

export type PublicCustomListSummary = {
  id: string
  name: string
  icon: ShioriListIcon | string
  item_count: number
  updated_at: string
}

export type PublicCustomListDetail = PublicCustomListSummary & {
  items: Array<{
    anime_id: string
    slug: string | null
    title: string
    image: string
    position: number
  }>
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

export const fetchPublicCustomLists = async (
  telegramUserId: string
): Promise<{ enabled: boolean; lists: PublicCustomListSummary[] }> =>
  withListAuth(() =>
    shioriFetch(
      `/user-custom-lists/users/${encodeURIComponent(telegramUserId)}/public`
    )
  )

export const fetchPublicCustomList = async (
  telegramUserId: string,
  listId: string
): Promise<{ enabled: boolean; list: PublicCustomListDetail | null }> =>
  withListAuth(() =>
    shioriFetch(
      `/user-custom-lists/users/${encodeURIComponent(telegramUserId)}/public/${encodeURIComponent(listId)}`
    )
  )

export const updateUserCustomList = async (
  listId: string,
  payload: { name?: string; icon?: ShioriListIcon; is_public?: boolean }
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
