/** Matches API `SOCIAL_BADGE_NEW_MS` (14 days). */
export const BADGE_NEW_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

export function isBadgeNew(badge: {
  is_new?: boolean
  earned_at?: string | null
}): boolean {
  if (badge.earned_at) {
    const earnedAt = Date.parse(badge.earned_at)
    if (!Number.isNaN(earnedAt) && Date.now() - earnedAt > BADGE_NEW_MAX_AGE_MS) {
      return false
    }
  }
  return badge.is_new === true
}
