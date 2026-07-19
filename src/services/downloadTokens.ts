import { shioriApiBaseUrl, shioriFetch } from '../lib/shioriApi'
import { getTelegramInitData } from '../lib/telegramRequestHeaders'
import { getTelegramMiniAppSessionHeaders } from '../lib/telegramSessionStorage'

export type DonationTokenTier = {
  amount_irr: number
  tokens: number
}

export type DownloadTokenBalance = {
  balance: number
}

export type ClaimFreeDownloadResult =
  | { ok: true; balance: number; download_link: string }
  | { ok: false; code: 'insufficient_tokens'; balance: number }
  | { ok: false; code: 'error'; message: string }

const buildAuthHeaders = (): Headers => {
  const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' })
  const initData = getTelegramInitData()
  if (initData) headers.set('x-telegram-init-data', initData)
  const sessionHeaders = getTelegramMiniAppSessionHeaders()
  for (const [key, value] of Object.entries(sessionHeaders)) {
    headers.set(key, value)
  }
  return headers
}

export const fetchDownloadTokenBalance = async (): Promise<DownloadTokenBalance> =>
  shioriFetch<DownloadTokenBalance>('/download-tokens/balance')

export const fetchDonationTokenTiers = async (): Promise<DonationTokenTier[]> => {
  const res = await shioriFetch<{ tiers: DonationTokenTier[] }>('/download-tokens/tiers')
  return Array.isArray(res?.tiers) ? res.tiers : []
}

export const claimFreeDownload = async (
  episodeId: string
): Promise<ClaimFreeDownloadResult> => {
  if (!shioriApiBaseUrl) {
    return { ok: false, code: 'error', message: 'API تنظیم نشده' }
  }

  const url = `${shioriApiBaseUrl}/api/v1/download-tokens/free-download/claim`
  const res = await fetch(url, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ episode_id: episodeId }),
  })

  const text = await res.text().catch(() => '')
  let body: Record<string, unknown> = {}
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    body = {}
  }

  const nested =
    body.message && typeof body.message === 'object'
      ? (body.message as Record<string, unknown>)
      : null
  const code = body.code ?? nested?.code
  const balanceRaw = body.balance ?? nested?.balance

  if (res.status === 402 || code === 'insufficient_tokens') {
    return {
      ok: false,
      code: 'insufficient_tokens',
      balance: typeof balanceRaw === 'number' ? balanceRaw : 0,
    }
  }

  if (!res.ok) {
    const message =
      typeof body.message === 'string'
        ? body.message
        : typeof nested?.message === 'string'
          ? nested.message
          : text || res.statusText
    return {
      ok: false,
      code: 'error',
      message,
    }
  }

  const balance = typeof body.balance === 'number' ? body.balance : 0
  const download_link =
    typeof body.download_link === 'string' ? body.download_link.trim() : ''
  if (!download_link) {
    return { ok: false, code: 'error', message: 'لینک دانلود برنگشت' }
  }

  return { ok: true, balance, download_link }
}
