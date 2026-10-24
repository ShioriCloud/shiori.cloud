export type ProfileTabId = 'stats' | 'feed' | 'personal'

export const PROFILE_TABS: ReadonlyArray<{ id: ProfileTabId; label: string }> = [
  { id: 'stats', label: 'آمار' },
  { id: 'feed', label: 'فید' },
  { id: 'personal', label: 'شخصی' },
]

/** Tabs on another user's profile (no personal). */
export const PUBLIC_PROFILE_TABS = PROFILE_TABS.filter((t) => t.id !== 'personal')

export const parseProfileTab = (raw: string | null): ProfileTabId => {
  if (raw === 'feed' || raw === 'personal' || raw === 'stats') return raw
  return 'stats'
}
