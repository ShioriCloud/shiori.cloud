import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_PROFILE_TAB,
  parseProfileTab,
  type ProfileTabId,
} from '@/components/profile/profileTabs'

export const useProfileTabParam = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab = parseProfileTab(rawTab)

  const setActiveTab = useCallback(
    (tab: ProfileTabId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (tab === DEFAULT_PROFILE_TAB) next.delete('tab')
          else next.set('tab', tab)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return { rawTab, activeTab, setActiveTab }
}
