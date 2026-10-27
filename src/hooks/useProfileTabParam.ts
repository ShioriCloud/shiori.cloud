import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_PROFILE_TAB,
  parseProfileLibrarySection,
  parseProfileTab,
  type ProfileLibrarySectionId,
  type ProfileTabId,
} from '@/components/profile/profileTabs'

export const useProfileTabParam = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const rawLib = searchParams.get('lib')
  const activeTab = parseProfileTab(rawTab)
  const librarySection = parseProfileLibrarySection(rawTab, rawLib)

  const setActiveTab = useCallback(
    (tab: ProfileTabId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (tab === DEFAULT_PROFILE_TAB) next.delete('tab')
          else next.set('tab', tab)
          if (tab !== 'library') next.delete('lib')
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const setLibrarySection = useCallback(
    (section: ProfileLibrarySectionId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', 'library')
          if (section === 'watching') next.delete('lib')
          else next.set('lib', section)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return { rawTab, rawLib, activeTab, librarySection, setActiveTab, setLibrarySection }
}
