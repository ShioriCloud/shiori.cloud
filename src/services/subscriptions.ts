import { shioriApiBaseUrl, shioriFetch } from '../lib/shioriApi'
import { getTelegramInitData } from '../lib/telegramRequestHeaders'
import { getTelegramMiniAppSessionHeaders } from '../lib/telegramSessionStorage'
import { ensureDevAppAuth } from '../lib/ensureDevAppAuth'

export type SubscriptionStatus = 'none' | 'active' | 'expired'

export type SubscriptionMe = {
  active: boolean
  expires_at: string | null
  status: SubscriptionStatus
}

export type SubscriptionPlan = {
  id: string
  days: number
  amount_irr: number
  label: string
  benefits: string[]
}

export type ClaimDownloadResult =
  | { ok: true; download_link: string }
  | { ok: false; code: 'subscription_required' | 'error'; message: string }

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

export const fetchSubscriptionMe = async (): Promise<SubscriptionMe> =>
  shioriFetch<SubscriptionMe>('/subscriptions/me')

export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const res = await shioriFetch<{ plans: SubscriptionPlan[] }>('/subscriptions/plans')
  return Array.isArray(res?.plans) ? res.plans : []
}

const parseClaimResponse = async (res: Response): Promise<ClaimDownloadResult> => {
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

  if (res.status === 403 || code === 'subscription_required') {
    return {
      ok: false,
      code: 'subscription_required',
      message: 'برای دانلود سافت‌ساب و هاردساب اشتراک لازم است',
    }
  }

  if (!res.ok) {
    return {
      ok: false,
      code: 'error',
      message:
        typeof body.message === 'string'
          ? body.message
          : typeof nested?.message === 'string'
            ? nested.message
            : text || res.statusText,
    }
  }

  const download_link =
    typeof body.download_link === 'string' ? body.download_link.trim() : ''
  if (!download_link) {
    return { ok: false, code: 'error', message: 'لینک دانلود برنگشت' }
  }
  return { ok: true, download_link }
}

export const claimPaidEpisodeDownload = async (
  episodeId: string
): Promise<ClaimDownloadResult> => {
  await ensureDevAppAuth()
  if (!shioriApiBaseUrl) {
    return { ok: false, code: 'error', message: 'API تنظیم نشده' }
  }
  const res = await fetch(
    `${shioriApiBaseUrl}/api/v1/subscriptions/episode-download/claim`,
    {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ episode_id: episodeId }),
    }
  )
  return parseClaimResponse(res)
}

export const claimEpisodePackDownload = async (
  animeId: string
): Promise<ClaimDownloadResult> => {
  await ensureDevAppAuth()
  if (!shioriApiBaseUrl) {
    return { ok: false, code: 'error', message: 'API تنظیم نشده' }
  }
  const res = await fetch(
    `${shioriApiBaseUrl}/api/v1/subscriptions/episode-pack/claim`,
    {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ anime_id: animeId }),
    }
  )
  return parseClaimResponse(res)
}
