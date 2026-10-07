export const FORMAT_LABELS: Record<string, string> = {
  TV: 'سریال',
  MOVIE: 'سینمایی',
  OVA: 'OVA',
  ONA: 'ONA',
  SPECIAL: 'ویژه',
  MUSIC: 'موزیک',
  OTHER: 'سایر',
}

export const formatLabel = (raw: string): string =>
  FORMAT_LABELS[String(raw).trim().toUpperCase()] ??
  FORMAT_LABELS[raw] ??
  raw

/** Preferred order for overview format chips. */
export const FORMAT_ORDER = [
  'TV',
  'MOVIE',
  'OVA',
  'ONA',
  'SPECIAL',
  'MUSIC',
  'OTHER',
] as const

export type FormatBreakdownRow = {
  format: string
  count: number
  episodes_watched: number
}

export const sortFormats = (rows: FormatBreakdownRow[]): FormatBreakdownRow[] => {
  const rank = new Map(FORMAT_ORDER.map((f, i) => [f, i]))
  return [...rows].sort((a, b) => {
    const ra = rank.get(a.format.toUpperCase() as (typeof FORMAT_ORDER)[number]) ?? 99
    const rb = rank.get(b.format.toUpperCase() as (typeof FORMAT_ORDER)[number]) ?? 99
    if (ra !== rb) return ra - rb
    return b.count - a.count
  })
}
