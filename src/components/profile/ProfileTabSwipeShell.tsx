import type { ReactNode } from 'react'
import { TabSwipeArea, TAB_SWIPE_FIXED_HEADER_CLASS } from '@/components/TabSwipeArea'
import { ExploreTabBar } from '@/components/explore/ExploreUi'
import type { ProfileTabConfig, ProfileTabId } from '@/components/profile/profileTabs'
import { cn } from '@/lib/utils'

type ProfileTabSwipeShellProps = {
  tabs: ProfileTabConfig[]
  active: ProfileTabId
  onChange: (tab: ProfileTabId) => void
  children: ReactNode
  tabBarClassName?: string
  panelClassName?: string
}

export const ProfileTabSwipeShell = ({
  tabs,
  active,
  onChange,
  children,
  tabBarClassName,
  panelClassName,
}: ProfileTabSwipeShellProps) => {
  const tabIds = tabs.map((tab) => tab.id)

  return (
    <TabSwipeArea
      tabs={tabIds}
      active={active}
      onChange={onChange}
      className={cn('flex flex-col', TAB_SWIPE_FIXED_HEADER_CLASS)}
    >
      <div
        className={cn(
          'sticky top-[var(--app-sticky-top)] z-10 mx-4 mt-5 shrink-0',
          'bg-background/95 py-1 backdrop-blur-md supports-[backdrop-filter]:bg-background/80',
          tabBarClassName
        )}
      >
        <ExploreTabBar tabs={[...tabs]} active={active} onChange={onChange} />
      </div>
      <div className={cn('mx-4 mt-4 flex-1 min-h-0', panelClassName)}>{children}</div>
    </TabSwipeArea>
  )
}
