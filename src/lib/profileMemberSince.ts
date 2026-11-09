/** ماه سپس سال، مثل «آبان ۱۴۰۵». */
export const formatProfileMonthYear = (iso?: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const month = new Intl.DateTimeFormat('fa-IR', {
    month: 'long',
    calendar: 'persian',
  }).format(date)
  const year = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    calendar: 'persian',
  }).format(date)
  return `${month} ${year}`
}

export const formatProfileMemberSince = (iso?: string | null): string | null => {
  const joined = formatProfileMonthYear(iso)
  return joined ? `از ${joined} اینجاست` : null
}
