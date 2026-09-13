import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { resetWindowScroll } from '../utils/resetWindowScroll'

/**
 * Scroll to top on forward navigations. Back/forward (POP) is left to each
 * page's scroll restoration so returning to Home/Explore keeps position.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType === 'POP') return

    resetWindowScroll()
    const raf = requestAnimationFrame(() => {
      resetWindowScroll()
    })
    return () => cancelAnimationFrame(raf)
  }, [pathname, navigationType])

  return null
}

export default ScrollToTop
