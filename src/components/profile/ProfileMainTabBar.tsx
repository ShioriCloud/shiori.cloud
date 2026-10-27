import { ExploreTabBar } from '@/components/explore/ExploreUi'
import { PROFILE_MAIN_TABS, type ProfileTabId } from '@/components/profile/profileTabs'
import { cn } from '@/lib/utils'

type ProfileMainTabBarProps = {
  active: ProfileTabId
  onChange: (tab: ProfileTabId) => void
  className?: string
}

export const ProfileMainTabBar = ({ active, onChange, className }: ProfileMainTabBarProps) => (
  <ExploreTabBar
    className={cn(className)}
    tabs={PROFILE_MAIN_TABS}
    active={active}
    onChange={onChange}
  />
)
