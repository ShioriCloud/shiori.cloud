import { shioriFetch, isShioriApiEnabled } from '@/lib/shioriApi'
import {
  BOOT_QUOTES,
  type BootQuote,
  readCachedBootQuotes,
  writeCachedBootQuotes,
} from '@/data/bootQuotes'

type BootQuotesApiResponse = {
  quotes?: Array<{ text?: string; attribution?: string }>
}

const normalizeQuotes = (
  rows: Array<{ text?: string; attribution?: string }> | undefined
): BootQuote[] => {
  if (!Array.isArray(rows)) return []
  return rows
    .map((row) => ({
      text: String(row?.text ?? '').trim(),
      attribution: String(row?.attribution ?? '').trim(),
    }))
    .filter((row) => row.text.length > 0 && row.attribution.length > 0)
}

/** Quotes for the current splash: cached API list if present, else built-in fallback. */
export function getBootQuotePool(): readonly BootQuote[] {
  const cached = readCachedBootQuotes()
  return cached.length > 0 ? cached : BOOT_QUOTES
}

/** Refresh local cache from API (fire-and-forget safe). */
export async function refreshBootQuotesCache(): Promise<BootQuote[]> {
  if (!isShioriApiEnabled()) return [...BOOT_QUOTES]

  try {
    const payload = await shioriFetch<BootQuotesApiResponse>('/boot-quotes')
    const quotes = normalizeQuotes(payload?.quotes)
    if (quotes.length > 0) {
      writeCachedBootQuotes(quotes)
      return quotes
    }
  } catch {
    // keep cache / fallback
  }

  const cached = readCachedBootQuotes()
  return cached.length > 0 ? cached : [...BOOT_QUOTES]
}
