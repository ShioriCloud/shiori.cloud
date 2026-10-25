/** Short Persian date for watch-status / list activity. */
export const formatStatusDateFa = (iso?: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
