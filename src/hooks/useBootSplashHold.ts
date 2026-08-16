import { useEffect, useState } from 'react'
import { BOOT_SPLASH_MIN_MS } from '@/data/bootQuotes'

/**
 * Keep the boot splash up until auth is ready AND a minimum read time has passed.
 */
export function useBootSplashHold(isReady: boolean, minMs = BOOT_SPLASH_MIN_MS): boolean {
  const [minElapsed, setMinElapsed] = useState(minMs <= 0)

  useEffect(() => {
    if (minMs <= 0) {
      setMinElapsed(true)
      return
    }
    setMinElapsed(false)
    const timer = window.setTimeout(() => setMinElapsed(true), minMs)
    return () => window.clearTimeout(timer)
  }, [minMs])

  return !isReady || !minElapsed
}
