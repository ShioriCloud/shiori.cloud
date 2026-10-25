export type ProfileTabId = 'stats' | 'personal'

export const PROFILE_TABS: ReadonlyArray<{ id: ProfileTabId; label: string }> = [
  { id: 'stats', label: 'آمار' },
  { id: 'personal', label: 'شخصی' },
]

/** Tabs on another user's profile (no personal). */
export const PUBLIC_PROFILE_TABS: ReadonlyArray<{ id: ProfileTabId; label: string }> = [
  { id: 'stats', label: 'آمار' },
]

export const parseProfileTab = (raw: string | null): ProfileTabId => {
  if (raw === 'personal') return 'personal'
  return 'stats'
}
