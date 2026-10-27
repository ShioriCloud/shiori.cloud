import { ExploreTabBar } from '@/components/explore/ExploreUi'
import {
  PROFILE_TAB_ROW_PRIMARY,
  buildOwnProfileTabRowLibrary,
  buildPublicProfileTabRowLibrary,
  type ProfileTabId,
} from '@/components/profile/profileTabs'
import { cn } from '@/lib/utils'

type ProfileDualRowTabBarProps = {
  active: ProfileTabId
  onChange: (tab: ProfileTabId) => void
  isOwnProfile: boolean
  hasPublicPlaylists?: boolean
  className?: string
}

export const ProfileDualRowTabBar = ({
  active,
  onChange,
  isOwnProfile,
  hasPublicPlaylists = false,
  className,
}: ProfileDualRowTabBarProps) => {
  const libraryTabs = isOwnProfile
    ? buildOwnProfileTabRowLibrary()
    : buildPublicProfileTabRowLibrary(hasPublicPlaylists)

  return (
    <div className={cn('space-y-2', className)}>
      <ExploreTabBar tabs={PROFILE_TAB_ROW_PRIMARY} active={active} onChange={onChange} />
      <ExploreTabBar tabs={libraryTabs} active={active} onChange={onChange} />
    </div>
  )
}
