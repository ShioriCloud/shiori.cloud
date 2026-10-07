export const FORMAT_LABELS: Record<string, string> = {
  TV: 'سریال',
  MOVIE: 'سینمایی',
  SPECIAL: 'ویژه',
  DONGHUA: 'دونگهوا',
  MUSIC: 'موزیک',
  OTHER: 'سایر',
  // legacy / raw keys still may appear from older payloads
  OVA: 'ویژه',
  ONA: 'دونگهوا',
  'ONA (CHINESE)': 'دونگهوا',
}

export const formatLabel = (raw: string): string => {
  const key = String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
  if (FORMAT_LABELS[key]) return FORMAT_LABELS[key]
  if (key.includes('CHINESE') || key === 'DONGHUA') return 'دونگهوا'
  if (key === 'OVA' || key === 'SPECIAL') return 'ویژه'
  return raw
}

/** Preferred order for overview format chips. */
export const FORMAT_ORDER = [
  'TV',
  'MOVIE',
  'SPECIAL',
  'DONGHUA',
  'MUSIC',
  'OTHER',
] as const

export type FormatBreakdownRow = {
  format: string
  count: number
  episodes_watched: number
}

const EPISODE_MINUTES = 24
const MOVIE_MINUTES = 90

export const normalizeOverviewFormat = (raw: string): string => {
  const key = String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
  if (key === 'TV' || key === 'TV_SHORT' || key === 'TV SHORT') return 'TV'
  if (key === 'MOVIE' || key === 'FILM') return 'MOVIE'
  if (key === 'OVA' || key === 'SPECIAL') return 'SPECIAL'
  if (
    key === 'ONA' ||
    key === 'ONA (CHINESE)' ||
    key === 'ONA(CHINESE)' ||
    key === 'DONGHUA' ||
    key.includes('CHINESE')
  ) {
    return 'DONGHUA'
  }
  if (key === 'MUSIC') return 'MUSIC'
  if (FORMAT_ORDER.includes(key as (typeof FORMAT_ORDER)[number])) return key
  return 'OTHER'
}

export const mergeFormatRows = (
  rows: FormatBreakdownRow[],
): FormatBreakdownRow[] => {
  const map = new Map<string, FormatBreakdownRow>()
  for (const row of rows) {
    const format = normalizeOverviewFormat(row.format)
    const prev = map.get(format)
    if (prev) {
      prev.count += row.count
      prev.episodes_watched += row.episodes_watched
    } else {
      map.set(format, {
        format,
        count: row.count,
        episodes_watched: row.episodes_watched,
      })
    }
  }
  return [...map.values()]
}

export const minutesForFormatRow = (row: FormatBreakdownRow): number => {
  const format = normalizeOverviewFormat(row.format)
  const eps = Math.max(0, row.episodes_watched || 0)
  if (format === 'MOVIE') return eps * MOVIE_MINUTES
  return eps * EPISODE_MINUTES
}

export const sortFormats = (rows: FormatBreakdownRow[]): FormatBreakdownRow[] => {
  const merged = mergeFormatRows(rows)
  const rank = new Map(FORMAT_ORDER.map((f, i) => [f, i]))
  return merged.sort((a, b) => {
    const ra = rank.get(a.format as (typeof FORMAT_ORDER)[number]) ?? 99
    const rb = rank.get(b.format as (typeof FORMAT_ORDER)[number]) ?? 99
    if (ra !== rb) return ra - rb
    return b.count - a.count
  })
}

export const FORMAT_ACCENT: Record<string, string> = {
  TV: 'bg-primary-400',
  MOVIE: 'bg-amber-400',
  SPECIAL: 'bg-violet-400',
  DONGHUA: 'bg-sky-400',
  MUSIC: 'bg-rose-400',
  OTHER: 'bg-muted-foreground/50',
}

export const FORMAT_STROKE: Record<string, string> = {
  TV: 'stroke-primary-400',
  MOVIE: 'stroke-amber-400',
  SPECIAL: 'stroke-violet-400',
  DONGHUA: 'stroke-sky-400',
  MUSIC: 'stroke-rose-400',
  OTHER: 'stroke-muted-foreground/50',
}
