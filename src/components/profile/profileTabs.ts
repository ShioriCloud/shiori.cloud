export type ProfileTabId = 'library' | 'activity' | 'stats'

export type ProfileLibrarySectionId = 'watching' | 'favorites' | 'playlists'

export const DEFAULT_PROFILE_TAB: ProfileTabId = 'library'

export type ProfileTabConfig = { id: ProfileTabId; label: string }

export const PROFILE_TAB_LIBRARY: ProfileTabConfig = { id: 'library', label: 'کتابخانه' }
export const PROFILE_TAB_ACTIVITY: ProfileTabConfig = {
  id: 'activity',
  label: 'فعالیت',
}
export const PROFILE_TAB_STATS: ProfileTabConfig = { id: 'stats', label: 'آمار و نشان‌ها' }

export const PROFILE_MAIN_TABS: ProfileTabConfig[] = [
  PROFILE_TAB_LIBRARY,
  PROFILE_TAB_ACTIVITY,
  PROFILE_TAB_STATS,
]

export const PROFILE_LIBRARY_SECTION_WATCHING = {
  id: 'watching' as const,
  label: 'درحال تماشا',
}
export const PROFILE_LIBRARY_SECTION_FAVORITES = {
  id: 'favorites' as const,
  label: 'علاقه‌مندی‌ها',
}
export const PROFILE_LIBRARY_SECTION_PLAYLISTS = {
  id: 'playlists' as const,
  label: 'پلی‌لیست‌ها',
}

const LEGACY_TAB_MAP: Record<string, ProfileTabId> = {
  library: 'library',
  activity: 'activity',
  stats: 'stats',
  watching: 'library',
  favorites: 'library',
  playlists: 'library',
  personal: 'library',
}

const LEGACY_LIB_MAP: Record<string, ProfileLibrarySectionId> = {
  watching: 'watching',
  favorites: 'favorites',
  playlists: 'playlists',
  personal: 'watching',
}

export const parseProfileTab = (raw: string | null): ProfileTabId => {
  if (raw && LEGACY_TAB_MAP[raw]) return LEGACY_TAB_MAP[raw]
  return DEFAULT_PROFILE_TAB
}

export const parseProfileLibrarySection = (
  tabRaw: string | null,
  libRaw: string | null
): ProfileLibrarySectionId => {
  if (libRaw === 'watching' || libRaw === 'favorites' || libRaw === 'playlists') {
    return libRaw
  }
  if (tabRaw && LEGACY_LIB_MAP[tabRaw]) return LEGACY_LIB_MAP[tabRaw]
  return 'watching'
}

export const isLegacyProfileTab = (raw: string | null): boolean =>
  raw === 'watching' ||
  raw === 'favorites' ||
  raw === 'playlists' ||
  raw === 'personal'

export const profileRouteSearch = (
  tab: ProfileTabId = DEFAULT_PROFILE_TAB,
  lib: ProfileLibrarySectionId = 'watching'
): string => {
  const qs = new URLSearchParams()
  if (tab !== DEFAULT_PROFILE_TAB) qs.set('tab', tab)
  if (tab === 'library' && lib !== 'watching') qs.set('lib', lib)
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export const legacyProfileRedirectPath = (
  raw: string | null,
  profileBase = '/profile'
): string => {
  const tab = parseProfileTab(raw)
  const lib = parseProfileLibrarySection(raw, null)
  return `${profileBase}${profileRouteSearch(tab, lib)}`
}

export const isAllowedProfileTab = (
  tab: ProfileTabId,
  _ctx: { isOwnProfile: boolean; hasPublicPlaylists: boolean }
): boolean => PROFILE_MAIN_TABS.some((t) => t.id === tab)
