import { ExploreTabBar } from '@/components/explore/ExploreUi'

export type MyListTabId = 'watchlist' | 'lists' | 'history' | 'downloads'

export const MY_LIST_TABS: { id: MyListTabId; label: string }[] = [
  { id: 'watchlist', label: 'تماشا' },
  { id: 'lists', label: 'لیست‌ها' },
  { id: 'history', label: 'تاریخچه' },
  { id: 'downloads', label: 'دانلود' },
]

type Props = {
  active: MyListTabId
  onChange: (id: MyListTabId) => void
}

export const MyListTabBar = ({ active, onChange }: Props) => (
  <ExploreTabBar tabs={MY_LIST_TABS} active={active} onChange={onChange} />
)

export const parseMyListTab = (value: string | null): MyListTabId => {
  if (value === 'lists' || value === 'history' || value === 'downloads') return value
  return 'watchlist'
}
