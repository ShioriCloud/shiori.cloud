/** Shared localStorage cache for catalog queries (stale-while-revalidate). */

export type LocalCacheEntry<T> = {
  ts: number
  data: T
}

export const peekLocalCache = <T>(
  key: string,
  opts?: {
    maxAgeMs?: number
    isUsable?: (data: T) => boolean
  }
): LocalCacheEntry<T> | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LocalCacheEntry<T>>
    if (!parsed || typeof parsed.ts !== 'number' || !Number.isFinite(parsed.ts)) {
      return null
    }
    if (parsed.data === undefined) return null
    if (opts?.isUsable && !opts.isUsable(parsed.data as T)) return null
    if (typeof opts?.maxAgeMs === 'number' && Date.now() - parsed.ts > opts.maxAgeMs) {
      return null
    }
    return { ts: parsed.ts, data: parsed.data as T }
  } catch {
    return null
  }
}

export const writeLocalCache = <T>(
  key: string,
  data: T,
  isUsable?: (data: T) => boolean
): void => {
  if (isUsable && !isUsable(data)) return
  try {
    const entry: LocalCacheEntry<T> = { ts: Date.now(), data }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // quota / private mode
  }
}

/**
 * Network-first when React Query invokes the fetcher.
 * On failure, returns any persisted entry (even past soft TTL).
 */
export const fetchWithLocalCache = async <T>(options: {
  key: string
  fetch: () => Promise<T>
  isUsable: (data: T) => boolean
}): Promise<T> => {
  const cached = peekLocalCache<T>(options.key, { isUsable: options.isUsable })

  try {
    const data = await options.fetch()
    if (options.isUsable(data)) {
      writeLocalCache(options.key, data, options.isUsable)
      return data
    }
    if (cached) return cached.data
    return data
  } catch (error) {
    if (cached) return cached.data
    throw error
  }
}
