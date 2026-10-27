import {
  PROFILE_LIBRARY_SECTION_FAVORITES,
  PROFILE_LIBRARY_SECTION_PLAYLISTS,
  PROFILE_LIBRARY_SECTION_WATCHING,
  type ProfileLibrarySectionId,
} from '@/components/profile/profileTabs'
import { ProfileLibrarySectionChips } from '@/components/profile/ProfileLibrarySectionChips'
import { ProfileWatchingTabPanel } from '@/components/profile/ProfileWatchingTabPanel'
import { ProfileFavoritesTabPanel } from '@/components/profile/ProfileFavoritesTabPanel'
import { ProfilePlaylistsTabPanel } from '@/components/profile/ProfilePlaylistsTabPanel'
import type { SocialProfileMe } from '@/services/socialProfile'

type WatchedItem = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileLibraryTabPanelProps = {
  variant: 'own' | 'public'
  section: ProfileLibrarySectionId
  onSectionChange: (section: ProfileLibrarySectionId) => void
  showPlaylistsChip: boolean
  profileUserId: string
  profileBase: string
  watchedItems?: WatchedItem[]
  favoriteListItems?: WatchedItem[]
  favoriteOrderIds?: Array<string | number>
  watchVisible?: boolean
}

export const ProfileLibraryTabPanel = ({
  variant,
  section,
  onSectionChange,
  showPlaylistsChip,
  profileUserId,
  profileBase,
  watchedItems = [],
  favoriteListItems = [],
  favoriteOrderIds,
  watchVisible = true,
}: ProfileLibraryTabPanelProps) => {
  const chips = [
    PROFILE_LIBRARY_SECTION_WATCHING,
    PROFILE_LIBRARY_SECTION_FAVORITES,
    ...(showPlaylistsChip ? [PROFILE_LIBRARY_SECTION_PLAYLISTS] : []),
  ]

  const activeSection =
    section === 'playlists' && !showPlaylistsChip ? 'watching' : section

  return (
    <div className="space-y-4">
      <ProfileLibrarySectionChips
        chips={chips}
        active={activeSection}
        onChange={onSectionChange}
      />

      {activeSection === 'watching' ? (
        <ProfileWatchingTabPanel
          variant={variant}
          watchedItems={watchedItems}
          watchVisible={watchVisible}
        />
      ) : null}
      {activeSection === 'favorites' ? (
        <ProfileFavoritesTabPanel
          variant={variant}
          items={favoriteListItems}
          orderedIds={favoriteOrderIds}
          profileBase={profileBase}
          watchVisible={watchVisible}
        />
      ) : null}
      {activeSection === 'playlists' && showPlaylistsChip ? (
        <ProfilePlaylistsTabPanel
          variant={variant}
          profileUserId={profileUserId}
          profileBase={profileBase}
        />
      ) : null}
    </div>
  )
}
