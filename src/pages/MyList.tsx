import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppAuth } from '@/hooks/useAppAuth'
import { BrandBootScreen } from '@/components/BrandBootScreen'
import { MyListTabBar, MY_LIST_TABS, parseMyListTab, type MyListTabId } from '@/components/my-list/MyListTabBar'
import { TabSwipeArea, TAB_SWIPE_FIXED_HEADER_CLASS } from '@/components/TabSwipeArea'
import { WatchlistTab } from '@/components/my-list/WatchlistTab'
import { ShioriListsTab } from '@/components/my-list/ShioriListsTab'
import { HistoryTab } from '@/components/my-list/HistoryTab'
import { DownloadsTab } from '@/components/my-list/DownloadsTab'
import { cn } from '@/lib/utils'

const MyList = () => {
  const { isReady } = useAppAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = parseMyListTab(searchParams.get('tab'))

  const setActiveTab = useCallback(
    (tab: MyListTabId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (tab === 'watchlist') next.delete('tab')
          else next.set('tab', tab)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  if (!isReady) {
    return <BrandBootScreen />
  }

  return (
    <TabSwipeArea
      tabs={MY_LIST_TABS.map((tab) => tab.id)}
      active={activeTab}
      onChange={setActiveTab}
      className={cn('pb-24', TAB_SWIPE_FIXED_HEADER_CLASS)}
    >
      <div className="shrink-0 px-4 pt-4">
        <MyListTabBar active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 px-4 mt-4 my-list-enter">
        {activeTab === 'watchlist' && <WatchlistTab />}
        {activeTab === 'lists' && <ShioriListsTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'downloads' && <DownloadsTab />}
      </div>
    </TabSwipeArea>
  )
}

export default MyList
