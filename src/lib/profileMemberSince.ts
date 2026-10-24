export const formatProfileMemberSince = (iso?: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const joined = date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })
  return `از ${joined} اینجاست`
}
