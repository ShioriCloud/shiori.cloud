export type ProfileTabId = 'stats' | 'playlists' | 'personal'

export const PROFILE_TAB_STATS = { id: 'stats' as const, label: 'آمار' }
export const PROFILE_TAB_PLAYLISTS = { id: 'playlists' as const, label: 'پلی‌لیست‌ها' }
export const PROFILE_TAB_PERSONAL = { id: 'personal' as const, label: 'شخصی' }

export type ProfileTabConfig = { id: ProfileTabId; label: string }

export const buildOwnProfileTabs = (hasPublicPlaylists: boolean): ProfileTabConfig[] => {
  const tabs: ProfileTabConfig[] = [PROFILE_TAB_STATS]
  if (hasPublicPlaylists) tabs.push(PROFILE_TAB_PLAYLISTS)
  tabs.push(PROFILE_TAB_PERSONAL)
  return tabs
}

export const buildPublicProfileTabs = (hasPublicPlaylists: boolean): ProfileTabConfig[] => {
  const tabs: ProfileTabConfig[] = [PROFILE_TAB_STATS]
  if (hasPublicPlaylists) tabs.push(PROFILE_TAB_PLAYLISTS)
  return tabs
}

/** @deprecated use buildOwnProfileTabs */
export const PROFILE_TABS = buildOwnProfileTabs(false)

export const parseProfileTab = (raw: string | null): ProfileTabId => {
  if (raw === 'playlists' || raw === 'personal' || raw === 'stats') return raw
  return 'stats'
}
