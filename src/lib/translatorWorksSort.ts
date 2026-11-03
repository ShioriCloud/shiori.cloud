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

/** Newest anime release first (by start date, then year). */
export function sortTranslatorWorksNewestFirst<T extends TranslatorWorkSortable>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) => releaseSortKey(b) - releaseSortKey(a) || a.anime_id.localeCompare(b.anime_id)
  )
}
