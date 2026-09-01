import { resolveMediaServeUrl } from '@/lib/shioriApi'

/** Resolve boot-quote wallpaper URLs (API media paths need the API origin). */
export const resolveBootQuoteImage = (url: string | null | undefined): string =>
  resolveMediaServeUrl(String(url ?? '').trim())

/** Preload splash wallpaper; resolves false on missing URL or load error. */
export const preloadBootQuoteImage = (url: string): Promise<boolean> => {
  const resolved = resolveBootQuoteImage(url)
  if (!resolved) return Promise.resolve(false)

  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = resolved
  })
}
