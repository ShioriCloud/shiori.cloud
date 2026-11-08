export type TranslatorWorkSortable = {
  anime_id: string
  start_date?: string | null
  year?: number | null
}

const releaseSortKey = (item: TranslatorWorkSortable): number => {
  if (item.start_date) {
    const t = Date.parse(item.start_date)
    if (!Number.isNaN(t)) return t
  }
  if (item.year != null && item.year > 0) return item.year * 10000 + 601
  return 0
}

export type TranslatorWorkScored = {
  anime_id: string
  anilist_score?: number | null
}

const anilistScore = (item: TranslatorWorkScored): number | null => {
  const score = item.anilist_score
  return typeof score === 'number' && Number.isFinite(score) ? score : null
}

/** Highest AniList score first. Unscored titles keep their incoming order. */
export function sortTranslatorWorksByAnilistScore<T extends TranslatorWorkScored>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const sa = anilistScore(a)
    const sb = anilistScore(b)
    if (sa == null && sb == null) return 0
    if (sa == null) return 1
    if (sb == null) return -1
    return sb - sa || a.anime_id.localeCompare(b.anime_id)
  })
}

/** Newest anime release first (by start date, then year). */
export function sortTranslatorWorksNewestFirst<T extends TranslatorWorkSortable>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) => releaseSortKey(b) - releaseSortKey(a) || a.anime_id.localeCompare(b.anime_id)
  )
}
