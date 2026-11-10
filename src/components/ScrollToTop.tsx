import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { resetWindowScroll } from '../utils/resetWindowScroll'

/**
 * Scroll to top on forward navigations. Back/forward (POP) is left to each
 * page's scroll restoration so returning to Home/Explore keeps position.
 *
 * Also skip when replacing onto a root tab that already has a saved scroll
 * (Telegram back fallback uses replace when history stack is empty).
 */
/** Root tabs that restore their own scroll on REPLACE (not nested subpages). */
const keepsSavedScroll = (pathname: string) =>
  pathname === '/' ||
  pathname === '/feed' ||
  pathname === '/my-list' ||
  pathname.startsWith('/explore') ||
  pathname === '/profile' ||
  /^\/u\/[^/]+\/?$/.test(pathname)

const ScrollToTop = () => {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType === 'POP') return

    // REPLACE onto Home/Explore after anime back-fallback — don't clobber restore.
    if (navigationType === 'REPLACE' && keepsSavedScroll(pathname)) {
      return
    }

    resetWindowScroll()
    const raf = requestAnimationFrame(() => {
      resetWindowScroll()
    })
    return () => cancelAnimationFrame(raf)
  }, [pathname, navigationType])

  return null
}

export default ScrollToTop
