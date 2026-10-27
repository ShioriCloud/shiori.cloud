export type ProfileTabId =
  | 'activity'
  | 'stats'
  | 'personal'
  | 'watching'
  | 'favorites'
  | 'playlists'

export const DEFAULT_PROFILE_TAB: ProfileTabId = 'stats'

export type ProfileTabConfig = { id: ProfileTabId; label: string }

export const PROFILE_TAB_ACTIVITY: ProfileTabConfig = {
  id: 'activity',
  label: 'آخرین فعالیت‌ها',
}
export const PROFILE_TAB_STATS: ProfileTabConfig = { id: 'stats', label: 'آمار' }
export const PROFILE_TAB_PERSONAL: ProfileTabConfig = { id: 'personal', label: 'شخصی' }
export const PROFILE_TAB_WATCHING: ProfileTabConfig = { id: 'watching', label: 'درحال تماشا' }
export const PROFILE_TAB_FAVORITES: ProfileTabConfig = {
  id: 'favorites',
  label: 'علاقه‌مندی‌ها',
}
export const PROFILE_TAB_PLAYLISTS: ProfileTabConfig = { id: 'playlists', label: 'پلی‌لیست‌ها' }

export const PROFILE_TAB_ROW_PRIMARY: ProfileTabConfig[] = [
  PROFILE_TAB_ACTIVITY,
  PROFILE_TAB_STATS,
]

export const buildProfileTabRowLibrary = (
  isOwnProfile: boolean,
  hasPublicPlaylists = false
): ProfileTabConfig[] => {
  const tabs: ProfileTabConfig[] = []
  if (isOwnProfile) tabs.push(PROFILE_TAB_PERSONAL)
  tabs.push(PROFILE_TAB_WATCHING, PROFILE_TAB_FAVORITES)
  if (!isOwnProfile && hasPublicPlaylists) tabs.push(PROFILE_TAB_PLAYLISTS)
  return tabs
}

export const buildPublicProfileTabRowLibrary = (
  hasPublicPlaylists: boolean
): ProfileTabConfig[] => buildProfileTabRowLibrary(false, hasPublicPlaylists)

export const buildOwnProfileTabRowLibrary = (): ProfileTabConfig[] =>
  buildProfileTabRowLibrary(true, false)

/** @deprecated use PROFILE_TAB_ROW_PRIMARY + buildOwnProfileTabRowLibrary */
export const buildOwnProfileTabs = (hasPublicPlaylists: boolean): ProfileTabConfig[] => [
  ...PROFILE_TAB_ROW_PRIMARY,
  ...buildOwnProfileTabRowLibrary(),
  ...(hasPublicPlaylists ? [PROFILE_TAB_PLAYLISTS] : []),
]

/** @deprecated */
export const buildPublicProfileTabs = (hasPublicPlaylists: boolean): ProfileTabConfig[] => {
  return [
    ...PROFILE_TAB_ROW_PRIMARY,
    ...buildPublicProfileTabRowLibrary(hasPublicPlaylists),
  ]
}

export const PROFILE_TABS = buildOwnProfileTabs(false)

const KNOWN_TABS: ProfileTabId[] = [
  'activity',
  'stats',
  'personal',
  'watching',
  'favorites',
  'playlists',
]

export const parseProfileTab = (raw: string | null): ProfileTabId => {
  if (raw && (KNOWN_TABS as string[]).includes(raw)) return raw as ProfileTabId
  return DEFAULT_PROFILE_TAB
}

export const isAllowedProfileTab = (
  tab: ProfileTabId,
  ctx: { isOwnProfile: boolean; hasPublicPlaylists: boolean }
): boolean => {
  if (tab === 'personal' && !ctx.isOwnProfile) return false
  if (tab === 'playlists' && !ctx.hasPublicPlaylists) return false
  return KNOWN_TABS.includes(tab)
}
