import { formatUserFacingApiError } from '../services/userListErrors'
import { getTelegramInitData } from './telegramRequestHeaders'
import { getAppSessionHeaders } from './appSessionStorage'
import { getTelegramMiniAppSessionHeaders } from './telegramSessionStorage'

const rawBase = String(import.meta.env.VITE_SHIORI_API_URL ?? '').trim()

export const shioriApiBaseUrl = rawBase.replace(/\/$/, '')

export const isShioriApiEnabled = (): boolean => Boolean(shioriApiBaseUrl)

/** Rewrites /api/v1/media/serve/* URLs to the configured API origin. */
export const resolveMediaServeUrl = (url: string | null | undefined): string => {
  const raw = String(url ?? '').trim()
  if (!raw) return ''

  const serveMarker = '/api/v1/media/serve/'
  const markerIndex = raw.indexOf(serveMarker)
  if (markerIndex === -1) return raw

  const path = raw.slice(markerIndex)
  if (shioriApiBaseUrl) {
    return `${shioriApiBaseUrl}${path}`
  }

  return raw
}

const buildHeaders = (extra?: HeadersInit): HeadersInit => {
  const headers = new Headers(extra)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')

  const initData = getTelegramInitData()
  if (initData) headers.set('x-telegram-init-data', initData)

  // Prefer Telegram mini-app session; fall back to web email session.
  const sessionHeaders = {
    ...getAppSessionHeaders(),
    ...getTelegramMiniAppSessionHeaders(),
  }

  for (const [key, value] of Object.entries(sessionHeaders)) {
    headers.set(key, value)
  }

  return headers
}

const throwUserFacing = (technical: string, context?: string): never => {
  console.error('[shioriFetch]', context ?? technical, technical)
  throw new Error(formatUserFacingApiError(technical))
}

export async function shioriFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!shioriApiBaseUrl) {
    throwUserFacing(
      'VITE_SHIORI_API_URL تنظیم نشده. در .env آدرس shiori-api را قرار دهید (مثلاً http://localhost:4001).',
      'missing API base URL'
    )
  }

  const url = `${shioriApiBaseUrl}/api/v1${path.startsWith('/') ? path : `/${path}`}`
  const timeoutMs = 20_000
  const controller = new AbortController()
  const externalSignal = init?.signal
  const onAbort = () => controller.abort()
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort()
    else externalSignal.addEventListener('abort', onAbort, { once: true })
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: buildHeaders(init?.headers),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throwUserFacing(`API ${res.status}: ${text || res.statusText}`, path)
    }

    const text = await res.text()
    if (!text.trim()) {
      return undefined as T
    }

    return JSON.parse(text) as T
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throwUserFacing(`API timeout after ${timeoutMs}ms: ${path}`, path)
    }
    throw err
  } finally {
    clearTimeout(timer)
    if (externalSignal) externalSignal.removeEventListener('abort', onAbort)
  }
}
