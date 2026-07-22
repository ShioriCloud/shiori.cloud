import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppAuth } from '@/hooks/useAppAuth'
import { MyListTabBar, parseMyListTab, type MyListTabId } from '@/components/my-list/MyListTabBar'
import { WatchlistTab } from '@/components/my-list/WatchlistTab'
import { ShioriListsTab } from '@/components/my-list/ShioriListsTab'
import { HistoryTab } from '@/components/my-list/HistoryTab'
import { DownloadsTab } from '@/components/my-list/DownloadsTab'

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
    return (
      <div className="flex min-h-[60vh] items-center justify-center pb-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-400/30 border-t-primary-400" />
      </div>
    )
  }

  return (
    <div className="min-h-full pb-24">
      <div className="px-4 pt-4">
        <MyListTabBar active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="px-4 mt-4 my-list-enter">
        {activeTab === 'watchlist' && <WatchlistTab />}
        {activeTab === 'lists' && <ShioriListsTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'downloads' && <DownloadsTab />}
      </div>
    </div>
  )
}

export default MyList
