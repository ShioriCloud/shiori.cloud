import { shioriFetch } from '../lib/shioriApi'
import { getTelegramInitData } from '../lib/telegramRequestHeaders'
import { writeTelegramMiniAppSession } from '../lib/telegramSessionStorage'
import type { TelegramUserPayload } from '../types/telegramUser'

type RegisterTelegramUserResponse = {
  ok: boolean
  session_token?: string
  expires_at?: string
}

export const registerTelegramUserVisit = async (user: TelegramUserPayload): Promise<void> => {
  if (!user?.id) return

  const result = await shioriFetch<RegisterTelegramUserResponse>('/telegram-users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_user_id: user.id,
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? null,
      username: user.username?.trim() || null,
      language_code: user.language_code ?? null,
      photo_url: user.photo_url ?? null,
      is_premium: user.is_premium ?? false,
      telegram_init_data: getTelegramInitData() || undefined,
    }),
  })

  if (result.session_token && result.expires_at) {
    writeTelegramMiniAppSession({
      token: result.session_token,
      expiresAt: result.expires_at,
    })
  }
}
